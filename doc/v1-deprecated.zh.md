# NanoMD - v1 停用說明

最後更新：2026-10-20

> 返回 [README](./README.zh.md)

v2 改為只提供 Markdown 解析器 `MDParser`。v1 的 `MDEditor`、`MDViewer` 與 `MDParser` 類別已停用（deprecated），不再開發新功能；需要編輯器的專案請固定使用 1.11.6。

## 繼續使用 v1

```html
<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@1.11.6/dist/NanoMD.js"></script>
```

```bash
npm i @pardnchiu/nanomd@1.11.6
```

請寫明確的版本號；`@latest` 或不帶版本號會解析到 v2，`MDEditor`、`MDViewer` 會不存在。

## 移除項目與替代方式

| v1 | v2 |
|---|---|
| `MDEditor` | 移除；改用 `<textarea>`、CodeMirror、Monaco 等編輯器，內容交給 `MDParser.Parse()` |
| `MDViewer` | 移除；改為 `container.innerHTML = MDParser.Parse(text).html()` 後呼叫 `MDParser.Refresh(container)` |
| `new MDParser({ standard }).parse(text)` | `MDParser.Parse(text).html()`；`standard` 選項移除，一律支援完整語法 |
| `window.PDMarkdownEditor` | 移除 |
| ESM 匯出 `editor`、`viewer`、`MDViewer`、`MDEditor` | 移除；改為 `import { MDParser } from "@pardnchiu/nanomd"` |
| `MDViewer` 的 `sync.editor`、`sync.delay`、`sync.scroll` | 移除；自行監聽輸入並防抖（見 [技術文件](./doc.zh.md#進階即時預覽防抖)） |
| `MDViewer` 的 `emptyContent` | 移除；由呼叫端決定空內容時要渲染什麼 |
| `hashtag.path`、`hashtag.target`（`#tag` 連結） | 改用 `MDParser.Init({ hashtagEndpoint: "/tags/{tag}" })`，`{tag}` 標示標籤放入的位置，連結一律開新分頁 |
| `changeMode(mode)`、`style.mode` | 在 `.nanomd` 容器設定 `data-mode="dark"`／`"light"`，未設定時跟隨系統 |
| `style.fill` | 在 `.nanomd` 容器設定 `data-fill="1"` |
| `download()`、`openfile()`、匯出 HTML、部署按鈕 | 隨 `MDEditor` 移除 |
| 快捷鍵、復原／重做、浮動工具列 | 隨 `MDEditor` 移除 |

## 檔案與樣式

| v1 | v2 |
|---|---|
| `dist/NanoMD.js` | `dist/parser.js`（全域 `MDParser`） |
| `dist/NanoMD.esm.js` | `dist/parser.esm.js` |
| `dist/NanoMD.debug.js` | `dist/parser.debug.js` |
| `dist/NanoMD.css`、`dist/NanoMD-output.css` | `dist/parser.css`，由 `parser.js` 自動從同目錄載入 |
| 容器 class `.pd-md-viewer` | `.nanomd` |
| 容器 class `.pd-md-editor` | 移除 |
| 輸出元素（`h1`、`strong`、`table` 等原生標籤樣式） | `md-*` class（如 `.md-h1`、`.md-bold`、`.md-table`），完整列表見 [技術文件](./doc.zh.md#主要-css-class) |
| 載入時自動插入 Material Symbols、Mermaid、code-prettify | 不再自動載入；以 `MDParser.Init({ enable })` 按需載入 Mermaid、KaTeX、Chart.js、code-prettify |

## 行為差異

| 項目 | v1.11.6 | v2 |
|---|---|---|
| 文字中的 `$` | 輸出為 `@dollar@` | 原樣輸出；成對的 `$...$` 為行內數學式 |
| YouTube／Vimeo 預覽 | `MDViewer` 未設定 `hashtag.path` 時不產生 | 一律附上內嵌播放器 |
| raw HTML 與文字跳脫 | 不清洗，寫入 `innerHTML` 前需自行過濾 | 輸出時跳脫文字與屬性，raw HTML 移除危險標籤、事件屬性與 `javascript:` 網址 |
| Mermaid 語法錯誤 | 顯示 Mermaid 錯誤圖 | 改顯示為一般程式碼區塊 |
| 轉換速度 | 405 KB 文件約 1.4 秒，1 MB 約 8.9 秒，2 MB 起超過 15 秒（超時） | 405 KB 文件約 9 毫秒，1 MB 約 23 毫秒，4 MB 約 88 毫秒（見[效能比較](./README.zh.md#效能比較)） |
| 執行環境 | 需要瀏覽器 DOM | `Parse()`、`html()` 可在 Node.js、Worker 執行 |

v2 新增的語法：註腳、參照式連結、行內數學式、` ```math `、` ```chartjs `、`~~~` 與巢狀程式碼區塊、多反引號行內程式碼，完整列表見 [技術文件](./doc.zh.md#api-參考)。

## 遷移範例

v1：

```html
<section id="editor"></section>
<section id="viewer"></section>

<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@1.11.6/dist/NanoMD.js"></script>
<script>
  const editor = new MDEditor({ id: "editor", defaultContent: "# Hello" });
  const viewer = new MDViewer({ id: "viewer", sync: { editor: editor, delay: 300 } });
</script>
```

v2：

```html
<textarea id="editor"># Hello</textarea>
<div id="viewer" class="nanomd"></div>

<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@2.0.0/dist/parser.js"></script>
<script>
  const editor = document.getElementById("editor");
  const viewer = document.getElementById("viewer");
  let timer;

  function render() {
    viewer.innerHTML = MDParser.Parse(editor.value).html();
    MDParser.Refresh(viewer).catch((err) => console.error(err.message));
  }

  editor.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(render, 300);
  });

  render();
  MDParser.Init({ enable: { mermaid: true, highlight: true } })
    .then(render)
    .catch((err) => console.error(err.message));
</script>
```

***

©️ 2024 [邱敬幃 Pardn Chiu](https://www.linkedin.com/in/pardnchiu)
