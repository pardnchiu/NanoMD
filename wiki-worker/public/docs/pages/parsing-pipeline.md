# Parsing Pipeline

This page covers the order in which `Parse()` classifies each line, how inline parsing masks content, and how footnotes and reference links resolve at the end.

## Block Order

`ParseLines` reads each line from top to bottom and checks the types in this order; the first match wins:

| Order | Block | Rule |
|---|---|---|
| 1 | Blank line | Whitespace only; consecutive blank lines merge into one `break` |
| 2 | Code block | Starts with 3 or more `` ` `` or `~` |
| 3 | Raw HTML | A line that starts with an HTML tag |
| 4 | Table | Contains `\|` and the next line is a separator row |
| 5 | Horizontal rule | `***`, `---`, `___` (spaces allowed) |
| 6 | Blockquote | Starts with `>`, including GitHub alerts |
| 7 | Footnote definition | `[^id]:`, checked at the top level only |
| 8 | Link definition | `[label]: url "title"`, produces no node |
| 9 | List | Starts with `-`, `*` or `1.` |
| 10 | Heading | `#` to `######`, or Setext `===` / `---` |
| 11 | Paragraph | Everything else; adjacent lines merge into one paragraph joined by a `"\n"` text node |

The content of blockquotes, list items and footnotes calls `ParseLines` recursively, so any block can appear inside them.

## Inline Parsing

| Step | Content |
|---|---|
| 1 | Replace code spans in the whole line with placeholders first; a file path inside one becomes a file link |
| 2 | Replace inline math and escapes with placeholders |
| 3 | Replace footnote references, links, images, paths and bare URLs with placeholders too |
| 4 | Match bold, italic, strikethrough, highlight, subscript and superscript |
| 5 | Restore the placeholders to their nodes |

Placeholders keep `_` and `*` inside links from being read as styles, and let styles that wrap links or code such as `**[text](url)**` and `` **bold `code`** `` parse correctly.

## Post-Processing

Nodes that need the whole document are resolved after parsing finishes:

| Item | Rule |
|---|---|
| Footnotes | Numbered by first reference, with a `footnotes` block appended at the end; references without a definition are restored as `[^id]` text |
| Reference links | Replaced with `link` nodes from the link definitions (case-insensitive); undefined ones are restored as `[label][ref]` text |

```demo
<div id="out" class="nanomd"></div>
<script>
  const md = "First line\nsecond line\n\n\n\nSee [docs][d] and a note[^1].\n\n[d]: https://nanomd.pardn.io\n[^1]: Footnote text.";
  const ast = MDParser.Parse(md);
  console.log(ast.map((node) => node.type).join(", "));
  document.getElementById("out").innerHTML = ast.html();
</script>
```
