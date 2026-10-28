# Hashtag 連結

設定 `hashtagEndpoint` 後，文件中的 `#tag` 會變成連到你指定網址的連結，例如自己的標籤頁；本頁說明標籤辨識規則與設定方式。

## 辨識為標籤的寫法

| 寫法 | 範例 |
|---|---|
| `#` 後接任何語系的文字、數字、組合符號或 `_` | `#nanomd`、`#中文標籤`、`#123`、`#snake_case` |
| 全形 `＃` | `＃全形` |
| 包在其他行內樣式內 | `**#bold**` |
| 標題文字內 | `# heading #tag` |

標籤在第一個非文字、數字、組合符號或 `_` 的字元處結束，因此 `#tag.` 的 `.` 不在連結內。

| 不視為標籤 | 範例 |
|---|---|
| 緊接在文字、數字、`_`、`&`、`#`、`/` 之後的 `#` | `a#b`、`&#123;`、`##x` |
| 網址錨點 | `https://nanomd.pardn.io/#frag` |
| 行內程式碼與行內數學式 | `` `#code` ``、`$#x$` |
| 跳脫 | `\#escaped` |
| 連結文字內 | `[label #x](https://nanomd.pardn.io)` |

## 設定

```javascript
MDParser.Init({ hashtagEndpoint: "/tags/{tag}" });
```

| 項目 | 規則 |
|---|---|
| `{tag}` | 替換為不含 `#` 的 `encodeURIComponent(標籤)`，可出現多次 |
| 未設定 | `#tag` 輸出為純文字，保留原本的 `#` 或 `＃` |
| 不是字串或缺少 `{tag}` | 記錄 `[Invalid] hashtagEndpoint: must be a string containing {tag}`，視同未設定 |
| 輸出 | `<a href="..." target="_blank" rel="noopener" class="md-link md-hashtag">#tag</a>` |
| AST | 不論是否設定，都是 `{ type: "link", tag: "hashtag", href: "tag", children: [{ type: "text", value: "#tag" }] }` |

endpoint 在 `html()` 執行時才讀取，設定 `hashtagEndpoint` 後要重新呼叫 `Parse().html()`。

## 範例

### 未設定 hashtagEndpoint

標籤維持純文字。

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
標籤：#nanomd #中文標籤 ＃全形 #123
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  console.log(out.querySelectorAll(".md-hashtag").length);
</script>
```

### 設定 hashtagEndpoint

標籤變成 `md-hashtag` 連結；第二行是不會轉換的寫法。

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
標籤：#nanomd #中文標籤 ＃全形 #123、**#粗體**

不轉換：a#b、&#123;、https://nanomd.pardn.io/#frag、`#code`、\#跳脫、[連結文字 #x](https://nanomd.pardn.io)
</script>
<script>
  const out = document.getElementById("out");
  MDParser.Init({ hashtagEndpoint: "https://github.com/topics/{tag}" });
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  console.log([...out.querySelectorAll(".md-hashtag")].map((a) => a.getAttribute("href")).join("\n"));
</script>
```
