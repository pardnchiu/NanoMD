# AST Nodes

The `AST` returned by `Parse()` is an array of `BlockNode`s (it extends `Array`); this page lists every node type, its fields and the syntax that produces it.

## Block Nodes (BlockNode)

| `type` | Fields | Syntax |
|---|---|---|
| `text` | `children: InlineNode[]` | Paragraph; adjacent lines are joined by a `text` node whose value is `"\n"` |
| `heading` | `level`, `children` | `#` to `######`, Setext |
| `blockquote` | `tag?`, `children: BlockNode[]` | `>`; `tag` is `note` / `tip` / `important` / `warning` / `caution` |
| `list` | `ordered`, `children: ListItem[]` | `-`, `*`, `1.` |
| `table` | `align`, `children: TableRow[]` | GFM tables; each `align` entry is `left` / `center` / `right` / `null` |
| `codeBlock` | `lang?`, `value` | ` ``` ` / `~~~` fences; no `lang` when the fence is unclosed |
| `html` | `value` | Lines that start with an HTML tag (original text, sanitized at output) |
| `hr` | — | Horizontal rule |
| `break` | — | Blank lines |
| `footnotes` | `children: Footnote[]` | Footnote section at the end |

## Inline Nodes (InlineNode)

| `type` | Fields | Syntax |
|---|---|---|
| `text` | `value` | Plain text |
| `b`, `em`, `del`, `mark`, `sub`, `sup` | `children` | Bold, italic, strikethrough, highlight, subscript, superscript |
| `code` | `value` | Code span; may sit inside a style node's `children` |
| `math` | `value` | `$...$` |
| `link` | `href`, `tag?`, `title?`, `width?`, `height?`, `children` | Links (`http(s)`, `mailto:`, `tel:`, relative paths), images, videos, bare URLs, file paths, `#tag`; `tag` is `image` / `video` / `youtube` / `vimeo` / `file` / `hashtag` (`href` holds the tag without `#`) |
| `footnoteRef` | `id`, `index` | `[^id]`; `index` is its number |
| `br` | — | `<br>` inside a paragraph or table cell |

## Child Nodes

| Type | Fields |
|---|---|
| `ListItem` | `type: "listItem"`, `checked?` (task lists), `children: BlockNode[]` |
| `TableRow` | `type: "tableRow"`, `header`, `children: TableCell[]` |
| `TableCell` | `type: "tableCell"`, `children: InlineNode[]` |
| `Footnote` | `type: "footnote"`, `id`, `index`, `children: BlockNode[]` |

`json()` returns a deep copy of the nodes as a plain `BlockNode[]`: it has no `html()`, `undefined` fields are dropped, and changing it does not affect the AST, so it can be stored or handed to renderers on other platforms. The type definitions ship with the package in `dist/types/types.d.ts`.

```demo
<script>
  const ast = MDParser.Parse("## Hi\n\n- [x] done\n\nE = $mc^2$ [link](https://nanomd.pardn.io)");
  console.log(JSON.stringify(ast.json(), null, 2));
</script>
```
