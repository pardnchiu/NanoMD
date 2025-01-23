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
        import { MDEditor, MDViewer, MDParser } from "https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@[VERSION]/dist/NanoMD.esm.js";

        // 1.6.0-1.7.1 版本
        import { editor, viewer } from "https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.module.js";

        // 1.5.2 版本以下
        import { editor, viewer } from "https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.js";
        ```

## 使用方法

- **初始化 `MDEditor`、`MDViewer` 和 `MDParser`**
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
            fill: 1,            // 隨父元素大小調整，預設值：1 | true
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

    // 1.10.0 版本以上
    const domParser = new MDParser({
        standard: 1             // 僅支持標準語法，預設值：1 | true
    });

    console.log(domParser.parse("**欲解析的文字**"))
    ```
