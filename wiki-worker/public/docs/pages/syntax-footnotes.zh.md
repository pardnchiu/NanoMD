# 註腳

本頁涵蓋註腳引用與定義、編號規則、多行定義與未定義引用的處理。

## 寫法

| 寫法 | 說明 |
|---|---|
| `文字[^1]`、`文字[^note]` | 引用；`id` 可用數字或文字，不分大小寫 |
| `[^1]: 內容` | 定義，只在最外層判斷；內容可使用行內格式，也可再引用其他註腳 |
| 定義下一行縮排 | 屬於同一個註腳，可接續多段 |
| 定義下一行未縮排的文字 | 併入同一段，遇到其他區塊開頭時結束 |

## 輸出

| 情況 | 結果 |
|---|---|
| 有定義的引用 | `<sup class="md-footnote-ref">` 連到 `#md-fn-{index}` |
| 編號 | 依首次引用的順序 1、2、3...；同一個註腳再次引用沿用同一編號 |
| 註腳區 | 文末附上 `<section class="md-footnotes">`，每項 `id="md-fn-{index}"` |
| 沒有定義的引用 | 原樣輸出為 `[^id]` 文字 |
| 沒被引用的定義 | 不輸出 |
| 程式碼內或跳脫的 `[^1]` | 不視為引用 |

## 範例

### 註腳

數字與具名註腳、重複與不分大小寫的引用、未定義的引用、註腳內引用註腳，以及沒被引用的定義。

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Footnotes: first[^1], named[^note], again[^1], different case[^NOTE], undefined[^missing], not in code `[^1]`, escaped \[^1]

[^note]: Named footnote content with **bold**, referencing another footnote[^nested]
    Indented second paragraph

[^1]: First footnote content
continuing the same paragraph

[^nested]: A footnote referenced from a footnote

[^unused]: Unreferenced footnotes are not output
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```
