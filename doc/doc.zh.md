# NanoMD - 技術文件

> 返回 [README](./README.zh.md)

## 前置需求

- 支援 ES2022 私有類別欄位（`#field`）的現代瀏覽器：Chrome、Firefox、Safari、Edge
- 可連線至 `cdn.jsdelivr.net`、`fonts.googleapis.com`、`fonts.gstatic.com`：載入時會自動插入 Material Symbols、Mermaid 11.4.1、code-prettify 與 `NanoMD.css`
- Node.js 僅在從原始碼建置時需要

## 安裝

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@latest/dist/NanoMD.js"></script>
```

`NanoMD.js` 會自行把 `NanoMD.css` 插入 `<head>`，不需要額外的 `<link>`。`MDEditor`、`MDViewer`、`MDParser` 三個類別掛在 `window` 上。

### npm

```bash
npm i @pardnchiu/nanomd
```

### ESM

```javascript
import { MDEditor, MDViewer, MDParser } from "@pardnchiu/nanomd";
```

`dist/NanoMD.esm.js` 是同一份 bundle 加上 `export`，另提供小寫別名 `editor`（= `MDEditor`）與 `viewer`（= `MDViewer`）。

### 從原始碼建置

```bash
git clone https://github.com/pardnchiu/NanoMD.git
cd NanoMD
npm install
npm run build:once
```

`build:once` 產生 `dist/NanoMD.debug.js`、`dist/NanoMD.js`（terser 壓縮）與 `dist/NanoMD.esm.js`；`npm run build` 監看 `src/` 自動重建，`npm run sass` 監看並編譯 SCSS。

## 使用方式

### 基礎：只渲染 Markdown

```html
<section id="viewer"></section>

<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@latest/dist/NanoMD.js"></script>
<script>
const viewer = new MDViewer({
    id: "viewer",
    emptyContent: "# Hello\n\n這是 **NanoMD**。",
    style: { mode: "auto", fill: false }
});
</script>
```

### 基礎：編輯器與預覽器

```html
<div style="position: relative; height: 480px;"><section id="editor"></section></div>
<div style="position: relative; height: 480px;"><section id="viewer"></section></div>

<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@latest/dist/NanoMD.js"></script>
<script>
const editor = new MDEditor({
    id: "editor",
    defaultContent: "# Hello\n\nStart editing..."
});

const viewer = new MDViewer({
    id: "viewer",
    sync: { editor: editor, delay: 300, scroll: true }
});
</script>
```

`style.fill` 預設為 `true`，容器會以絕對定位填滿父元素，因此父元素需設定 `position` 與高度。

### 進階：只轉換字串

```javascript
const parser = new MDParser({ standard: false });
const html = parser.parse("```js\nconst a = 1;\n```\n\n> [!TIP]\n> 擴充語法");

document.querySelector("#out").innerHTML = html;
if (typeof PR !== "undefined") {
    PR.prettyPrint();
}
```

`MDParser` 預設 `standard: true`，會略過 fenced code block、Mermaid、標記／上下標與提示框；要與 `MDViewer` 輸出一致需傳 `standard: false`。輸出不會過濾 HTML，寫入 `innerHTML` 前請自行處理不受信任的內容。

### 進階：儲存與圖片上傳

```javascript
const editor = new MDEditor({
    id: "editor",
    event: {
        save: async (text) => {
            try {
                const res = await fetch("/api/save", { method: "POST", body: text });
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
            } catch (err) {
                console.error("儲存失敗", err);
            }
        },
        upload: async () => {
            try {
                const res = await fetch("/api/upload", { method: "POST" });
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }
                const { url, name } = await res.json();
                return { href: url, alt: name };
            } catch (err) {
                console.error("上傳失敗", err);
                return { href: "", alt: "" };
            }
        }
    }
});
```

`Cmd/Ctrl+S` 觸發 `save()`；設定 `event.upload` 後工具列出現上傳按鈕。`upload()` 的 rejection 不會被攔截，需自行處理；回傳空的 `href` 時不插入任何內容。

### 進階：跟隨系統主題與 Hashtag

```javascript
const viewer = new MDViewer({
    id: "viewer",
    sync: { editor: editor },
    hashtag: { path: "/search?tag=", target: "_blank" }
});

matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    const mode = e.matches ? "dark" : "light";
    editor.changeMode(mode);
    viewer.changeMode(mode);
});
```

`style.mode: "auto"` 只在 bundle 載入時讀取一次系統偏好；之後要跟隨切換需自行監聽並呼叫兩邊的 `changeMode()`。

### 進階：匯入與匯出

```html
<input type="file" accept=".md" onchange="editor.openfile(this.files[0])">
<button onclick="editor.download('md')">匯出 Markdown</button>
<button onclick="editor.download('html')">匯出 HTML</button>
```

## API 參考

### MDEditor 選項

| 選項 | 型別 | 預設 | 說明 |
|---|---|---|---|
| `id` | `string` | 無 | 容器元素 ID；找不到時建立未掛載的 `<section>`，從 `editor.body` 取得後自行插入 |
| `defaultContent` | `string` | `""` | 初始 Markdown |
| `hotKey` | `boolean` | `true` | 啟用格式化快捷鍵；復原、儲存、Tab 等編輯鍵不受影響 |
| `autosave` | `boolean` | `true` | 輸入後更新預覽；`false` 時只有 `save()` 會更新 |
| `preventRefresh` | `boolean` | `false` | 註冊 `beforeunload` 並攔截 `F5`、`Cmd/Ctrl+R` |
| `tabPin` | `boolean` | `false` | 工具列常駐顯示 |
| `style.mode` | `string` | `"auto"` | `"auto"`／`"light"`／`"dark"` |
| `style.fill` | `boolean` | `true` | 填滿父元素 |
| `style.fontFamily` | `string` | `"'Roboto Mono', monospace"` | 編輯器字型 |
| `style.showRow` | `boolean` | `true` | 顯示行號 |
| `style.placeholder.text` | `string` | `"Type here ..."` | 空白提示文字 |
| `style.placeholder.color` | `string` | `"#bfbfbf"` | 提示文字顏色 |
| `style.focus.backgroundColor` | `string` | `"#0000ff1a"` | 目前所在行背景 |
| `style.focus.color` | `string` | `"#0000ffff"` | 目前所在行文字與游標顏色 |
| `event.save` | `function(text)` | 無 | 儲存回呼 |
| `event.upload` | `async function()` | 無 | 回傳 `{ href, alt }`，設定後工具列顯示上傳按鈕 |

### MDEditor 方法與屬性

| 名稱 | 說明 |
|---|---|
| `body` | 編輯器容器（`contentEditable`），每一行是一個 `<div>` |
| `text` | 唯讀，所有行的文字以 `\n` 連接 |
| `viewer` | 綁定的 `MDViewer`，由預覽器的 `sync.editor` 自動設定 |
| `init(text?, withFocus = true, set = true)` | 以 `text` 重建所有行；不會自動更新預覽 |
| `clear()` | 清空並更新預覽 |
| `selectAll()` | 選取全部內容 |
| `save()` | 依 `autosave` 與 `event.save` 執行儲存流程；未設定 `event.save` 時開啟匯出對話框 |
| `unsave()` | 將編輯器與預覽器的 `data-saved` 設為 `0` |
| `undo()`／`redo()` | 復原／重做 |
| `openfile(file)` | 以 `FileReader` 讀入 `File` 並更新預覽 |
| `download(type = "md")` | 匯出 `"md"` 或 `"html"` 檔案 |
| `changeMode(mode = "light")` | 直接寫入 `data-mode` |
| `bold(event)`、`italic(event)`、`strikethrough(event)`、`underline(event)`、`marker(event)`、`sup(event)`、`sub(event)`、`code(event)` | 插入行內格式；`event.metaKey` 或 `event.ctrlKey` 為真時輸出 HTML 標籤，否則輸出 Markdown 標記；從程式呼叫請傳 `{}` |
| `heading(event, num)` | `num` 為 `1`-`6` 插入標題，`0` 移除既有 `#` |
| `blockquote()`、`ul()`、`ol()` | 對選取的每一行加上 `> `、`- `、`1. ` |
| `link(title, href)` | 插入 `[title](href)` |
| `image(src, alt, title)` | 插入 `![title 或 alt](src)` |

