# 依賴與渲染

`Init()` 按需載入 Mermaid、KaTeX、Chart.js、code-prettify，`Refresh()` 在頁面上的容器內渲染它們；本頁說明兩者的分工與退回行為。

## Init

```javascript
MDParser.Init({ enable: { mermaid: true, latex: true, highlight: true, chartjs: true } })
  .then(() => MDParser.Refresh(container))
  .catch((err) => console.error(err.message));
```

| `enable` 鍵 | 載入 | 渲染對象 |
|---|---|---|
| `mermaid` | Mermaid 11.4.1 | ` ```mermaid ` |
| `latex` | KaTeX 0.16.11（JS＋CSS） | ` ```math `、`$...$` |
| `highlight` | code-prettify | 程式碼區塊上色 |
| `chartjs` | Chart.js 4.5.1 | ` ```chartjs ` |

第二個參數可覆寫任一網址（`mermaidjs`、`katexjs`、`katexcss`、`googleprettifyjs`、`chartjs`），未指定者沿用 `DEFAULT_ENDPOINT`。同一網址只會插入一次；載入失敗時 Promise 以 `[Unavailable] <url>: failed to load` reject。Node.js 中 `Init()` 只設定選項，不載入任何依賴。

## Refresh

`Refresh(container)` 依序處理容器內的內容，未傳入時處理整份 `document`：

| 項目 | 行為 |
|---|---|
| 複製按鈕 | 綁定點擊，在 `pre` 標上 `success`／`error` 一秒，結果交給 `OnCopyClick` |
| 檔案連結 | 綁定點擊，呼叫 `fileEndpoint`，見 [檔案連結](/zh/file-links) |
| Chart.js | 依 `data-chart` 畫圖；先清除已離開頁面的舊圖表 |
| KaTeX | 區塊與行內數學式 |
| code-prettify | 為程式碼區塊上色 |
| Mermaid | 先檢查語法，再產生 SVG |

容器必須已經放進頁面；尚未放進頁面時不處理，並記錄 `[Invalid] container: not attached to the document`。

## 退回行為

| 情況 | 顯示 |
|---|---|
| 尚未呼叫 `Refresh()` 或依賴未載入 | 一般程式碼區塊 |
| 渲染成功 | 外殼標上 `data-rendered`，改顯示圖表、公式或圖形，程式碼區塊隱藏 |
| Mermaid 語法錯誤、區塊數學式錯誤、Chart.js 設定錯誤 | 換成一般程式碼區塊 |
| 行內數學式錯誤 | 還原為 `$...$` 文字 |

```demo
<div id="out" class="nanomd"></div>
<script>
  const md = "~~~math\n\\int_0^1 x\\,dx = \\frac{1}{2}\n~~~\n\nInline $a^2+b^2=c^2$, broken $\\frac{1}{$.";
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(md).html();
  console.log("before:", out.querySelectorAll("[data-rendered]").length);
  MDParser.Init({ enable: { latex: true } })
    .then(() => MDParser.Refresh(out))
    .then(() => console.log("after:", out.querySelectorAll("[data-rendered]").length))
    .catch((err) => console.error(err.message));
</script>
```
