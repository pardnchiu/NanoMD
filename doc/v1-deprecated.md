# NanoMD - v1 Deprecation

Last updated: 2026-10-20

> Back to [README](../README.md)

v2 ships only the Markdown parser `MDParser`. The v1 `MDEditor`, `MDViewer` and `MDParser` class are deprecated and receive no new features; projects that need the editor should pin 1.11.6.

## Keep Using v1

```html
<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@1.11.6/dist/NanoMD.js"></script>
```

```bash
npm i @pardnchiu/nanomd@1.11.6
```

Pin the exact version; `@latest` or an unversioned URL resolves to v2, where `MDEditor` and `MDViewer` do not exist.

## Removed APIs and Replacements

| v1 | v2 |
|---|---|
| `MDEditor` | Removed; use `<textarea>`, CodeMirror, Monaco or another editor and pass its content to `MDParser.Parse()` |
| `MDViewer` | Removed; set `container.innerHTML = MDParser.Parse(text).html()` and call `MDParser.Refresh(container)` |
| `new MDParser({ standard }).parse(text)` | `MDParser.Parse(text).html()`; the `standard` option is gone and the full syntax is always on |
| `window.PDMarkdownEditor` | Removed |
| ESM exports `editor`, `viewer`, `MDViewer`, `MDEditor` | Removed; use `import { MDParser } from "@pardnchiu/nanomd"` |
| `MDViewer` `sync.editor`, `sync.delay`, `sync.scroll` | Removed; listen for input and debounce yourself (see [Documentation](./doc.md#advanced-live-preview-with-debounce)) |
| `MDViewer` `emptyContent` | Removed; the caller decides what to render for empty content |
| `hashtag.path`, `hashtag.target` (`#tag` links) | Removed; `#tag` renders as plain text |
| `changeMode(mode)`, `style.mode` | Set `data-mode="dark"` / `"light"` on the `.nanomd` container; without it the system preference applies |
| `style.fill` | Set `data-fill="1"` on the `.nanomd` container |
| `download()`, `openfile()`, HTML export, deploy button | Removed with `MDEditor` |
| Keyboard shortcuts, undo/redo, floating toolbar | Removed with `MDEditor` |

## Files and Styles

| v1 | v2 |
|---|---|
| `dist/NanoMD.js` | `dist/parser.js` (global `MDParser`) |
| `dist/NanoMD.esm.js` | `dist/parser.esm.js` |
| `dist/NanoMD.debug.js` | `dist/parser.debug.js` |
| `dist/NanoMD.css`, `dist/NanoMD-output.css` | `dist/parser.css`, loaded automatically by `parser.js` from the same directory |
| Container class `.pd-md-viewer` | `.nanomd` |
| Container class `.pd-md-editor` | Removed |
| Output elements (native `h1`, `strong`, `table` styling) | `md-*` classes (such as `.md-h1`, `.md-bold`, `.md-table`); see [Documentation](./doc.md#main-css-classes) for the full list |
| Material Symbols, Mermaid and code-prettify injected on load | No longer injected; `MDParser.Init({ enable })` loads Mermaid, KaTeX, Chart.js and code-prettify on demand |

## Behavior Changes

| Item | v1.11.6 | v2 |
|---|---|---|
| `$` in text | Rendered as `@dollar@` | Rendered as is; a `$...$` pair is inline math |
| YouTube/Vimeo previews | Not produced by `MDViewer` without `hashtag.path` | Embedded players are always added |
| Raw HTML and text escaping | Not sanitized; filter before writing to `innerHTML` | Text and attributes are escaped, and raw HTML loses dangerous tags, event attributes and `javascript:` URLs |
| Invalid Mermaid syntax | Shows Mermaid's error graphic | Falls back to a plain code block |
| Render speed | About 1.8 s for 443 KB, about 11 s for 1 MB | About 18 ms for 443 KB, about 47 ms for 1 MB (see [v1 vs v2](../README.md#v1-vs-v2)) |
| Runtime | Requires a browser DOM | `Parse()` and `html()` run in Node.js and Workers |

New syntax in v2: footnotes, reference links, inline math, ` ```math `, ` ```chartjs `, `~~~` and nested fences, and multi-backtick code spans; see [Documentation](./doc.md#api-reference) for the full list.

## Migration Example

v1:

```html
<section id="editor"></section>
<section id="viewer"></section>

<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@1.11.6/dist/NanoMD.js"></script>
<script>
  const editor = new MDEditor({ id: "editor", defaultContent: "# Hello" });
  const viewer = new MDViewer({ id: "viewer", sync: { editor: editor, delay: 300 } });
</script>
```

v2:

```html
<textarea id="editor"># Hello</textarea>
<div id="viewer" class="nanomd"></div>

<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@2.0.0/dist/parser.js"></script>
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
  MDParser.Init({ enable: { mermaid: true, highlight: true } })
    .then(render)
    .catch((err) => console.error(err.message));
</script>
```

***

©️ 2024 [邱敬幃 Pardn Chiu](https://www.linkedin.com/in/pardnchiu)
