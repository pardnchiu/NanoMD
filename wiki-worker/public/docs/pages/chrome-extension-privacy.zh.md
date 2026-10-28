# NanoMD Chrome 擴充功能隱私權政策

生效日期：2026-10-21

本政策適用於 Pardn Chiu 發布的 NanoMD Chrome 擴充功能（Chrome 線上應用程式商店 ID `pdklinlfmpobpakengplkhbbneaamijd`）。

## 摘要

NanoMD 在瀏覽器內渲染本機 Markdown 檔案，不蒐集、不儲存、不販售、也不傳送任何個人資料或使用者資料。

## 擴充功能存取的資料

| 資料 | 用途 | 是否離開裝置 |
|---|---|---|
| 以 `file://` 開啟的本機 `.md`／`.markdown` 檔案內容 | 在頁面上渲染成 HTML | 否 |
| 按下 `Cmd/Ctrl + S` 後於存檔對話框中選擇的檔案 | 寫回編輯後的內容 | 否 |

擴充功能只在 `file:///*.md` 與 `file:///*.markdown` 頁面執行，沒有背景服務、不要求任何擴充功能權限，也不使用 cookie、`localStorage`、`chrome.storage`、分析或追蹤工具。

## 網路請求

Mermaid、KaTeX、Chart.js 與 code-prettify 皆打包在擴充功能內，從擴充功能套件載入，不連線到伺服器。

擴充功能本身不發出任何請求。若開啟的 Markdown 檔案含有遠端圖片、影片或 YouTube／Vimeo 內嵌，瀏覽器會依檔案中寫的網址載入這些資源，與一般網頁相同；這些服務適用其各自的隱私權政策。

## 資料分享

不與第三方分享、販售或轉移任何資料，也不將資料用於廣告、信用評估或與渲染所開啟檔案無關的用途。

## 政策變更

本政策更新時會發布於此頁並標示新的生效日期。

## 聯絡方式

對本政策有疑問：於 [github.com/pardnchiu/NanoMD](https://github.com/pardnchiu/NanoMD/issues) 開 issue，或寄信至 [dev@pardn.io](mailto:dev@pardn.io)。
