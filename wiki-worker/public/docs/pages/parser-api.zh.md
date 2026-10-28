# API 參考

`MDParser` 的所有匯出；IIFE 版本以全域 `MDParser` 提供，ESM 版本同時提供 `MDParser` 與同名的具名匯出。

## 匯出

| 名稱 | 簽章 | 說明 |
|---|---|---|
| `Parse` | `(content: string) => AST` | 解析 Markdown，回傳 AST |
| `AST.html` | `() => string` | 將 AST 輸出為 HTML，含跳脫與 raw HTML 清洗 |
| `AST.json` | `() => BlockNode[]` | 回傳節點的深拷貝，為不含 `html()` 的純 JSON 資料 |
| `Init` | `(options?: InitOptions, endpoint?: DependencyEndpoint) => Promise<void[]>` | 設定選項並載入啟用的依賴 |
| `Refresh` | `(container?: ParentNode) => Promise<void>` | 在已放進頁面的容器內渲染依賴、綁定複製與檔案連結 |
| `OnCopyClick` | `(handler: (success: boolean, pre: HTMLElement) => void) => void` | 註冊在內建 `success`／`error` 回饋之後執行的回呼，只保留最後一次 |
| `DEFAULT_ENDPOINT` | `Required<DependencyEndpoint>` | 依賴的預設網址 |
| `PARSE_OPTIONS` | `{ indent: number; fileEndpoint: string; hashtagEndpoint: string; parseHeading: boolean }` | 目前生效的選項 |
| `ParseLines` | `(lines: string[], nested?: boolean) => BlockNode[]` | 區塊解析器本體，不處理註腳與參照連結 |

## InitOptions

| 欄位 | 型別 | 預設 | 說明 |
|---|---|---|---|
| `indent` | `number` | `4` | tab 換算的欄寬 |
| `enable` | `{ mermaid?, latex?, highlight?, chartjs? }` | 全部 `false` | 要載入的依賴 |
| `fileEndpoint` | `string` | `""` | 檔案連結的網址，需含 `{filepath}`，見 [檔案連結](/zh/file-links) |
| `hashtagEndpoint` | `string` | `""` | `#tag` 連結的網址，需含 `{tag}`，見 [Hashtag 連結](/zh/hashtag-links) |
| `parseHeading` | `boolean` | `false` | 標題改輸出為 `<h1>`～`<h6>`，取代 `<span>`；只有布林值 `true` 會啟用 |

每次呼叫 `Init()` 都依當次的 `options` 重新設定；未帶的欄位回到預設值。

### 標題元素

設定 `parseHeading: true` 後，標題輸出為真正的標題元素，保留相同的 `md-h1`～`md-h6` class 與外觀；再次呼叫 `Init()` 且未帶此選項時改回 `<span>`。

```demo
<div id="out" class="nanomd"></div>
<script>
  const out = document.getElementById("out");
  const md = "# Title\n## Section";
  MDParser.Init({ parseHeading: true });
  out.innerHTML = MDParser.Parse(md).html();
  console.log(out.innerHTML);
  MDParser.Init();
  console.log(MDParser.Parse(md).html());
</script>
```

## DependencyEndpoint

| 鍵 | 預設 |
|---|---|
| `mermaidjs` | `https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js` |
| `katexjs` | `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js` |
| `katexcss` | `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css` |
| `googleprettifyjs` | `https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js` |
| `chartjs` | `https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js` |

## 複製回呼

```demo
<div id="out" class="nanomd"></div>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse("~~~js\nconst a = 1;\n~~~").html();
  MDParser.OnCopyClick((success, pre) => {
    console.log("copied:", success, pre.getAttribute("name"));
  });
  MDParser.Refresh(out);
  console.log(Object.keys(MDParser).join(", "));
</script>
```

節點型別見 [AST 節點](/zh/ast)。
