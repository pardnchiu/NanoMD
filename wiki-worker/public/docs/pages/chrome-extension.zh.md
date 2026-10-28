# NanoMD Chrome 擴充功能

[NanoMD 擴充功能](https://chromewebstore.google.com/detail/nanomd/pdklinlfmpobpakengplkhbbneaamijd)是 Chrome 的 Markdown 擴充功能，以本站介紹的同一套解析器渲染本機 Markdown 檔案。開啟 `.md` 檔即可並排編輯與即時預覽，不需寫程式、不需伺服器。

<a href="https://chromewebstore.google.com/detail/nanomd/pdklinlfmpobpakengplkhbbneaamijd"><img src="/static/image/chrome_web_store.svg" alt="Available in the Chrome Web Store" height="48"></a>

## 安裝

1. 從 [Chrome 線上應用程式商店](https://chromewebstore.google.com/detail/nanomd/pdklinlfmpobpakengplkhbbneaamijd)安裝 NanoMD。
2. 開啟檔案存取權限（見下節）。
3. 把 `.md` 或 `.markdown` 檔案拖進 Chrome，或直接開啟其 `file://` 路徑。

## 開啟檔案存取權限

> [!IMPORTANT]
> Chrome 預設不讓擴充功能存取 `file://` 頁面。**允許存取檔案網址** 開啟前 NanoMD 完全不會執行，檔案只會以純文字顯示。

1. 開啟 `chrome://extensions`。
2. 在 NanoMD 點 **詳細資料**。
3. 開啟 **允許存取檔案網址**。

<img src="/static/image/chrome_file_access.png" alt="NanoMD 擴充功能詳細資料中的「允許存取檔案網址」開關" width="600">

已開啟的 Markdown 分頁需重新整理才會套用。

## 編輯與預覽

| 區域 | 行為 |
|---|---|
| 左側 | 原始碼編輯區，載入檔案內容 |
| 右側 | 以 `MDParser.Parse().html()` 渲染的預覽，停止輸入 200 ms 後重新渲染 |
| 底部 | 連到 NanoMD repository 的頁尾 |

本站列出的語法在預覽中全部可用，包含 [Mermaid、數學式與 Chart.js 區塊](/zh/syntax-code)。Mermaid、KaTeX、Chart.js 與 code-prettify 打包在擴充功能內並從套件載入，離線也能渲染圖表與公式。

## 存檔

| 操作 | 結果 |
|---|---|
| 在編輯區輸入 | 分頁標題前出現 `●` |
| 第一次 `Cmd/Ctrl + S` | 跳出存檔對話框並預填目前檔名；寫入選定的檔案後 `●` 消失 |
| 同一分頁之後的 `Cmd/Ctrl + S` | 直接覆寫同一檔案，不再詢問 |
| 取消對話框 | 不寫入任何檔案，編輯內容保留在編輯區 |

Chrome 無法直接寫回 `file://` 頁面，因此第一次存檔一定會詢問目標；選擇原檔即可覆寫。關閉或重新整理分頁會捨棄未存檔的內容。

## 適用範圍

- 只在 `file:///*.md` 與 `file:///*.markdown` 執行；網站提供的 Markdown 不受影響。
- 不要求任何擴充功能權限，本身不發出任何請求。檔案中寫的遠端圖片、影片與 YouTube／Vimeo 內嵌會像一般網頁一樣載入。

完整的資料處理方式見[隱私權政策](/zh/chrome-extension-privacy)。
