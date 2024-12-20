# NanoMD

*(原名：PDMarkdownKit，自 `1.8.0` 版本起更名為 NanoMD)*

> 一個純 JavaScript 實現的 Markdown 編輯器，使用原生 API，支援標準 Markdown 語法並擴展多種功能，包括即時預覽、滾動同步、自動檢測 YouTube 視頻等功能。<br>
> 同時，內建虛擬 DOM 技術，僅更新變動部分，確保即時編輯中的高效渲染與流暢體驗，適合在線編輯場景。

![tag](https://img.shields.io/badge/tag-JavaScript%20Library-bb4444) 
![size](https://img.shields.io/github/size/pardnchiu/NanoMD/dist%2FNanoMD.js)<br>
[![npm](https://img.shields.io/npm/v/@pardnchiu/nanomd)](https://www.npmjs.com/package/@pardnchiu/nanomd)
[![download](https://img.shields.io/npm/dm/@pardnchiu/nanomd)](https://www.npmjs.com/package/@pardnchiu/nanomd)
[![jsdeliver](https://img.shields.io/jsdelivr/npm/hm/@pardnchiu/nanomd)](https://www.jsdelivr.com/package/npm/@pardnchiu/nanomd)<br>
[![](https://img.shields.io/badge/read-English%20Version-ffffff)](https://github.com/pardnchiu/NanoMD/blob/main/README.md)

## 特點

- 提供獨立的編輯與顯示模組，支持即時預覽和滾動同步。
- 支持標準的 Markdown 語法，包括標題、粗體、斜體、連結、圖片、代碼區塊等。
- 擴展功能如增加上下標語法，調整圖片大小、對齊，與偵測 Youtube / Vimeo 連結與影片插入。
- 提供撤銷與重做功能，以及多項快捷鍵，並支持 Markdown 和 HTML 格式的檔案匯入與匯出。
- 引入虛擬 DOM 概念，按需更新頁面，減少渲染所需資源。
- 集成 [Google Icon](https://fonts.google.com/icons) 圖示與 [code-prettify](https://github.com/googlearchive/code-prettify) 語法高亮。

## 文件與展示

說明文件: [nanomd.pardn.io/doc.html](https://nanomd.pardn.io/doc.html)
線上編輯器: [nanomd.pardn.io/live.html](https://nanomd.pardn.io/live.html)
網站: [nanomd.pardn.io](https://nanomd.pardn.io)

## 安裝方式

- **從 npm 安裝**
    ```bash
    npm i @pardnchiu/nanomd
    ```

- **從 CDN 引入**
    - **引入 `NanoMD` 套件**
        ```html
        <!-- 1.8.0 版本以上 -->
        <script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@[VERSION]/dist/NanoMD.js"></script>

        <!-- 1.6.0-1.7.1 版本 -->
        <script src="https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.js"></script>
        ```
    - **Module 版本**
        ```javascript
        // 1.8.0 版本以上
        import { MDEditor, MDViewer } from "https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@[VERSION]/dist/NanoMD.esm.js";

        // 1.6.0-1.7.1 版本
        import { editor, viewer } from "https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.module.js";

        // 1.5.2 版本以下
        import { editor, viewer } from "https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.js";
        ```

## 使用方法

- **初始化 `MDEditor` 和 `MDViewer`**
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
        tabPin: 0,                              // 1 | 0 | true | false
        wrap: 1,                                // 1 | 0 | true | false
        style: {
            mode: "",                           // auto | light | dark, 預設： auto
            fill: 1,                            // 隨父元素大小調整，預設值：1
            fontFamily: "",                     // 預設：'Noto Sans TC', sans-serif
            showRow: 0,                         // 顯示行數，預設：1
            placeholder: {
                text: "Content",                // 預設：Type here ...
                color: "#ff000080"              // 預設：#0000ff1a
            },
            focus: {
                backgroundColor: "#ff00001a",   // 預設：#0000ffff
                color: "#ff0000"                // 預設：#bfbfbf
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
            editor: domEditor, // 關聯的編輯器
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
    ```

## 授權條款

本專案採用類 MIT 授權，但僅提供混淆後的程式碼：
- 與 MIT 相同：可自由使用、修改、再散布，包含商業用途
- 主要差異：預設僅提供混淆版程式碼，原始碼需另外購買
- 授權內容：必須保留原始版權聲明 (與 MIT 相同)

詳細條款與條件請參閱[軟體使用協議](https://github.com/pardnchiu/NanoMD/blob/main/LICENSE)。

## 開發者

<img src="https://avatars.githubusercontent.com/u/25631760" align="left" width="96" height="96" style="margin-right: 0.5rem;" />

<h4 style="padding-top: 0">邱敬幃 Pardn Chiu</h4>

[![](https://skillicons.dev/icons?i=linkedin)](https://linkedin.com/in/pardnchiu)

***

©️ 2023 [邱敬幃 Pardn Chiu](https://pardn.io)

