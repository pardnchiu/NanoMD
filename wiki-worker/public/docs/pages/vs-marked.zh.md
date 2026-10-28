# Markdown 輸出比較：NanoMD 與 marked

本頁以 NanoMD 與 [marked](https://marked.js.org) 18.1.1 並排渲染同一份 Markdown，並比較解析速度。

## 差異

| 項目 | NanoMD `Parse().html()` | marked `marked.parse()` |
|---|---|---|
| 輸出結構 | 帶 class 的元素，如 `<span class="md-h1">`、`<span class="md-line">`，由 `.nanomd` 內的 `parser.css` 套用樣式，見 [HTML 輸出](/zh/html-output) | 標準的 `<h1>`、`<p>` 等標籤，不附樣式 |
| `==mark==`、`H~2~O`、`x^2^` | `<mark>`、`<sub>`、`<sup>` | 保留為文字；`~2~` 變成 `<del>` |
| `> [!NOTE]` 提示區塊 | 帶標題的 `md-alert` 引用區塊 | 一般引用區塊，保留 `[!NOTE]` 文字 |
| 註腳 `[^1]` | 參照連結與註腳區 | 保留為文字 |
| 裸網址 | 帶 `target="_blank"` 的連結 | 連結 |
| 原始 HTML 的事件屬性（`onload`） | 移除 | 保留並執行 |
| `javascript:` 連結 | 不轉成連結 | 保留為 `href` |
| JSON AST | `Parse()` 先回傳樹狀結構再 `html()`，見 [AST 節點](/zh/ast) | `marked.lexer()` 的 token 陣列 |

## 避免 XSS

Markdown 常來自使用者輸入，渲染器決定了一則留言或筆記能不能在頁面上執行腳本。NanoMD 會消毒自己的輸出；marked [不消毒輸出](https://github.com/markedjs/marked#readme)，需要自行把 HTML 交給 DOMPurify 等消毒函式庫處理。

| 輸入 | NanoMD | 未加消毒的 marked |
|---|---|---|
| `[click](javascript:console.log('clicked'))` | 不轉成連結，Markdown 原文以純文字顯示，沒有可點擊的目標，內容也不會消失 | `<a href="javascript:...">`，點擊即執行腳本 |
| `<img src="..." onload="...">` | 移除 `onload`，保留圖片 | 保留 `onload`，圖片載入時執行 |

只有 `http(s)`、`mailto:`、`tel:`、相對路徑與 `#錨點` 會轉成連結。下方範例中，`[click](javascript:...)` 在 NanoMD 那側顯示為文字，只有 marked 那側會在 log 輸出 `onload ran`。完整的跳脫與消毒規則見[安全性](/zh/security)。

## 速度

將本站的文件頁合併成一份文件，重複放大到各尺寸後，在 macOS 的 headless Chrome 155 量測轉成 HTML 的耗時。每個案例先暖機 5 次，再連續執行至少 1.5 秒取平均。

| 文件大小 | NanoMD `Parse().html()` | marked `marked.parse()` | marked / NanoMD |
|---|---|---|---|
| 6.1 KB | 0.097 ms | 0.127 ms | 1.30× |
| 42.2 KB | 0.87 ms | 1.08 ms | 1.24× |
| 405.2 KB | 9.15 ms | 10.2 ms | 1.11× |
| 1.00 MB | 23.1 ms | 26.3 ms | 1.14× |
| 2.00 MB | 44.6 ms | 53.9 ms | 1.21× |
| 4.00 MB | 88.3 ms | 101.7 ms | 1.15× |

兩者輸出的結構不同，數字代表同一量級而非完全相同的工作量：NanoMD 另外建立 AST 並消毒 HTML，輸出也大約多 16%。

## 範例

### 同一份 Markdown，兩種渲染

左側為 NanoMD，右側為 marked。圖片的 `onload` 只在 marked 那側執行，並輸出到下方 log。

```demo
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem">
  <section><h4>NanoMD</h4><div id="nano" class="nanomd"></div></section>
  <section><h4>marked</h4><div id="marked"></div></section>
</div>
<script type="text/markdown" id="md">
# Release Notes

**Bold**, *italic*, ~~deleted~~, ==marked==, H~2~O, x^2^ and `code`.

> [!NOTE]
> GitHub alert blockquote.

- [x] Task done
- [ ] Task pending
  - Nested item

| Left | Center | Right |
|:---|:---:|---:|
| a | b | c |

Footnote reference[^1] and https://nanomd.pardn.io bare URL.

~~~js
console.log("hello");
~~~

<img src="/static/image/dog-7128749_640.jpg" width="120" onload="console.log('onload ran')">

[click](javascript:console.log('clicked'))

[^1]: Footnote definition.
</script>
<script type="module">
  import { marked } from "https://cdn.jsdelivr.net/npm/marked@18.1.1/lib/marked.esm.js";

  const md = document.getElementById("md").textContent;
  document.getElementById("nano").innerHTML = MDParser.Parse(md).html();
  document.getElementById("marked").innerHTML = marked.parse(md);
</script>
```

### 在你的瀏覽器量測

按下按鈕後，將範例重複放大到約 10 KB、100 KB、1 MB，各案例執行一秒，結果表格由 NanoMD 渲染。

```demo
<button id="run">Run benchmark</button>
<div id="result" class="nanomd"></div>
<script type="text/markdown" id="md">
## Section

Paragraph with **bold**, *italic*, `code`, a [link](https://nanomd.pardn.io) and ~~deleted~~ text.

- Item one
- Item two
  1. Nested ordered
  2. Another

| Name | Value |
|---|---:|
| alpha | 1 |
| beta | 2 |

> Quoted line with *emphasis*.

~~~js
const sum = (a, b) => a + b;
~~~
</script>
<script type="module">
  import { marked } from "https://cdn.jsdelivr.net/npm/marked@18.1.1/lib/marked.esm.js";

  const base = document.getElementById("md").textContent;
  const button = document.getElementById("run");
  const result = document.getElementById("result");
  const nano = (s) => MDParser.Parse(s).html();
  const mark = (s) => marked.parse(s);

  function bench(fn, input) {
    for (let i = 0; i < 10; i++) fn(input);
    let runs = 0;
    const start = performance.now();
    while (performance.now() - start < 1000) {
      fn(input);
      runs++;
    }
    return (performance.now() - start) / runs;
  }

  button.addEventListener("click", async () => {
    button.disabled = true;
    const rows = ["| Size | NanoMD | marked | marked / NanoMD |", "|---|---|---|---|"];
    for (const kb of [10, 100, 1000]) {
      result.innerHTML = MDParser.Parse(`Running ${kb} KB...`).html();
      await new Promise((r) => setTimeout(r, 50));
      const input = Array(Math.ceil((kb * 1024) / base.length)).fill(base).join("\n");
      const a = bench(nano, input);
      const b = bench(mark, input);
      rows.push(`| ${(input.length / 1024).toFixed(1)} KB | ${a.toFixed(3)} ms | ${b.toFixed(3)} ms | ${(b / a).toFixed(2)}× |`);
    }
    result.innerHTML = MDParser.Parse(rows.join("\n")).html();
    console.log(navigator.userAgent);
    button.disabled = false;
  });
</script>
```
