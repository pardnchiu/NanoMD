# NanoMD - 技術文件

> 返回 [README](./README.zh.md)

## 前置需求

- Node.js ≥ 16（僅開發建置需要）
- 現代瀏覽器（Chrome、Firefox、Safari、Edge）

## 安裝

### 使用 npm

```bash
npm i @pardnchiu/nanomd
```

### 使用 CDN

```html
<!-- 透過 jsDelivr 引入 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@1.11.6/dist/NanoMD.css">
<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@1.11.6/dist/NanoMD.js"></script>
```

### ESM 模組

```javascript
import { MDEditor, MDViewer, MDParser } from "@pardnchiu/nanomd";
```

### 從原始碼建置

```bash
git clone https://github.com/pardnchiu/NanoMD.git
cd NanoMD
npm install
npm run build:once
```

## 使用方式

### 基礎用法：僅預覽

建立一個 Markdown Viewer，將 Markdown 內容渲染為 HTML：

```html
<section id="viewer"></section>

<script>
const viewer = new MDViewer({
    id: "viewer",
    emptyContent: "# Hello\n\nThis is **NanoMD**.",
    style: {
        mode: "auto",       // "auto" | "light" | "dark"
        fill: true,          // 填滿父容器
        fontFamily: "sans-serif"
    }
});
</script>
```

### 基礎用法：編輯器 + 預覽

建立編輯器與預覽器的同步配對：

```html
<section id="editor"></section>
<section id="viewer"></section>

<script>
const editor = new MDEditor({
    id: "editor",
    defaultContent: "# Hello\n\nStart editing...",
    hotKey: true,           // 啟用快捷鍵
    autosave: true,         // 自動同步至 Viewer
    style: {
        mode: "auto",
        fill: true,
        showRow: true,       // 顯示行號
        placeholder: {
            text: "Type here ...",
            color: "#bfbfbf"
        },
        focus: {
            backgroundColor: "#0000ff1a",
            color: "#0000ffff"
        }
    }
});

const viewer = new MDViewer({
    id: "viewer",
    sync: {
        editor: editor,     // 綁定編輯器
        delay: 300,          // 渲染延遲（ms）
        scroll: true         // 同步捲動
    },
    style: {
        mode: "auto",
        fill: true
    }
});
</script>
```

### 進階用法：MDParser 獨立解析

不需要 DOM 元素，直接將 Markdown 文字轉為 HTML 字串：

```javascript
const parser = new MDParser({
    standard: true   // 使用標準 Markdown 解析
});

const html = parser.parse("# Title\n\n**bold** and *italic*");
console.log(html);
```

### 進階用法：事件與匯出

```javascript
const editor = new MDEditor({
    id: "editor",
    event: {
        save: (text) => {
            // 自訂儲存邏輯
            console.log("儲存內容：", text);
        }
    }
});

// 程式化操作
editor.bold(event);         // 插入粗體
editor.heading(event, 2);   // 插入 H2
editor.link("標題", "https://example.com"); // 插入連結
editor.download("md");      // 匯出為 Markdown
editor.download("html");    // 匯出為 HTML
editor.undo();              // 復原
editor.redo();              // 重做
```

### 進階用法：Hashtag 連結

```javascript
const viewer = new MDViewer({
    id: "viewer",
    hashtag: {
        path: "/tags/",     // Hashtag 連結路徑前綴
        target: "_blank"    // 開啟方式
    }
});
```

## API 參考

### MDEditor

```javascript
new MDEditor(config)
```

#### 建構參數

| 參數 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `id` | `string` | - | 掛載的 DOM 元素 ID |
| `defaultContent` | `string` | `""` | 初始 Markdown 內容 |
| `hotKey` | `boolean` | `true` | 啟用鍵盤快捷鍵 |
| `autosave` | `boolean` | `true` | 輸入時自動同步至 Viewer |
| `preventRefresh` | `boolean` | `false` | 防止頁面重新整理 |
| `wrap` | `boolean` | `true` | 自動換行 |
| `tabPin` | `boolean` | `false` | 固定工具列 |
| `style.mode` | `string` | `"auto"` | 主題模式：`"auto"` / `"light"` / `"dark"` |
| `style.fill` | `boolean` | `true` | 填滿父容器 |
| `style.showRow` | `boolean` | `true` | 顯示行號 |
| `style.fontFamily` | `string` | `"'Roboto Mono', monospace"` | 編輯器字型 |
| `style.placeholder.text` | `string` | `"Type here ..."` | 佔位文字 |
| `style.placeholder.color` | `string` | `"#bfbfbf"` | 佔位文字顏色 |
| `style.focus.backgroundColor` | `string` | `"#0000ff1a"` | 焦點行背景色 |
| `style.focus.color` | `string` | `"#0000ffff"` | 焦點行文字色 |
| `event.save` | `function` | - | 儲存事件回呼，接收 `text` 參數 |

