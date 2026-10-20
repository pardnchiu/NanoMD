# NanoMD - 技術文件

最後更新：2026-10-20

> 返回 [README](./README.zh.md)

## 前置需求

- 支援 ES2022 與 RegExp lookbehind、`\p{L}` 的瀏覽器：Chrome、Edge、Firefox、Safari 16.4+
- 在 Node.js 使用 ESM 時需 Node.js 22 以上；Node／Worker 只需要 `Parse()` 與 `html()`，不需要 DOM
- 啟用 Mermaid、KaTeX、Chart.js、code-prettify 時需可連線至 `cdn.jsdelivr.net`（可用 `Init()` 的 endpoint 改為自架網址）
- 從原始碼建置時需 Node.js 22 以上

## 安裝

### CDN（IIFE）

```html
<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@2.0.5/dist/parser.js"></script>
```

載入後提供全域 `MDParser`，並自動在 `<head>` 插入與 `parser.js` 同目錄的 `parser.css`。

### npm（ESM）

```bash
npm i @pardnchiu/nanomd
```

```javascript
import { MDParser } from "@pardnchiu/nanomd";
```

`dist/parser.esm.js` 同時提供具名匯出（`Parse`、`Init`、`Refresh`、`OnCopyClick`...）。打包工具會改變 `import.meta.url`，若自動載入的 `parser.css` 找不到，請自行引入：

```javascript
import "@pardnchiu/nanomd/parser.css";
```

### 從原始碼建置

```bash
git clone https://github.com/pardnchiu/NanoMD.git
cd NanoMD
npm install
npm run build:once
```

`build:once` 依序執行型別檢查、產出 `dist/parser.js`（IIFE 壓縮）、`dist/parser.debug.js`（IIFE 未壓縮）、`dist/parser.esm.js`（ESM）、`dist/types/`（`.d.ts`）與 `dist/parser.css`；`npm run build` 監看 `src/parser/*.ts` 與 `src/sass/*.scss` 並自動重建。

## 設定

### Init 選項

`Init(options, endpoint)` 設定縮排寬度並載入外部依賴，回傳的 Promise 在所有依賴載入完成後 resolve。

| 選項 | 型別 | 預設 | 說明 |
|---|---|---|---|
| `indent` | `number` | `4` | tab 換算的欄寬，影響巢狀清單與程式碼區塊縮排對齊 |
| `fileEndpoint` | `string` | `""` | 點擊檔案路徑時呼叫的網址，`{filepath}` 會替換為編碼後的路徑（如 `http://localhost:3000/v1/file/open?path={filepath}`）；未設定或缺少 `{filepath}` 時，路徑輸出為純文字 |
| `hashtagEndpoint` | `string` | `""` | `#tag` 的連結網址，`{tag}` 會替換為編碼後、不含 `#` 的標籤（如 `/tags/{tag}`）；未設定或缺少 `{tag}` 時，`#tag` 輸出為純文字 |
| `enable.mermaid` | `boolean` | `false` | 載入 Mermaid，渲染 ` ```mermaid ` 區塊 |
| `enable.latex` | `boolean` | `false` | 載入 KaTeX（JS＋CSS），渲染 ` ```math ` 與 `$...$` |
| `enable.highlight` | `boolean` | `false` | 載入 code-prettify，為程式碼區塊上色 |
| `enable.chartjs` | `boolean` | `false` | 載入 Chart.js，渲染 ` ```chartjs ` 區塊 |

### 依賴網址

第二個參數可覆寫任一依賴網址，未指定的沿用 `DEFAULT_ENDPOINT`：

| 鍵 | 預設 |
|---|---|
| `mermaidjs` | `https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js` |
| `katexjs` | `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js` |
| `katexcss` | `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css` |
| `googleprettifyjs` | `https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js` |
| `chartjs` | `https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js` |

KaTeX 的字型以相對路徑寫在 CSS 內，自架時 `fonts/` 需與 `katex.min.css` 放在同一層，且 `katexjs`、`katexcss` 應指向同一版本。

### 樣式

| 項目 | 說明 |
|---|---|
| 容器 | 輸出 HTML 放在 `class="nanomd"` 的元素內才會套用樣式 |
| 深色模式 | 預設跟隨 `prefers-color-scheme`；`data-mode="dark"` 強制深色、`data-mode="light"` 強制淺色 |
| 撐滿父元素 | `data-fill="1"` 讓容器絕對定位並填滿最近的定位祖先 |
| 依賴區塊 | mermaid／math／chartjs 未經 `Refresh` 渲染時只顯示一般程式碼區塊；渲染成功後外殼標上 `data-rendered`，改顯示圖表、公式或圖形 |
| 表格 | 表格依內容寬度顯示，儲存格超過 `32rem` 時換行；超出容器時在 `md-table-wrap` 內水平捲動 |
| 清單 | 巢狀清單依層級切換符號：`ul` 依序為 disc、circle、square、`+`、`-`、`>`；`ol` 依序為 decimal、upper-alpha、lower-alpha、upper-roman、lower-roman、`>`；任務項目不顯示符號 |
| 主題變數 | 在 `.nanomd` 上覆寫 `--text`、`--accent`、`--code-bg`、`--mark`、`--alert-note`... 等 CSS 變數 |

## 使用方式

### 基礎：渲染一段 Markdown

```html
<div id="preview" class="nanomd"></div>

