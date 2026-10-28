# 行內格式

本頁涵蓋粗體、斜體、刪除線、標記、上下標、跳脫字元、行內程式碼與行內數學式。

## 樣式

| 寫法 | 輸出 | 說明 |
|---|---|---|
| `**粗體**`、`__粗體__` | `<span class="md-bold">` | `__` 前後緊接英數字時不轉換（如 `__init__x`） |
| `*斜體*`、`_斜體_` | `<em>` | `_` 夾在英數字中間時不轉換（如 `snake_case`） |
| `***粗斜體***`、`___粗斜體___` | 粗體包斜體 | |
| `~~刪除~~` | `<del>` | |
| `==標記==` | `<mark>` | |
| `H~2~O` | `<sub>` | 內容不可含空白 |
| `x^2^` | `<sup>` | 內容不可含空白 |

樣式可以包住連結，例如 `**[連結](https://nanomd.pardn.io)**`。

## 跳脫字元

反斜線加任一 ASCII 標點輸出該標點本身，例如 `\*`、`\_`、`` \` ``、`\[`、`\$`、`\\`。

## 行內程式碼

| 寫法 | 說明 |
|---|---|
| `` `code` `` | 內容不再解析其他語法 |
| `` **bold `code`** `` | 行內程式碼可放在粗體、斜體、刪除線等樣式內；程式碼裡的 `**` 不會結束樣式 |
| ```` `` a`b `` ```` | 開頭與結尾的反引號數量相同即可包住較短的反引號 |
| 內容前後各有一個空白 | 各去掉一個，方便包住以反引號開頭的內容 |
| 內容是檔案路徑 | 設定 `fileEndpoint` 時輸出為檔案連結，見 [檔案連結](/zh/file-links) |

## 行內數學式

`$...$` 輸出為 `md-math-inline`，啟用 KaTeX 後由 `Refresh()` 渲染，見 [依賴與渲染](/zh/runtime-dependencies)。下列情況不轉換：

| 寫法 | 原因 |
|---|---|
| `$5 與 $10` | 結尾的 `$` 後面緊接數字 |
| `$ a $` | `$` 內側緊接空白 |
| `$$a$$` | 連續兩個 `$` |
| `\$` | 已跳脫 |

## 範例

### 樣式

所有行內樣式。

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Inline: **bold**, __bold__, *italic*, _italic_, ***bold italic***, ___bold italic___, ~~deleted~~, ==marked==, H~2~O, x^2^, `code`
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### 跳脫與不轉換

跳脫的標記，以及刻意維持純文字的寫法。

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Escapes: \*not italic\*, \_\_not bold\_\_, \`not code\`, \[not a link\](https://a.com), \\ a backslash itself

Not converted: snake_case_name, __init__x, 2^10 and 3^ x, `a*b*c`
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### 行內程式碼

多反引號行內程式碼、不成對的反引號串與樣式內的程式碼。

`````demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Multi-backtick code: ```abc```, `` a`b ``, `` ``` ``, ``mismatched`, ```` a lone backtick run

Inside styles: **bold `code` here**, *`italic code`*, ~~`struck code`~~, **a `**` b**
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
`````

### 行內數學式

行內數學式以 KaTeX 渲染；語法錯誤時還原為 `$...$`，金額維持文字。

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Inline math: $E=mc^2$, $\frac{a}{b}$, $x_1 + x_2^{*}$, $\{a, b\}$, $\frac{1}{$ shows the source when invalid

Not math: prices $5 and $10, \$escaped\$, `$inside code$`, $ spaced $, $$a$$
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Init({ enable: { latex: true } })
    .then(() => MDParser.Refresh(out))
    .catch((err) => console.error(err.message));
</script>
```
