# v1 Deprecation

v2 ships only the Markdown parser `MDParser`; this page lists the v1 APIs that were removed, their replacements, a migration example and the v1 vs v2 benchmark.

## Former Name: PDMarkdownKit

NanoMD was first published on npm as `pdmarkdownkit`. From 1.8.1 (2024-11-29) it is published as `@pardnchiu/nanomd`; `pdmarkdownkit` stopped at 1.8.2, and every later release ships only under the new name. Projects still installing `pdmarkdownkit` get the v1 editor and viewer, so they can follow this page to migrate to v2.

```bash
npm uninstall pdmarkdownkit
npm i @pardnchiu/nanomd
```

## Keep Using v1

Removed in v2.0.0: the v1 `MDEditor`, `MDViewer` and `MDParser` class stay only in 1.x and receive no new features. Projects that need the editor pin 1.11.6:

```html
<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@1.11.6/dist/NanoMD.js"></script>
```

```bash
npm i @pardnchiu/nanomd@1.11.6
```

Pin the exact version; `@latest` or an unversioned URL resolves to v2.

## Removed APIs

| v1 | Removed | v2 replacement |
|---|---|---|
| `MDEditor` | Removed in v2.0.0 | Use `<textarea>`, CodeMirror, Monaco or another editor and pass its content to `MDParser.Parse()` |
| `MDViewer` | Removed in v2.0.0 | Set `container.innerHTML = MDParser.Parse(text).html()` and call `MDParser.Refresh(container)` |
| `new MDParser({ standard }).parse(text)` | Removed in v2.0.0 | `MDParser.Parse(text).html()`; the `standard` option is gone and the full syntax is always on |
| `PDMarkdownEditor` | Removed in v2.0.0 | No public replacement |
| ESM exports `editor`, `viewer` | Removed in v2.0.0 | `import { MDParser } from "@pardnchiu/nanomd"` |
| `sync.editor`, `sync.delay`, `sync.scroll` | Removed in v2.0.0 | Listen for input and debounce yourself; see the migration example below |
| `emptyContent` | Removed in v2.0.0 | The caller decides what to render for empty content |
| `hashtag.path`, `hashtag.target` | Removed in v2.0.0 | `MDParser.Init({ hashtagEndpoint: "/tags/{tag}" })`; see [Hashtag Links](/hashtag-links) |
| `changeMode()`, `style.mode` | Removed in v2.0.0 | Set `data-mode` on the `.nanomd` container; see [Theming](/theming) |
| `style.fill` | Removed in v2.0.0 | Set `data-fill="1"` on the `.nanomd` container |
| `download()`, `openfile()`, `undo()`, `redo()`, keyboard shortcuts and toolbar | Removed in v2.0.0 | Removed with `MDEditor`; no public replacement |

## Files and Styles

| v1 | v2 |
|---|---|
| `dist/NanoMD.js` | `dist/parser.js` (global `MDParser`) |
| `dist/NanoMD.esm.js` | `dist/parser.esm.js` |
| `dist/NanoMD.css`, `dist/NanoMD-output.css` | `dist/parser.css`, loaded automatically by `parser.js` from the same directory |
| Container class `.pd-md-viewer` | `.nanomd` |
| Material Symbols, Mermaid and code-prettify injected on load | Loaded on demand with `MDParser.Init({ enable })`; see [Dependencies and Refresh](/runtime-dependencies) |

## Behavior Changes

| Item | v1.11.6 | v2 |
|---|---|---|
| `$` in text | Rendered as `@dollar@` | Rendered as is; a `$...$` pair is inline math |
| YouTube/Vimeo previews | Not produced without `hashtag.path` | Embedded players are always added |
| Raw HTML | Not sanitized | Dangerous tags, event attributes and `javascript:` URLs are removed |
| Invalid Mermaid syntax | Shows Mermaid's error graphic | Falls back to a plain code block |
| Runtime | Requires a browser DOM | `Parse()` and `html()` run in Node.js and Workers |

## v1 vs v2

The documentation pages of this site are joined into one document and repeated to each size, then rendered to HTML in headless Chrome 155 on macOS. Each case warms up 5 runs, then repeats for at least 1.5 seconds and shows the average; a call that takes over 3 seconds is measured once, and one that takes over 15 seconds is recorded as a timeout.

| Size | v1.11.6 `new MDParser().parse()` | v2 `Parse().html()` | v1 / v2 |
|---|---|---|---|
| 6.1 KB | 3.23 ms | 0.097 ms | 33× |
| 42.2 KB | 26.9 ms | 0.87 ms | 31× |
| 405.2 KB | 1,402 ms | 9.15 ms | 153× |
| 1.00 MB | 8,853 ms | 23.1 ms | 383× |
| 2.00 MB | Timeout (over 15 s) | 44.6 ms | Timeout |
| 4.00 MB | Timeout (over 15 s) | 88.3 ms | Timeout |

## Migration Example

The v1 editor plus viewer becomes any editor plus a debounced render in v2:

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
