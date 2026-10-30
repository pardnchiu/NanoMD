# v1 停用說明

v2 只提供 Markdown 解析器 `MDParser`；本頁列出 v1 移除的 API、替代方式、遷移範例與 v1／v2 效能比較。

## 舊名：PDMarkdownKit

NanoMD 最早在 npm 上以 `pdmarkdownkit` 發佈。自 1.8.1（2024-11-29）起改以 `@pardnchiu/nanomd` 發佈；`pdmarkdownkit` 停在 1.8.2，之後的版本只用新名稱。仍在安裝 `pdmarkdownkit` 的專案拿到的是 v1 編輯器與檢視器，可依本頁遷移到 v2。

```bash
npm uninstall pdmarkdownkit
npm i @pardnchiu/nanomd
```

## 繼續使用 v1

移除於 v2.0.0：v1 的 `MDEditor`、`MDViewer` 與 `MDParser` 類別只保留在 1.x，不再開發新功能。需要編輯器的專案固定使用 1.11.6：

```html
<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@1.11.6/dist/NanoMD.js"></script>
```

```bash
npm i @pardnchiu/nanomd@1.11.6
```

請寫明確的版本號；`@latest` 或不帶版本號會解析到 v2。

## 已移除的 API

| v1 | 移除於 | v2 替代做法 |
|---|---|---|
| `MDEditor` | 移除於 v2.0.0 | 改用 `<textarea>`、CodeMirror、Monaco 等編輯器，內容交給 `MDParser.Parse()` |
| `MDViewer` | 移除於 v2.0.0 | `container.innerHTML = MDParser.Parse(text).html()` 後呼叫 `MDParser.Refresh(container)` |
| `new MDParser({ standard }).parse(text)` | 移除於 v2.0.0 | `MDParser.Parse(text).html()`；`standard` 選項取消，一律支援完整語法 |
| `PDMarkdownEditor` | 移除於 v2.0.0 | 無公開替代 |
| ESM 匯出 `editor`、`viewer` | 移除於 v2.0.0 | `import { MDParser } from "@pardnchiu/nanomd"` |
| `sync.editor`、`sync.delay`、`sync.scroll` | 移除於 v2.0.0 | 自行監聽輸入並防抖，見下方遷移範例 |
| `emptyContent` | 移除於 v2.0.0 | 由呼叫端決定空內容要渲染什麼 |
| `hashtag.path`、`hashtag.target` | 移除於 v2.0.0 | `MDParser.Init({ hashtagEndpoint: "/tags/{tag}" })`，見 [Hashtag 連結](/zh/hashtag-links) |
| `changeMode()`、`style.mode` | 移除於 v2.0.0 | 在 `.nanomd` 容器設定 `data-mode`，見 [樣式主題](/zh/theming) |
| `style.fill` | 移除於 v2.0.0 | 在 `.nanomd` 容器設定 `data-fill="1"` |
| `download()`、`openfile()`、`undo()`、`redo()`、快捷鍵與工具列 | 移除於 v2.0.0 | 隨 `MDEditor` 移除，無公開替代 |

## 檔案與樣式

| v1 | v2 |
|---|---|
| `dist/NanoMD.js` | `dist/parser.js`（全域 `MDParser`） |
| `dist/NanoMD.esm.js` | `dist/parser.esm.js` |
| `dist/NanoMD.css`、`dist/NanoMD-output.css` | `dist/parser.css`，由 `parser.js` 自動從同目錄載入 |
| 容器 class `.pd-md-viewer` | `.nanomd` |
| 載入時自動插入 Material Symbols、Mermaid、code-prettify | 以 `MDParser.Init({ enable })` 按需載入，見 [依賴與渲染](/zh/runtime-dependencies) |

## 行為差異

| 項目 | v1.11.6 | v2 |
|---|---|---|
| 文字中的 `$` | 輸出為 `@dollar@` | 原樣輸出；成對的 `$...$` 為行內數學式 |
| YouTube／Vimeo 預覽 | 未設定 `hashtag.path` 時不產生 | 一律附上內嵌播放器 |
| raw HTML | 不清洗 | 移除危險標籤、事件屬性與 `javascript:` 網址 |
| Mermaid 語法錯誤 | 顯示 Mermaid 錯誤圖 | 改顯示為一般程式碼區塊 |
| 執行環境 | 需要瀏覽器 DOM | `Parse()`、`html()` 可在 Node.js、Worker 執行 |

## v1 vs v2

將本站的文件頁合併成一份文件，重複放大到各尺寸後，在 macOS 的 headless Chrome 155 量測轉成 HTML 的耗時。每個案例先暖機 5 次，再連續執行至少 1.5 秒取平均；單次超過 3 秒只量一次，超過 15 秒記為超時。

| 文件大小 | v1.11.6 `new MDParser().parse()` | v2 `Parse().html()` | v1 / v2 |
|---|---|---|---|
| 6.1 KB | 3.23 ms | 0.097 ms | 33× |
| 42.2 KB | 26.9 ms | 0.87 ms | 31× |
| 405.2 KB | 1,402 ms | 9.15 ms | 153× |
| 1.00 MB | 8,853 ms | 23.1 ms | 383× |
| 2.00 MB | 超時（超過 15 秒） | 44.6 ms | 超時 |
| 4.00 MB | 超時（超過 15 秒） | 88.3 ms | 超時 |

## 遷移範例

v1 的編輯器加檢視器，在 v2 改為任一編輯器加防抖渲染：

```demo
<textarea id="editor" rows="4" style="width:100%"># Hello

Edit me, the preview updates after you stop typing.</textarea>
<div id="viewer" class="nanomd"></div>
<script>
  const editor = document.getElementById("editor");
  const viewer = document.getElementById("viewer");
  let timer;

  function render() {
    viewer.innerHTML = MDParser.Parse(editor.value).html();
    MDParser.Refresh(viewer).catch((err) => console.error(err.message));
  }

  editor.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(render, 300);
  });
  render();
  console.log(viewer.querySelector(".md-h1").textContent);
</script>
```
