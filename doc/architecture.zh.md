# NanoMD - 架構

> 返回 [README](./README.zh.md)

## 概覽

```mermaid
graph LR
    User[使用者輸入] --> Editor[MDEditor]
    Editor -->|"init() 觸發渲染"| Viewer[MDViewer]
    Viewer -->|讀取每一行文字| Editor
    Viewer -->|Markdown| Trans["transToHTML()"]
    Parser[MDParser] -->|Markdown| Trans
    Editor -->|"download('html')"| Trans
    Trans -->|HTML 字串| Viewer
    Trans -->|HTML 字串| Parser
    Trans --> Funcs["set* 轉換函式<br/>src/function/"]
    Data["src/data.js<br/>CDN 資源注入"] --> Runtime[Material Symbols / Mermaid / code-prettify / NanoMD.css]
    Viewer --> Runtime
```

三個元件都不自行解析 Markdown，全部呼叫同一個 `transToHTML()`：`MDViewer` 帶入 hashtag 設定並固定使用擴充模式，`MDParser` 帶入 `standard` 旗標，`MDEditor` 只在匯出 HTML 時呼叫。

## Module: MDEditor

`contentEditable` 編輯器，每一行是一個 `<div>`，由子模組處理游標、選取、歷史、快捷鍵與工具列。

```mermaid
graph TB
    subgraph MDEditor["MDEditor（src/model/editor.js）"]
        Core[MDEditor 核心<br/>init / save / download / 格式化方法]
        Caret[editorCaret<br/>游標所在行與位移]
        Selection[editorSelection<br/>選取範圍]
        History[editorHistory<br/>快照式 undo / redo 堆疊]
        Keydown[editorKeydown<br/>按鍵組合對應]
        Tab[editorTab<br/>浮動工具列]
        Core --- Caret
        Core --- Selection
        Core --- History
        Core --- Keydown
        Core --- Tab
    end
    Keyboard[鍵盤事件] --> Keydown
    Tab -->|event.upload| Upload[使用者上傳函式]
    Core -->|event.save| Save[使用者儲存函式]
    Core -->|"viewer.init()"| Viewer[MDViewer]
    Core -->|匯出| File[.md / .html 檔案]
```

## Module: MDViewer

延遲渲染的預覽容器，渲染後處理複製按鈕、程式碼高亮與 Mermaid。

```mermaid
graph TB
    subgraph MDViewer["MDViewer（src/model/viewer.js）"]
        Init["init(txt)"]
        Timer[延遲計時器<br/>sync.delay]
        Pick[選擇內容<br/>txt / 編輯器文字 / emptyContent]
        Replace["replaceChildren()"]
        Copy[綁定複製按鈕]
        Poll[每 50ms 檢查 PR]
        Init --> Timer --> Pick
        Pick --> Trans["transToHTML()"]
        Trans --> Replace --> Copy --> Poll
    end
    Editor[MDEditor] -->|滾輪 deltaY| Scroll[sync.scroll]
    Scroll --> MDViewer
    Poll --> PR["PR.prettyPrint()"]
    Poll --> Mermaid["mermaid.run()"]
    VDOM[vDOM<br/>保留但未啟用] -.-> MDViewer
```

## Module: 轉換管線

`transToHTML()` 依固定順序執行轉換函式，已轉換的片段以 `{{tag-uuid}}` 佔位隔離，最後一次還原。

```mermaid
graph TB
    subgraph Pipeline["transToHTML()（src/function/）"]
        Escape[跳脫預處理<br/>\\* → @ast@、$ → @dollar@]
        Pre[setPreCode<br/>fenced code / Mermaid]
        Code[setCode<br/>行內 code]
        Media[setMedia / setMediaDefault<br/>圖片、影片]
        Link[setLink / setLinkStandard<br/>連結、YouTube / Vimeo]
        Font[setFont / setFontStandard<br/>粗體、標記、上下標]
        Block[setHeading / setHr / setTable]
        Quote[setBlockquote / setBlockquoteStandard<br/>引用、提示框]
        List[setList / setTabCode]
        Tag[setHashtag]
        Restore[還原佔位符與跳脫字元]
        Escape --> Pre --> Code --> Media --> Link --> Font --> Block --> Quote --> List --> Tag --> Restore
    end
    UUID[replaceWithUUID<br/>elementUUIDMap] -.-> Pipeline
    Standard{standard 為 true} -.->|略過擴充函式| Pipeline
```

## Module: 執行期資源

```mermaid
graph LR
    subgraph Data["src/data.js"]
        Inject[載入時插入 head]
        Dark[isDarkMode<br/>matchMedia 一次性讀取]
    end
    Inject --> Fonts[Material Symbols]
    Inject --> MermaidLib[Mermaid 11.4.1]
    Inject --> Prettify[code-prettify]
    Inject --> CSS[NanoMD.css]
    Dark --> Mode[style.mode auto]
```

## 資料流

```mermaid
sequenceDiagram
    participant U as 使用者
    participant E as MDEditor
    participant V as MDViewer
    participant T as transToHTML
    participant R as PR / mermaid
    U->>E: 輸入（keyup）
    E->>E: unsave()，寫入 history
    E->>V: init()
    V->>V: 重設計時器，等待 sync.delay
    V->>E: 讀取每一行 innerText
    V->>T: transToHTML(text, hashtag)
    T-->>V: HTML 字串
    V->>V: replaceChildren()、綁定複製按鈕
    loop 每 50ms
        V->>R: 檢查 PR 是否存在
    end
    V->>R: PR.prettyPrint()、mermaid.run()
```

## 狀態機

```mermaid
stateDiagram-v2
    [*] --> 已同步: 建構
    已同步 --> 未同步: 輸入（data-saved=0）
    未同步 --> 等待渲染: viewer.init()（data-saved=1）
    等待渲染 --> 未同步: 延遲內再次輸入
    等待渲染 --> 已同步: 計時結束並渲染
```

***

©️ 2024 [邱敬幃 Pardn Chiu](https://www.linkedin.com/in/pardnchiu)
