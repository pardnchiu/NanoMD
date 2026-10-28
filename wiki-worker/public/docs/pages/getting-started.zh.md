# 快速開始

本頁安裝 NanoMD，並在瀏覽器與 Node.js 把第一段 Markdown 轉成 HTML。

## 前置需求

| 項目 | 需求 |
|---|---|
| 瀏覽器 | 支援 ES2022、RegExp lookbehind 與 `\p{L}`：Chrome、Edge、Firefox、Safari 16.4+ |
| Node.js | 22 以上（使用 ESM 或 `require()` 時） |
| 網路 | 啟用 Mermaid、KaTeX、Chart.js、code-prettify 時需連線至 `cdn.jsdelivr.net`，見 [依賴與渲染](/zh/runtime-dependencies) |

## 安裝

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@2.0.6/dist/parser.js"></script>
```

載入後提供全域 `MDParser`，並自動在 `<head>` 插入同目錄的 `parser.css`。

### npm

```bash
npm i @pardnchiu/nanomd
```

```javascript
import { MDParser } from "@pardnchiu/nanomd";
```

`require("@pardnchiu/nanomd")` 在 Node.js 22 也可使用。使用打包工具時若樣式沒有自動載入，再加上 `import "@pardnchiu/nanomd/parser.css";`。

## 第一次渲染

`Parse()` 回傳 AST，`html()` 把它轉成 HTML；輸出要放進 `class="nanomd"` 的容器才會套用樣式。

```demo
<div id="preview" class="nanomd"></div>
<script>
  const md = "# Hello\n\nThis is **NanoMD**.\n\n- [x] Parse\n- [ ] Render";
  document.getElementById("preview").innerHTML = MDParser.Parse(md).html();
</script>
```

## 在 Node.js 輸出 HTML

`Parse()` 與 `html()` 不需要 DOM，可用於 SSR 或建置流程。

```javascript
import { MDParser } from "@pardnchiu/nanomd";

const html = MDParser.Parse("## Title\n\n- [x] Done").html();
console.log(html);
```

## 啟用圖表、數學式與上色

`Init()` 載入啟用的依賴，`Refresh()` 在已放進頁面的容器內渲染。依賴載入前，這些區塊顯示為一般程式碼區塊。

```demo
<div id="out" class="nanomd"></div>
<script>
  const md = "~~~math\nE = mc^2\n~~~\n\n~~~mermaid\nflowchart LR\n  A[Markdown] --> B[AST] --> C[HTML]\n~~~";
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(md).html();
  MDParser.Init({ enable: { mermaid: true, latex: true } })
    .then(() => MDParser.Refresh(out))
    .then(() => console.log("rendered:", out.querySelectorAll("[data-rendered]").length))
    .catch((err) => console.error(err.message));
</script>
```

## 下一步

| 想做的事 | 頁面 |
|---|---|
| 了解支援的語法 | [區塊語法](/zh/syntax-blocks)、[行內格式](/zh/syntax-inline) |
| 拿 AST 自行渲染 | [AST 節點](/zh/ast) |
| 從 v1 升級 | [v1 停用說明](/zh/v1-deprecated) |
