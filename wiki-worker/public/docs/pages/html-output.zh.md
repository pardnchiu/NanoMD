# HTML 輸出

`AST.html()` 把 `Parse()` 的結果轉成 HTML 字串；本頁說明輸出的結構與 class，以及它與 JSON AST 的分工。

## 用法

```javascript
const html = MDParser.Parse(markdown).html();
container.innerHTML = html;
```

`html()` 不需要 DOM，可在 Node.js、Worker 產生 HTML；放進頁面後再呼叫 `Refresh()` 渲染圖表與數學式，見 [依賴與渲染](/zh/runtime-dependencies)。

## 輸出結構

| 節點 | HTML |
|---|---|
| 段落 | `<span class="md-line">` |
| 標題 | `<span class="md-h1">`～`<span class="md-h6">`；`parseHeading` 為 `true` 時為 `<h1 class="md-h1">`～`<h6 class="md-h6">` |
| 空行 | `<br>` |
| 粗體 | `<span class="md-bold">`；其餘行內樣式使用 `<em>`、`<del>`、`<mark>`、`<sub>`、`<sup>` |
| 引言／提示框 | `<blockquote class="md-quote">`；提示框加上 `md-alert md-alert-{tag}` 與 `md-alert-title` |
| 清單 | `<ul class="md-list">`／`<ol class="md-list">`，任務項目為 `<li class="md-task">` |
| 表格 | `<div class="md-table-wrap"><table class="md-table">`；表格依內容寬度顯示，超出時在外層內捲動 |
| 程式碼區塊 | `<pre class="prettyprint" name="{lang}">`，每行一個 `<li>`，附 `<button class="copy">` |
| mermaid／math／chartjs | `md-mermaid`／`md-latex`／`md-chart` 外殼，內含備用的程式碼區塊 |
| 連結 | `<a class="md-link" target="_blank" rel="noopener">`，`mailto:`／`tel:` 連結不加 `target` 與 `rel`；圖片與影片為 `md-img`，YouTube／Vimeo 附 `md-embed`；檔案路徑與 `#tag` 只在設定對應 endpoint 時輸出 `md-file-link`／`md-hashtag` |
| 註腳 | `md-footnote-ref` 與 `md-footnotes` |

完整樣式見 [樣式主題](/zh/theming)。

## 與 JSON AST 的分工

| 需求 | 使用 |
|---|---|
| 在網頁或 SSR 顯示 | `html()` |
| 交給 iOS、Flutter 等原生渲染器 | `ast.json()`，渲染器需自行開發 |
| 檢查或改寫內容後再輸出 | 直接操作 `AST` 陣列，再呼叫 `html()` |

```demo
<div id="out" class="nanomd"></div>
<script>
  const ast = MDParser.Parse("# Title\n\n> [!NOTE]\n> Edited before output.");
  ast[0].children.push({ type: "text", value: " (edited)" });
  document.getElementById("out").innerHTML = ast.html();
  console.log(ast.html());
</script>
```