<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@2.0.5/dist/parser.js"></script>
<script>
  const preview = document.getElementById("preview");
  preview.innerHTML = MDParser.Parse("# Hello\n\n這是 **NanoMD**。").html();
</script>
```

### 基礎：在 Node.js 輸出 HTML（SSR）

```javascript
import { MDParser } from "@pardnchiu/nanomd";

const html = MDParser.Parse("## 標題\n\n- [x] 完成\n- [ ] 待辦").html();
console.log(html);
```

Node 沒有 DOM，`Init()` 只會設定 `indent`、`fileEndpoint`、`hashtagEndpoint`，不會載入任何依賴；`Refresh()` 直接回傳。

### 進階：啟用 Mermaid、KaTeX、Chart.js 與上色

```javascript
import { MDParser } from "@pardnchiu/nanomd";

const preview = document.getElementById("preview");

function render(markdown) {
  preview.innerHTML = MDParser.Parse(markdown).html();
  return MDParser.Refresh(preview);
}

render(source);
MDParser.Init({ enable: { mermaid: true, latex: true, highlight: true, chartjs: true } })
  .then(() => render(source))
  .catch((err) => console.error(err.message));
```

依賴載入失敗時，Promise 以 `[Unavailable] <url>: failed to load` reject；尚未載入的依賴不會被渲染，對應區塊只顯示一般程式碼區塊。

### 進階：即時預覽（防抖）

```javascript
const input = document.querySelector("textarea");
let timer;

input.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    preview.innerHTML = MDParser.Parse(input.value).html();
    MDParser.Refresh(preview).catch((err) => console.error(err.message));
  }, 300);
});
```

### 進階：取得 AST 交給其他渲染器

```javascript
const ast = MDParser.Parse(source);
const nodes = ast.json();
await fetch("/render", { method: "POST", body: JSON.stringify(nodes) });
```

`json()` 回傳深拷貝的一般 `BlockNode[]`：沒有 `html()`、`undefined` 欄位會被移除，修改它不影響 `ast`。

### 進階：Hashtag 連結

```javascript
MDParser.Init({ hashtagEndpoint: "/tags/{tag}" });
preview.innerHTML = MDParser.Parse("發版紀錄 #nanomd #中文").html();
```

`#tag` 與全形 `＃tag` 輸出為 `<a class="md-link md-hashtag" href="/tags/nanomd">#nanomd</a>`；標籤可包含任何語系的文字、數字、組合符號與 `_`。緊接在文字、數字、`_`、`&`、`#`、`/` 之後的 `#`（如 `a#b`、`&#123;`、網址錨點）不視為標籤，程式碼、數學式、連結文字內與跳脫的 `\#` 也不轉換。

### 進階：複製按鈕回饋

點擊後 `Refresh()` 會在 `pre` 加上 `success` 或 `error` 一秒，`parser.css` 據此把按鈕文字從 `copy` 換成 `copied` 並切換程式碼底色。需要額外處理時再註冊 `OnCopyClick`：

```javascript
MDParser.OnCopyClick((success, pre) => {
  if (!success) showToast("複製失敗");
});
```

## API 參考

### 匯出

