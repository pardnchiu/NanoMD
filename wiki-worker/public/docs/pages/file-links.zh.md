# 檔案連結

設定 `fileEndpoint` 後，文件中的本機檔案路徑會變成可點擊的連結，點擊時呼叫你指定的網址；本頁說明路徑辨識規則與設定方式。

## 辨識為路徑的寫法

| 寫法 | 範例 |
|---|---|
| `~/` 開頭 | `~/Desktop/test.md` |
| 至少兩層目錄的絕對路徑 | `/Users/pardn/a/b.go` |
| 帶副檔名的絕對路徑 | `/tmp/demo.png` |
| 行內程式碼內的上述路徑 | `` `/tmp/demo.png` `` |

路徑可包含中文、日文、韓文等字元；結尾的 `.`、`/` 不算入路徑。

## 設定

```javascript
MDParser.Init({ fileEndpoint: "http://localhost:3000/v1/file/open?path={filepath}" });
```

| 項目 | 規則 |
|---|---|
| `{filepath}` | 點擊時替換為 `encodeURIComponent(路徑)`，可出現多次 |
| 未設定 | 路徑輸出為純文字，不產生連結 |
| 不是字串或缺少 `{filepath}` | 記錄 `[Invalid] fileEndpoint: must be a string containing {filepath}`，視同未設定 |
| 輸出 | `<a class="md-link md-file-link" data-path="...">` |
| 點擊 | `Refresh()` 綁定後，以 `fetch()` 呼叫替換後的網址 |
| 錯誤 | 非 2xx 記錄 `[Upstream] <url>: HTTP <status>`；連線失敗記錄 `[Unavailable] <url>: <原因>` |

設定 `fileEndpoint` 後要重新呼叫 `Parse().html()`，路徑才會輸出為連結。

## 範例

### 未設定 fileEndpoint

路徑維持純文字，含非 ASCII 字元的路徑也一樣。

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Paths: ~/Desktop/test.md, /Users/pardn/a/b.go, `/tmp/demo.png`

Non-ASCII paths: /Users/pardn/Desktop/截圖2026-10-19凌晨1.03.32.png, ~/문서/보고서.md, /Users/pardn/ドキュメント/メモ.txt
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### 設定 fileEndpoint

同樣的路徑輸出為 `md-file-link` 連結，點擊時呼叫端點。

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Paths: ~/Desktop/test.md, /Users/pardn/a/b.go, `/tmp/demo.png`

Non-ASCII paths: /Users/pardn/Desktop/截圖2026-10-19凌晨1.03.32.png, ~/문서/보고서.md, /Users/pardn/ドキュメント/メモ.txt
</script>
<script>
  const out = document.getElementById("out");
  MDParser.Init({ fileEndpoint: "https://example.com/open?path={filepath}" });
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
  console.log([...out.querySelectorAll(".md-file-link")].map((a) => a.dataset.path).join("\n"));
</script>
```
