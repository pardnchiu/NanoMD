# AST 節點

`Parse()` 回傳的 `AST` 是 `BlockNode` 陣列（繼承 `Array`），本頁列出每種節點的欄位與對應語法。

## 區塊節點（BlockNode）

| `type` | 欄位 | 對應語法 |
|---|---|---|
| `text` | `children: InlineNode[]` | 一般段落；相鄰行以值為 `"\n"` 的 `text` 節點連接 |
| `heading` | `level`、`children` | `#`～`######`、Setext |
| `blockquote` | `tag?`、`children: BlockNode[]` | `>`；`tag` 為 `note`／`tip`／`important`／`warning`／`caution` |
| `list` | `ordered`、`children: ListItem[]` | `-`、`*`、`1.` |
| `table` | `align`、`children: TableRow[]` | GFM 表格；`align` 每欄為 `left`／`center`／`right`／`null` |
| `codeBlock` | `lang?`、`value` | ` ``` `／`~~~` 圍欄；未閉合時沒有 `lang` |
| `html` | `value` | 以 HTML 標籤開頭的行（原文，輸出時才清洗） |
| `hr` | — | 水平線 |
| `break` | — | 空行 |
| `footnotes` | `children: Footnote[]` | 文末註腳區 |

## 行內節點（InlineNode）

| `type` | 欄位 | 對應語法 |
|---|---|---|
| `text` | `value` | 純文字 |
| `b`、`em`、`del`、`mark`、`sub`、`sup` | `children` | 粗體、斜體、刪除線、標記、下標、上標 |
| `code` | `value` | 行內程式碼；可位於樣式節點的 `children` 內 |
| `math` | `value` | `$...$` |
| `link` | `href`、`tag?`、`title?`、`width?`、`height?`、`children` | 連結（`http(s)`、`mailto:`、`tel:`、相對路徑）、圖片、影片、裸網址、檔案路徑、`#tag`；`tag` 為 `image`／`video`／`youtube`／`vimeo`／`file`／`hashtag`（`href` 為不含 `#` 的標籤） |
| `footnoteRef` | `id`、`index` | `[^id]`，`index` 為編號 |
| `br` | — | 段落或表格儲存格內的 `<br>` |

## 子節點

| 型別 | 欄位 |
|---|---|
| `ListItem` | `type: "listItem"`、`checked?`（任務清單）、`children: BlockNode[]` |
| `TableRow` | `type: "tableRow"`、`header`、`children: TableCell[]` |
| `TableCell` | `type: "tableCell"`、`children: InlineNode[]` |
| `Footnote` | `type: "footnote"`、`id`、`index`、`children: BlockNode[]` |

`json()` 回傳節點的深拷貝，為一般的 `BlockNode[]`：沒有 `html()`、`undefined` 欄位會被移除，修改它也不影響原本的 AST，可直接儲存或交給其他平台的渲染器。型別定義隨套件發佈於 `dist/types/types.d.ts`。

```demo
<script>
  const ast = MDParser.Parse("## Hi\n\n- [x] done\n\nE = $mc^2$ [link](https://nanomd.pardn.io)");
  console.log(JSON.stringify(ast.json(), null, 2));
</script>
```
