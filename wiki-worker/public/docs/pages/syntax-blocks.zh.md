# 區塊語法

本頁涵蓋標題、段落與空行、引言與 GitHub 提示框、水平線與 raw HTML 行。

## 標題

| 寫法 | 輸出 |
|---|---|
| `#`～`######` 加空白與文字 | `md-h1`～`md-h6` |
| 文字下一行接 `===` | `md-h1`（Setext） |
| 文字下一行接 `---` | `md-h2`（Setext） |
| 任何標題，搭配 `Init({ parseHeading: true })` | 以相同 class 的 `<h1>`～`<h6>` 取代 `<span>`；見 [API 參考](/zh/parser-api) |

標題內可使用所有行內格式。

## 段落與空行

| 寫法 | 結果 |
|---|---|
| 相鄰的兩行文字 | 合併為同一段，中間以換行字元連接，畫面上顯示為空白 |
| 一個或多個空行 | 一個 `break` 節點，連續空行只輸出一次 |
| 文件結尾的空行 | 不輸出 |

## 引言與提示框

`>` 開頭的行組成引言，內容可再放任何區塊；`>>` 為巢狀引言。

第一行只寫 `[!NOTE]`、`[!TIP]`、`[!IMPORTANT]`、`[!WARNING]`、`[!CAUTION]`（不分大小寫）時，輸出為對應的提示框。同一行還有其他文字，或標記出現在巢狀引言內時，維持一般引言。

## 水平線

`***`、`---`、`___`，三個以上相同字元，中間可夾空白（如 `- - -`）。

## raw HTML

以 HTML 標籤開頭的整行原樣保留為 `html` 節點，輸出時移除危險標籤、事件屬性與 `javascript:` 網址，見 [安全性](/zh/security)。

## 範例

### 標題

1～6 級 ATX 標題搭配行內格式，以及 Setext 標題。

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
# Heading H1 *(1)*
## Heading H2 _(1)_
### Heading ~~H3~~
#### Heading ==H4==
##### Heading H5
###### Heading H6

Setext H1^(2)^
===

Setext H2~(2)~
---
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### 段落與空行

相鄰兩行合併為同一段；連續三個空行只輸出一個 break。

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Paragraph merge: two adjacent lines
become one paragraph joined by a soft break.

Three blank lines below produce a single break.



This line follows the merged break.
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### 引言與提示框

巢狀引言、五種 GitHub 提示框，以及維持一般引言的標記寫法。

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
> First quote line
> Second quote line **bold**
>> Nested quote **bold**

> [!NOTE]
> Useful information users should know, even when skimming.

> [!TIP]
> Helpful advice, with **bold** and `code`.

> [!IMPORTANT]
> Key information users need to know.
>
> - Lists work inside
> - Second item

> [!WARNING]
> Urgent info that needs immediate attention.

> [!CAUTION]
> Advises about risks or negative outcomes.

Not alerts (marker only, text on the marker line, nested in a quote):

> [!NOTE]

> [!TIP] text on the same line

> Outer quote
>> [!WARNING]
>> Marker inside a nested quote
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### 水平線與 `|`

三種水平線寫法，以及含 `|` 但不是表格的行。

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Lines containing | that are not tables keep their block type:

# Heading A | B

> Quote a | b

***

- - -

___
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```