### MDViewer 選項

| 選項 | 型別 | 預設 | 說明 |
|---|---|---|---|
| `id` | `string` | 無 | 容器元素 ID；找不到時建立未掛載的 `<section>` |
| `emptyContent` | `string` | `""` | 沒有 `init()` 參數且編輯器無文字時渲染的 Markdown |
| `style.mode` | `string` | `"auto"` | `"auto"`／`"light"`／`"dark"` |
| `style.fill` | `boolean` | `true` | 填滿父元素 |
| `style.fontFamily` | `string` | `"sans-serif"` | 預覽字型 |
| `sync.editor` | `MDEditor` | `null` | 綁定的編輯器 |
| `sync.delay` | `number` | `300` | 渲染延遲（毫秒）；`0` 視為 `300` |
| `sync.scroll` | `boolean` | `false` | 編輯器滾輪同步捲動預覽器 |
| `hashtag.path` | `string` | `""` | `#tag` 連結前綴；空字串不轉換 |
| `hashtag.target` | `string` | `""` | `"_blank"` 開新分頁，其餘為 `_self` |

### MDViewer 方法與屬性

| 名稱 | 說明 |
|---|---|
| `body` | 預覽器容器 |
| `editor` | 綁定的編輯器；可在建構後指定 |
| `init(txt = "")` | 延遲 `sync.delay` 後渲染 `txt`、編輯器文字或 `emptyContent`，並執行程式碼高亮與 Mermaid |
| `clear()` | 清空容器 |
| `unsave()` | 將 `data-saved` 設為 `0` |
| `changeMode(mode = "light")` | 直接寫入 `data-mode` |

### MDParser

| 名稱 | 說明 |
|---|---|
| `new MDParser({ standard = true, text = "" })` | `standard` 為 `true` 時只處理標準語法；`text` 為 `parse()` 無參數時使用的預設文字 |
| `parse(text?)` | 回傳 HTML 字串；不建立 DOM 容器，但仍需瀏覽器環境 |

### 快捷鍵

| 組合 | 動作 | 受 `hotKey` 控制 |
|---|---|---|
| `Cmd/Ctrl+B`／`I`／`U`／`M`／`K` | 粗體／斜體／底線／標記／程式碼 | 是 |
| `Cmd/Ctrl+Shift+X` | 刪除線 | 是 |
| `Cmd/Ctrl+↑`／`↓` | 上標／下標 | 是 |
| `Cmd/Ctrl+Z`／`Cmd/Ctrl+Shift+Z` | 復原／重做 | 否 |
| `Cmd/Ctrl+S` | `save()` | 否 |
| `Cmd/Ctrl+A` | 只選取編輯器內容 | 否 |
| `Tab`／`Cmd/Ctrl+]` | 插入 4 個空白／每個選取行行首縮排 | 否 |

### 已知限制（v1.11.6）

| 現象 | 原因 |
|---|---|
| 文字中的 `$` 輸出成 `@dollar@` | 轉換管線還原表對應錯誤 |
| `MDViewer` 未設 `hashtag.path` 時不產生 YouTube／Vimeo 預覽卡 | `transToHTML()` 把 hashtag path 傳入 `setLink()` 的 `isDefault` 參數；`MDParser` 不受影響 |
| 經 `init(text)` 建立的行（`defaultContent`、`openfile()`、`undo()`／`redo()`）在預覽中可能無法套用標記、上下標與提示框 | `init()` 先 `escapeHTML()` 再以純文字寫入，行內存的是字面的 `&nbsp;` |
| Vimeo 連結會阻塞主執行緒 | 縮圖以同步 XHR 取得 |

***

©️ 2024 [邱敬幃 Pardn Chiu](https://www.linkedin.com/in/pardnchiu)
