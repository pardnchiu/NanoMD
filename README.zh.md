<img src="https://nanomd.pardn.io/static/image/logo.png" width=80>

# NanoMD: 輕量化 Markdown 編輯器

> [!NOTE]
> (原名：PDMarkdownKit，自 `1.8.0` 版本起更名為 NanoMD)

> NanoMD 是一個基於純 JavaScript 和原生 API 的輕量級 Markdown 編輯和預覽庫。可輕鬆嵌入網站，提供豐富功能，並支持實時預覽。

![tag](https://img.shields.io/badge/tag-JavaScript%20Library-bb4444) 
![size](https://img.shields.io/github/size/pardnchiu/NanoMD/dist%2FNanoMD.js)<br>
[![npm](https://img.shields.io/npm/v/@pardnchiu/nanomd)](https://www.npmjs.com/package/@pardnchiu/nanomd)
[![download](https://img.shields.io/npm/dm/@pardnchiu/nanomd)](https://www.npmjs.com/package/@pardnchiu/nanomd)
[![jsdeliver](https://img.shields.io/jsdelivr/npm/hm/@pardnchiu/nanomd)](https://www.jsdelivr.com/package/npm/@pardnchiu/nanomd)<br>
[![](https://img.shields.io/badge/read-English%20Version-ffffff)](https://github.com/pardnchiu/NanoMD/blob/main/README.md)

## 核心特色

### 極速編輯體驗
- 虛擬 DOM 智能更新，確保卓越效能
- 即時分屏預覽，所見即所得
- 智能滾動同步，無縫對應定位
- 針對大型文件優化，順暢零延遲

### Markdown 進階支援
- 完整標準語法支援
- 擴展功能支援：
    - 程式碼格式化與高亮
    - 數學公式即時渲染
    - 自動表格格式化
    - 可勾選任務清單
    - 快速引用區塊

### 多媒體整合能力
- YouTube、Vimeo 影片自動嵌入與預覽
- 智能圖片處理：
    - 自動縮圖預覽
    - 靈活的尺寸控制
    - 多樣的對齊選項
- 響應式媒體支援

### 技術優勢
- 純 JavaScript 實現，無外部依賴
- 高效虛擬 DOM 實作
- 模組化架構設計
- 完整 ES Module 支援

## 文件

- 網站: [nanomd.pardn.io](https://nanomd.pardn.io)
- 說明文件: [nanomd.pardn.io/page/doc](https://nanomd.pardn.io/page/doc.html)
- 線上編輯器: [nanomd.pardn.io/page/live](https://nanomd.pardn.io/page/live.html)

## 安裝方式

### 從 npm 安裝
```bash
npm i @pardnchiu/nanomd
```

### 從 CDN 引入

#### UMD 版本
```html
<!-- 1.8.0 版本以上 -->
<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@[VERSION]/dist/NanoMD.js"></script>

<!-- 1.6.0-1.7.1 版本 -->
<script src="https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.js"></script>
```

#### ES Module 版本
```javascript
// 1.8.0 版本以上
import { MDEditor, MDViewer, MDParser } from "https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@[VERSION]/dist/NanoMD.esm.js";

// 1.6.0-1.7.1 版本
import { editor, viewer } from "https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.module.js";

// 1.5.2 版本以下
import { editor, viewer } from "https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.js";
```

## 使用方法

### 初始化 `MDEditor` 和 `MDViewer`
```Javascript
// 1.8.0 版本以上
// 統一使用: MDEditor, MDViewer

// 1.7.1 版本以下
// IIFE: PDMarkdownEditor, PDMarkdownViewer
// ESM: editor, viewer

const domEditor = new MDEditor({
    id: "",                                 // 指定元素取代元件
    defaultContent: "",                     // 預設內容，初始顯示
    hotKey: 1,                              // 啟用快捷鍵，預設為 1
    preventRefresh: 0,                      // 防止頁面重整，預設值：0
    tabPin: 0,                              // 釘選 Tab，預設值：0 (關閉)
    wrap: 1,                                // 啟用文字自動換行，預設值：1 (開啟)
    autosave: 1,                            // 自動儲存，預設值：1 (開啟)
    event: {
        save: result => {                   // 自定義儲存事件
            console.log(result);            // 輸出當前 Markdown 內容
        },
        upload: async result => {
            /**
             * 自定義圖片上傳函式
            *
            * 功能：
            * - 此函式允許開發者定義圖片上傳邏輯。
            * - 上傳完成後，回傳一個包含圖片連結和替代文字的物件，用於將圖片插入編輯器。
            *
            * 使用方式：
            * - 在需要上傳圖片時，編輯器會調用此函式。
            * - 開發者可以自定義上傳處理（例如：通過 API 將圖片上傳到伺服器）。
            *
            * 回傳值：
            * - 必須是包含以下字段的物件：
            *   - `href`：圖片的 URL，將被插入到編輯器中。
            *   - `alt`：圖片的替代文字（用於圖片無法加載時的顯示）。
            *
            * 示例：
            * - 目前模擬1秒延遲後返回空的 `href` 和 `alt`。
            * - 可替換為真實的上傳邏輯（如使用 fetch 或 axios 發送 HTTP 請求）。
            */
            const link = await new Promise(resolve => {
                setTimeout(() => resolve({
                    href: "",  // 圖片的 URL（可替換為真實上傳返回的鏈接）
                    alt: ""    // 圖片的替代文字（可替換為上傳時的描述）
                }), 1000);  // 模擬 1 秒延遲
            });
            return link;
        }
    },
    style: {
        mode: "",                           // 主題模式 auto | light | dark，預設值： auto
        fill: 1,                            // 隨父元素大小調整，預設值：1 (開啟)
        fontFamily: "",                     // 設定字體，預設：'Noto Sans TC', sans-serif
        showRow: 0,                         // 顯示行號，預設值：0 (關閉)
        placeholder: {
            text: "Content",                // 設定提示文字，預設：Type here ...
            color: "#ff000080"              // 提示文字顏色，預設：#0000ff1a
        },
        focus: {
            backgroundColor: "#ff00001a",   // 焦點背景顏色，預設：#0000ffff
            color: "#ff0000"                // 焦點文字顏色，預設：#bfbfbf
        }
    }
});


const domViewer = new MDViewer({
    id: "",                 // 指定元素取代元件
    emptyContent: "",       // 預設內容，當編輯器為空時顯示
    style: {
        mode: "",           // auto | light | dark, 預設： auto
        fill: "",           // 隨父元素大小調整，預設值：1 | true
        fontFamily: "",     // 預設：'Noto Sans TC', sans-serif
    },
    sync: {
        editor: domEditor,  // 關聯的編輯器
        delay: 50,          // 更新延遲，單位ms，預設 300
        scrollSync: 1,      // 與編輯器同步滾動，預設值：0 | false
    },
    hashtag: {
        path: "?keyword=",  // 標籤路徑，用於檢測 # 並轉換為Link
        target: "_blank"    // 標籤打開方式，預設 _blank
    }
});

// 若無指定元件，需手動將播放器加入至 DOM 中
(...).appendChild(domEditor.body);
(...).appendChild(domViewer.body);

// 1.11.0 版本以上
const domParser = new MDParser({
    standard: 1             // 僅支持標準語法，預設值：1 | true
});

console.log(domParser.parse("**欲解析的文字**"))
```

## 授權條款

本專案採用類 MIT 授權，但僅提供混淆後的程式碼：
- 與 MIT 相同：可自由使用、修改、再散布，包含商業用途
- 主要差異：預設僅提供混淆版程式碼，原始碼需另外購買
- 授權內容：必須保留原始版權聲明 (與 MIT 相同)

詳細條款與條件請參閱[軟體使用協議](https://github.com/pardnchiu/NanoMD/blob/main/LICENSE)。

## 開發者

<img src="https://avatars.githubusercontent.com/u/25631760" align="left" width="96" height="96" style="margin-right: 0.5rem;">

<h4 style="padding-top: 0">邱敬幃 Pardn Chiu</h4>

<a href="mailto:dev@pardn.io" target="_blank">
    <img src="https://pardn.io/image/email.svg" width="48" height="48">
</a> <a href="https://linkedin.com/in/pardnchiu" target="_blank">
    <img src="https://pardn.io/image/linkedin.svg" width="48" height="48">
</a>

***

©️ 2023 [邱敬幃 Pardn Chiu](https://pardn.io)

