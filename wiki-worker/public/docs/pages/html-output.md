# HTML Output

`AST.html()` turns the result of `Parse()` into an HTML string; this page covers the output structure and classes, and how it divides work with the JSON AST.

## Usage

```javascript
const html = MDParser.Parse(markdown).html();
container.innerHTML = html;
```

`html()` needs no DOM, so it produces HTML in Node.js and Workers; once the HTML is in the document, call `Refresh()` to render charts and math. See [Dependencies and Refresh](/runtime-dependencies).

## Output Structure

| Node | HTML |
|---|---|
| Paragraph | `<span class="md-line">` |
| Heading | `<span class="md-h1">` to `<span class="md-h6">`; `<h1 class="md-h1">` to `<h6 class="md-h6">` when `parseHeading` is `true` |
| Blank lines | `<br>` |
| Bold | `<span class="md-bold">`; other inline styles use `<em>`, `<del>`, `<mark>`, `<sub>`, `<sup>` |
| Blockquote / alert | `<blockquote class="md-quote">`; alerts add `md-alert md-alert-{tag}` and `md-alert-title` |
| Lists | `<ul class="md-list">` / `<ol class="md-list">`; task items are `<li class="md-task">` |
| Tables | `<div class="md-table-wrap"><table class="md-table">`; the table sizes to its content and scrolls inside the wrapper when wider |
| Code blocks | `<pre class="prettyprint" name="{lang}">`, one `<li>` per line, with a `<button class="copy">` |
| mermaid / math / chartjs | `md-mermaid` / `md-latex` / `md-chart` wrappers holding a fallback code block |
| Links | `<a class="md-link" target="_blank" rel="noopener">`, while `mailto:` / `tel:` links omit `target` and `rel`; images and videos are `md-img`, YouTube/Vimeo add `md-embed`; file paths and `#tag` become `md-file-link` / `md-hashtag` only when their endpoint is set |
| Footnotes | `md-footnote-ref` and `md-footnotes` |

See [Theming](/theming) for the full styling.

## HTML vs JSON AST

| Need | Use |
|---|---|
| Display on a web page or with SSR | `html()` |
| Hand to native renderers such as iOS or Flutter | `ast.json()`; you build the renderer |
| Inspect or rewrite content before output | Work on the `AST` array, then call `html()` |

```demo
<div id="out" class="nanomd"></div>
<script>
  const ast = MDParser.Parse("# Title\n\n> [!NOTE]\n> Edited before output.");
  ast[0].children.push({ type: "text", value: " (edited)" });
  document.getElementById("out").innerHTML = ast.html();
  console.log(ast.html());
</script>
```
