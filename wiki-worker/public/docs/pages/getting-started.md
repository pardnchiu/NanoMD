# Getting Started

This page installs NanoMD and renders a first piece of Markdown to HTML in the browser and in Node.js.

## Prerequisites

| Item | Requirement |
|---|---|
| Browser | ES2022, RegExp lookbehind and `\p{L}`: Chrome, Edge, Firefox, Safari 16.4+ |
| Node.js | 22 or higher (for ESM or `require()`) |
| Network | Access to `cdn.jsdelivr.net` when Mermaid, KaTeX, Chart.js or code-prettify is enabled; see [Dependencies and Refresh](/runtime-dependencies) |

## Installation

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@2.0.6/dist/parser.js"></script>
```

The script exposes a global `MDParser` and inserts `parser.css` from the same directory into `<head>`.

### npm

```bash
npm i @pardnchiu/nanomd
```

```javascript
import { MDParser } from "@pardnchiu/nanomd";
```

`require("@pardnchiu/nanomd")` also works in Node.js 22. If a bundler keeps the styles from loading automatically, add `import "@pardnchiu/nanomd/parser.css";`.

## First Render

`Parse()` returns an AST and `html()` turns it into HTML; put the output in a `class="nanomd"` container to apply the styles.

```demo
<div id="preview" class="nanomd"></div>
<script>
  const md = "# Hello\n\nThis is **NanoMD**.\n\n- [x] Parse\n- [ ] Render";
  document.getElementById("preview").innerHTML = MDParser.Parse(md).html();
</script>
```

## Output HTML in Node.js

`Parse()` and `html()` need no DOM, so they work for SSR and build pipelines.

```javascript
import { MDParser } from "@pardnchiu/nanomd";

const html = MDParser.Parse("## Title\n\n- [x] Done").html();
console.log(html);
```

## Enable Diagrams, Math and Highlighting

`Init()` loads the enabled dependencies and `Refresh()` renders inside a container that is already in the document. Until the dependencies load, those blocks show as plain code blocks.

```demo
<div id="out" class="nanomd"></div>
<script>
  const md = "~~~math\nE = mc^2\n~~~\n\n~~~mermaid\nflowchart LR\n  A[Markdown] --> B[AST] --> C[HTML]\n~~~";
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(md).html();
  MDParser.Init({ enable: { mermaid: true, latex: true } })
    .then(() => MDParser.Refresh(out))
    .then(() => console.log("rendered:", out.querySelectorAll("[data-rendered]").length))
    .catch((err) => console.error(err.message));
</script>
```

## Next Steps

| Goal | Page |
|---|---|
| Learn the supported syntax | [Blocks](/syntax-blocks), [Inline Formatting](/syntax-inline) |
| Render the AST yourself | [AST Nodes](/ast) |
| Upgrade from v1 | [v1 Deprecation](/v1-deprecated) |
