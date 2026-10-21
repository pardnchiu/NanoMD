# NanoMD - 架構

最後更新：2026-10-21

> 返回 [README](./README.zh.md)

## 概覽

```mermaid
graph TB
    Input[Markdown 文字] --> Parse["Parse()"]
    Parse --> Reset[重設註腳與連結定義]
    Reset --> Lines[ParseLines 區塊解析]
    Lines --> Inline[ParseInline 行內解析]
    Lines --> Post[AppendFootnotes／RestoreLinkRefs]
    Post --> AST[AST 陣列]
    AST --> JSON[JSON 給原生渲染（自行開發）]
    AST --> HTML["AST.html() HTML 字串"]
    HTML --> DOM[寫入 .nanomd 容器]
    DOM --> Refresh["Refresh() 依賴渲染"]
    Init["Init() 載入依賴"] --> Refresh
    Load[模組載入] --> CSS[自動插入 parser.css]
```

## Module: 區塊解析（ParseLines）

逐行判斷區塊類型，判斷順序即優先權；巢狀內容（引言、清單項目、註腳）遞迴呼叫 `ParseLines`。

```mermaid
graph TB
    subgraph ParseLines
        Line[目前行] --> Blank{空行?}
        Blank -->|是| Break[break 節點，連續空行合併]
        Blank -->|否| Code[ParseCodeBlock]
        Code --> HTML[raw HTML 行]
        HTML --> Table[ParseTableBlock]
        Table --> HR[水平線]
        HR --> Quote[ParseBlockquote 含提示框]
        Quote --> Foot[ParseFootnoteBlock 僅頂層]
        Foot --> LinkDef[ParseLinkDefBlock]
        LinkDef --> List[ParseListBlock]
        List --> Heading[ParseHeading ATX／Setext]
        Heading --> Text[一般行，相鄰行合併為段落]
    end
    Quote -.遞迴.-> ParseLines
    List -.遞迴.-> ParseLines
    Foot -.遞迴.-> ParseLines
    Text --> ParseInline[ParseInline]
```

## Module: 行內解析（ParseInline）

整行先以佔位符遮罩不可再被樣式比對的內容（含行內程式碼），再比對樣式，因此樣式可跨越行內程式碼。

```mermaid
graph TB
    subgraph ParseInline
        Seg[整行文字] --> Mask[ParseLink 遮罩]
        Mask --> M0[行內程式碼 任意長度反引號]
        M0 --> Path{內容為路徑?}
        Path -->|是| File[link tag=file]
        Path -->|否| CodeNode[code 節點]
        Mask --> M1[行內數學式 $...$]
        Mask --> M2[跳脫字元]
        Mask --> M3["註腳引用 [^id]"]
        Mask --> M4[連結／圖片／參照連結／路徑／裸網址]
        M4 --> Marks[樣式比對 粗斜體 刪除 標記 上下標]
        Marks --> Restore[RestoreLinks 還原佔位符]
    end
```

## Module: 後處理

解析完成後一次處理需要全文資訊的節點。

```mermaid
graph LR
    subgraph 後處理
        Refs[footnoteRef 節點] --> Number[依首次引用編號]
        Number --> Missing{有定義?}
        Missing -->|否| BackText1["還原為 [^id] 文字"]
        Missing -->|是| Section[footnotes 區塊附加到文末]
        LinkRef[linkRef 節點] --> Def{有定義?}
        Def -->|是| Link[link 節點]
        Def -->|否| BackText2["還原為 [label][ref] 文字"]
    end
```

## Module: HTML 輸出（AST.html）

`AST` 繼承 `Array`，`html()` 掛在 prototype，依節點類型輸出，跳脫在輸出時進行。

```mermaid
graph TB
    subgraph html
        Node[BlockNode] --> Render[render]
        Render --> Block[renderBlockquote／renderTable／renderList／renderFootnote]
        Render --> CodeBlock[renderCodeBlock]
        CodeBlock --> Wrap{lang}
        Wrap -->|mermaid| MW[md-mermaid 外殼＋備用程式碼]
        Wrap -->|math| LW[md-latex 外殼＋備用程式碼]
        Wrap -->|chartjs| CW[md-chart canvas，設定不合法直接輸出程式碼]
        Wrap -->|其他| Pre[prettyprint 程式碼區塊]
        Render --> Inline[renderInline／renderLink]
        Inline --> FileLink{有 fileEndpoint?}
        FileLink -->|是| FileA[md-file-link 連結]
        FileLink -->|否| FileText[純文字路徑]
        Inline --> TagLink{有 hashtagEndpoint?}
        TagLink -->|是| TagA[md-hashtag 連結]
        TagLink -->|否| TagText[純文字 #tag]
        Render --> Raw[raw HTML 清洗]
    end
    Escape[escapeHTML／escapeAttr] --> Inline
    Escape --> Pre
```

## Module: 依賴與執行期（Init／Refresh）

`Init` 只負責載入，`Refresh` 在已輸出的 DOM 上渲染；兩者都只讀取全域上已存在的依賴。

```mermaid
graph TB
    subgraph Init
        Opt[options.enable] --> Insert[insertHead 依網址去重]
        Insert --> M[mermaid.min.js]
        Insert --> K[katex.min.js＋katex.min.css]
        Insert --> P[run_prettify.js]
        Insert --> C[chart.umd.min.js]
    end
    subgraph Refresh
        Guard{容器在頁面上?} -->|否| Skip[記錄 Invalid 並略過]
        Guard -->|是| Copy[bindCopy → OnCopyClick 回呼]
        File[bindFile → fetch fileEndpoint]
        Chart[renderChart 失敗改顯示程式碼]
        Latex[renderLatex 區塊失敗改顯示程式碼，行內還原為 $...$]
        PR[PR.prettyPrint]
        Mermaid[renderMermaid parse 預檢後以 mermaid.render 產生 SVG，失敗改顯示程式碼]
        Done[成功者標上 data-rendered，隱藏備用程式碼]
    end
    Module[模組載入] --> URL[currentScript.src 或 import.meta.url]
    URL --> CSS[同目錄 parser.css]
```

## 資料流

```mermaid
sequenceDiagram
    participant App as 使用端
    participant P as MDParser
    participant DOM as .nanomd 容器
    participant CDN as 依賴 CDN
    App->>P: 載入 parser.js
    P->>DOM: 插入 parser.css
    App->>P: Parse(markdown)
    P-->>App: AST
    App->>P: ast.html()
    P-->>App: HTML 字串
    App->>DOM: innerHTML = HTML
    App->>P: Init({ enable })
    P->>CDN: 載入啟用的依賴
    CDN-->>P: 載入完成
    App->>P: Refresh(container)
    P->>DOM: 複製按鈕、圖表、數學式、上色、Mermaid
```

***

©️ 2024 [邱敬幃 Pardn Chiu](https://www.linkedin.com/in/pardnchiu)