| 名稱 | 簽章 | 說明 |
|---|---|---|
| `MDParser` | 命名空間 | 以下所有匯出的集合；IIFE 的全域名稱 |
| `Parse` | `(content: string) => AST` | 解析 Markdown，回傳 AST |
| `AST.html` | `() => string` | 將 AST 輸出為 HTML 字串，含跳脫與 raw HTML 清洗 |
| `AST.json` | `() => BlockNode[]` | 回傳節點的深拷貝，為不含 `AST` prototype 的純 JSON 資料 |
| `Init` | `(options?: InitOptions, endpoint?: DependencyEndpoint) => Promise<void[]>` | 設定 `indent`、`fileEndpoint`、`hashtagEndpoint` 並載入啟用的依賴 |
| `Refresh` | `(container?: ParentNode) => Promise<void>` | 在容器內綁定複製按鈕與檔案連結點擊、渲染 Chart.js、KaTeX、prettify、Mermaid；未傳入時處理整份 `document`；容器尚未放進頁面時不處理並記錄 `[Invalid]` |
| `OnCopyClick` | `(handler: (success: boolean, pre: HTMLElement) => void) => void` | 註冊在內建 `success`／`error` 回饋之後執行的回呼；只保留最後一次註冊 |
| `DEFAULT_ENDPOINT` | `Required<DependencyEndpoint>` | 依賴的預設網址 |
| `PARSE_OPTIONS` | `{ indent: number; fileEndpoint: string; hashtagEndpoint: string }` | 目前的解析設定 |
| `ParseLines` | `(lines: string[], nested?: boolean) => BlockNode[]` | 區塊解析器本體，不處理註腳與參照連結 |

### 區塊節點（BlockNode）

| `type` | 欄位 | 對應語法 |
|---|---|---|
| `text` | `children: InlineNode[]` | 一般段落；相鄰行以值為 `"\n"` 的 `text` 節點連接 |
| `heading` | `level`、`children` | `#`～`######`、Setext（`===`／`---`） |
| `blockquote` | `tag?`、`children: BlockNode[]` | `>`；`tag` 為 `note`／`tip`／`important`／`warning`／`caution` |
| `list` | `ordered`、`children: ListItem[]` | `-`、`*`、`1.`；`ListItem.checked` 對應任務清單 |
| `table` | `align`、`children: TableRow[]` | GFM 表格，含 `:---`／`:---:`／`---:` 對齊 |
| `codeBlock` | `lang?`、`value` | ` ``` `／`~~~`（3 個以上、可巢狀）；`lang` 為 `mermaid`／`math`／`chartjs` 時另行渲染 |
| `html` | `value` | 以 HTML 標籤開頭的行 |
| `hr` | — | `***`、`---`、`___` |
| `break` | — | 空行，連續空行合併為一個 |
| `footnotes` | `children: Footnote[]` | 文末註腳區，依首次引用順序編號 |

### 行內節點（InlineNode）

| `type` | 欄位 | 對應語法 |
|---|---|---|
| `text` | `value` | 純文字 |
| `b`、`em`、`del`、`mark`、`sub`、`sup` | `children` | `**`／`__`、`*`／`_`、`~~`、`==`、`~x~`、`^x^`；`***` 為 `b` 包 `em` |
| `code` | `value` | 任意長度反引號，開頭與結尾數量相同 |
| `math` | `value` | `$...$` |
| `link` | `href`、`tag?`、`title?`、`width?`、`height?`、`children` | 行內與參照式連結、相對路徑、裸網址、檔案路徑、`![]()` 圖片與影片、`#tag`；`tag` 為 `image`／`video`／`youtube`／`vimeo`／`file`／`hashtag`（`href` 為不含 `#` 的標籤） |
| `footnoteRef` | `id`、`index` | `[^id]` |
| `br` | — | 段落或表格儲存格內的 `<br>`、`<br/>`、`<br />`；輸出為 `<br class="md-br">` |

圖片尺寸寫在 `![alt](src)` 後：`(300x200)`、`(50%x)`、`(x120)`、`(120)`；副檔名 `.mp4`／`.mov` 輸出為 `<video>`。

### 主要 CSS class

| class | 元素 |
|---|---|
| `md-line` | 段落 |
| `md-h1`～`md-h6` | 標題 |
| `md-bold` | 粗體 |
| `md-quote`、`md-alert`、`md-alert-{tag}`、`md-alert-title` | 引言與提示框 |
| `md-list`、`md-task` | 清單與任務項目 |
| `md-table-wrap`、`md-table` | 表格 |
| `md-link`、`md-file-link`、`md-hashtag`、`md-img`、`md-embed` | 連結、檔案連結（`data-path`，僅在設定 `fileEndpoint` 時輸出）、hashtag（僅在設定 `hashtagEndpoint` 時輸出）、圖片／影片、內嵌播放器 |
| `md-mermaid`、`md-latex`、`md-math`、`md-math-inline`、`md-chart` | 依賴渲染外殼 |
| `md-footnote-ref`、`md-footnotes` | 註腳引用與註腳區（錨點 `#md-fn-{index}`） |
| `prettyprint`、`copy` | 程式碼區塊與複製按鈕 |

***

©️ 2024 [邱敬幃 Pardn Chiu](https://www.linkedin.com/in/pardnchiu)
