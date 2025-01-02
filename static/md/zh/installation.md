> 此專案版本 `1.8.0` 開始，從 `PDMarkdownKit` 改名為 `NanoMD`<br>
> 功能不變，名稱更加精簡好記。

## 安裝方式

- 從 npm 安裝
    ```bash
    npm i @pardnchiu/nanomd
    ```

- 從 CDN 引入
    - **UMD 版本**
        ```html
        <!-- 1.8.0 版本以上 -->
        <script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@[VERSION]/dist/NanoMD.js"></script>

        <!-- 1.6.0-1.7.1 版本 -->
        <script src="https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.js"></script>
        ```
    - **ES Module 版本**
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
        tabPin: 0,                              // 啟用 Tab 縮排，預設值：0 (關閉)
        wrap: 1,                                // 啟用文字自動換行，預設值：1 (開啟)
        autoSave: 1,                            // 自動儲存，預設值：1 (開啟)
        event: {
            save: result => {                   // 自定義儲存事件
                console.log(result);            // 輸出當前 Markdown 內容
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