#### 方法

| 方法 | 參數 | 說明 |
|------|------|------|
| `init(text?, withFocus?, set?)` | `string, boolean, boolean` | 初始化編輯器內容 |
| `heading(event, num)` | `Event, number(1-6)` | 插入標題 |
| `bold(event)` | `Event` | 插入粗體 |
| `italic(event)` | `Event` | 插入斜體 |
| `strikethrough(event)` | `Event` | 插入刪除線 |
| `underline(event)` | `Event` | 插入底線 |
| `marker(event)` | `Event` | 插入標記（高亮） |
| `sup(event)` | `Event` | 插入上標 |
| `sub(event)` | `Event` | 插入下標 |
| `code(event)` | `Event` | 插入代碼 |
| `blockquote()` | - | 插入引用區塊 |
| `ul()` | - | 插入無序列表 |
| `ol()` | - | 插入有序列表 |
| `link(title, href)` | `string, string` | 插入超連結 |
| `image(src, alt, title)` | `string, string, string` | 插入圖片 |
| `download(type)` | `"md"` / `"html"` | 匯出檔案 |
| `openfile(file)` | `File` | 開啟 Markdown 檔案 |
| `undo()` | - | 復原 |
| `redo()` | - | 重做 |
| `save()` | - | 觸發儲存 |
| `clear()` | - | 清空編輯器 |
| `selectAll()` | - | 全選 |
| `changeMode(mode)` | `"light"` / `"dark"` | 切換主題 |

#### 屬性

| 屬性 | 類型 | 說明 |
|------|------|------|
| `text` | `string`（唯讀） | 取得編輯器純文字內容 |
| `viewer` | `MDViewer` | 綁定的 Viewer 實例 |

### MDViewer

```javascript
new MDViewer(config)
```

#### 建構參數

| 參數 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `id` | `string` | - | 掛載的 DOM 元素 ID |
| `emptyContent` | `string` | `""` | 無編輯器時的預設 Markdown 內容 |
| `style.mode` | `string` | `"auto"` | 主題模式 |
| `style.fill` | `boolean` | `true` | 填滿父容器 |
| `style.fontFamily` | `string` | `"sans-serif"` | Viewer 字型 |
| `sync.editor` | `MDEditor` | `null` | 綁定的編輯器實例 |
| `sync.delay` | `number` | `300` | 渲染延遲（毫秒） |
| `sync.scroll` | `boolean` | `false` | 同步捲動 |
| `hashtag.path` | `string` | `""` | Hashtag 連結路徑前綴 |
| `hashtag.target` | `string` | `""` | Hashtag 連結開啟方式 |

#### 方法

| 方法 | 參數 | 說明 |
|------|------|------|
| `init(text?)` | `string` | 重新渲染內容 |
| `clear()` | - | 清空 Viewer |
| `changeMode(mode)` | `"light"` / `"dark"` | 切換主題 |

#### 屬性

| 屬性 | 類型 | 說明 |
|------|------|------|
| `editor` | `MDEditor` | 綁定的 Editor 實例 |
| `body` | `HTMLElement` | Viewer DOM 元素 |

### MDParser

```javascript
new MDParser(config)
```

#### 建構參數

| 參數 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `standard` | `boolean` | `true` | 使用標準 Markdown 解析模式 |
| `text` | `string` | `""` | 預設 Markdown 文字 |

#### 方法

| 方法 | 參數 | 回傳值 | 說明 |
|------|------|--------|------|
| `parse(text?)` | `string` | `string` | 將 Markdown 轉為 HTML 字串 |

### 支援的 Markdown 語法

| 語法 | 說明 |
|------|------|
| `# ~ ######` | H1 ~ H6 標題 |
| `**text**` | 粗體 |
| `*text*` | 斜體 |
| `~~text~~` | 刪除線 |
| `==text==` | 標記（高亮） |
| `^text^` | 上標 |
| `~text~` | 下標 |
| `` `code` `` | 行內代碼 |
| ` ``` ` | 程式碼區塊 |
| `> text` | 引用區塊 |
| `- item` | 無序列表 |
| `1. item` | 有序列表 |
| `- [x] item` | 核取方塊 |
| `[text](url)` | 超連結 |
| `![alt](url)` | 圖片 |
| `---` | 水平線 |
| `\| table \|` | 表格 |
| `#hashtag` | Hashtag 連結 |
| Mermaid 區塊 | Mermaid 圖表 |

***

©️ 2024 [邱敬幃 Pardn Chiu](https://linkedin.com/in/pardnchiu)
