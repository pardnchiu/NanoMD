# 安全性

`AST.html()` 在輸出時跳脫內容並清洗 raw HTML；本頁列出各類輸入會被如何處理。

## 跳脫

| 位置 | 處理 |
|---|---|
| 文字、行內程式碼、數學式、程式碼區塊 | `&`、`<` 轉為實體 |
| 屬性（`href`、`src`、`title`、`alt`、`data-*`、語言標籤） | `&`、`<`、`"` 轉為實體 |

AST 保留原文，跳脫只發生在 `html()`；自行渲染 AST 的程式需自行跳脫。

## 連結與網址

| 輸入 | 結果 |
|---|---|
| `[x](javascript:alert(1))` 等 `http(s)`、`mailto:`、`tel:` 以外的協定 | 不轉為連結，原樣輸出為文字 |
| 相對路徑、`#錨點` | 正常輸出為連結 |
| `mailto:`／`tel:` 連結 | 不加 `target` 與 `rel`，在同一頁開啟 |
| 其他連結 | 加上 `target="_blank" rel="noopener"` |

## raw HTML 清洗

以 HTML 標籤開頭的行輸出前會：

| 規則 | 範例 |
|---|---|
| 移除危險標籤（連同成對內容） | `<script>`、`<style>`、`<iframe>`、`<object>`、`<embed>`、`<form>`、`<link>`、`<meta>`、`<base>` |
| 移除事件屬性 | 前面有空白的 `onclick`、`onerror` 等所有 `on*`，含單引號、雙引號與無引號寫法；以 `/` 接在標籤名後的屬性（如 `<svg/onload=...>`）不會被比對 |
| 移除危險網址屬性 | `href`、`src`、`xlink:href`、`action`、`formaction` 的原始值以 `javascript:`、`vbscript:`、`data:text/html` 開頭；不先解碼 HTML entity，因此 `jav&#x61;script:` 會保留 |

這是以規則為基礎的清洗；顯示完全不受信任的內容時，建議再搭配 DOMPurify 等專用的 sanitizer。

## 範例

### raw HTML

raw HTML 行的事件屬性與 `javascript:` 網址會被移除。

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
<div onclick="alert(1)">raw HTML (onclick removed)</div>
<a href="javascript:alert(1)">javascript: href (removed)</a>

[x](javascript:alert(1)) stays text, and <b> in text is escaped
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
  console.log(out.innerHTML);
</script>
```
