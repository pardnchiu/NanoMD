# NanoMD - Documentation

> Back to [README](../README.md)

## Prerequisites

- A modern browser with ES2022 private class fields (`#field`): Chrome, Firefox, Safari, Edge
- Network access to `cdn.jsdelivr.net`, `fonts.googleapis.com` and `fonts.gstatic.com`: on load the bundle inserts Material Symbols, Mermaid 11.4.1, code-prettify and `NanoMD.css`
- Node.js only when building from source

## Installation

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@latest/dist/NanoMD.js"></script>
```

`NanoMD.js` inserts `NanoMD.css` into `<head>` by itself, so no extra `<link>` is required. The `MDEditor`, `MDViewer` and `MDParser` classes are attached to `window`.

### npm

```bash
npm i @pardnchiu/nanomd
```

### ESM

```javascript
import { MDEditor, MDViewer, MDParser } from "@pardnchiu/nanomd";
```

`dist/NanoMD.esm.js` is the same bundle with `export` statements appended, plus lowercase aliases `editor` (= `MDEditor`) and `viewer` (= `MDViewer`).

### From Source

```bash
git clone https://github.com/pardnchiu/NanoMD.git
cd NanoMD
npm install
npm run build:once
```

`build:once` produces `dist/NanoMD.debug.js`, `dist/NanoMD.js` (terser-minified) and `dist/NanoMD.esm.js`; `npm run build` watches `src/` and rebuilds, and `npm run sass` watches and compiles the SCSS.

## Usage

### Basic: Render Markdown Only

```html
<section id="viewer"></section>

<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@latest/dist/NanoMD.js"></script>
<script>
const viewer = new MDViewer({
    id: "viewer",
    emptyContent: "# Hello\n\nThis is **NanoMD**.",
    style: { mode: "auto", fill: false }
});
</script>
```

### Basic: Editor and Viewer

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

`style.fill` defaults to `true`, which positions the container absolutely to fill its parent, so the parent needs a `position` and a height.

### Advanced: Convert a String Only

```javascript
const parser = new MDParser({ standard: false });
const html = parser.parse("```js\nconst a = 1;\n```\n\n> [!TIP]\n> Extended syntax");

document.querySelector("#out").innerHTML = html;
if (typeof PR !== "undefined") {
    PR.prettyPrint();
}
```

`MDParser` defaults to `standard: true`, which skips fenced code blocks, Mermaid, marker/sub/superscript and alerts; pass `standard: false` to match `MDViewer` output. The output is not sanitized, so filter untrusted content before writing it to `innerHTML`.

### Advanced: Save and Image Upload

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
                console.error("save failed", err);
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
                console.error("upload failed", err);
                return { href: "", alt: "" };
            }
        }
    }
});
```

`Cmd/Ctrl+S` triggers `save()`; setting `event.upload` adds an upload button to the toolbar. A rejected `upload()` is not caught, so handle errors yourself; an empty `href` inserts nothing.

### Advanced: Follow the System Theme and Hashtags

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

`style.mode: "auto"` reads the system preference once when the bundle loads; to follow later changes, listen yourself and call `changeMode()` on both components.

### Advanced: Import and Export

```html
<input type="file" accept=".md" onchange="editor.openfile(this.files[0])">
<button onclick="editor.download('md')">Export Markdown</button>
<button onclick="editor.download('html')">Export HTML</button>
```

## API Reference

### MDEditor Options

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | None | Container element ID; if not found, a detached `<section>` is created; get it from `editor.body` and insert it yourself |
| `defaultContent` | `string` | `""` | Initial Markdown |
| `hotKey` | `boolean` | `true` | Enables formatting shortcuts; undo, save, Tab and other editing keys are unaffected |
| `autosave` | `boolean` | `true` | Updates the preview after input; when `false`, only `save()` updates it |
| `preventRefresh` | `boolean` | `false` | Registers `beforeunload` and blocks `F5` and `Cmd/Ctrl+R` |
| `tabPin` | `boolean` | `false` | Keeps the toolbar visible |
| `style.mode` | `string` | `"auto"` | `"auto"` / `"light"` / `"dark"` |
| `style.fill` | `boolean` | `true` | Fills the parent element |
| `style.fontFamily` | `string` | `"'Roboto Mono', monospace"` | Editor font |
| `style.showRow` | `boolean` | `true` | Shows line numbers |
| `style.placeholder.text` | `string` | `"Type here ..."` | Hint text for an empty row |
| `style.placeholder.color` | `string` | `"#bfbfbf"` | Hint color |
| `style.focus.backgroundColor` | `string` | `"#0000ff1a"` | Background of the current row |
| `style.focus.color` | `string` | `"#0000ffff"` | Text and caret color of the current row |
| `event.save` | `function(text)` | None | Save callback |
| `event.upload` | `async function()` | None | Returns `{ href, alt }`; when set, the toolbar shows an upload button |

### MDEditor Methods and Properties

| Name | Description |
|---|---|
| `body` | The editor container (`contentEditable`); each row is a `<div>` |
| `text` | Read-only; every row's text joined with `\n` |
| `viewer` | The bound `MDViewer`, set automatically by the viewer's `sync.editor` |
| `init(text?, withFocus = true, set = true)` | Rebuilds every row from `text`; does not update the preview |
| `clear()` | Empties the editor and updates the preview |
| `selectAll()` | Selects all content |
| `save()` | Runs the save flow based on `autosave` and `event.save`; without `event.save` it opens the export dialog |
| `unsave()` | Sets `data-saved` to `0` on the editor and the viewer |
| `undo()` / `redo()` | Undo / redo |
| `openfile(file)` | Reads a `File` with `FileReader` and updates the preview |
| `download(type = "md")` | Exports an `"md"` or `"html"` file |
| `changeMode(mode = "light")` | Writes `data-mode` directly |
| `bold(event)`, `italic(event)`, `strikethrough(event)`, `underline(event)`, `marker(event)`, `sup(event)`, `sub(event)`, `code(event)` | Insert inline formatting; HTML tags when `event.metaKey` or `event.ctrlKey` is true, Markdown markers otherwise; pass `{}` from code |
| `heading(event, num)` | `num` `1`-`6` inserts a heading, `0` removes an existing `#` |
| `blockquote()`, `ul()`, `ol()` | Prefix every selected row with `> `, `- `, `1. ` |
| `link(title, href)` | Inserts `[title](href)` |
| `image(src, alt, title)` | Inserts `![title or alt](src)` |

### MDViewer Options

| Option | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | None | Container element ID; if not found, a detached `<section>` is created |
| `emptyContent` | `string` | `""` | Markdown rendered when `init()` has no argument and the editor has no text |
| `style.mode` | `string` | `"auto"` | `"auto"` / `"light"` / `"dark"` |
| `style.fill` | `boolean` | `true` | Fills the parent element |
| `style.fontFamily` | `string` | `"sans-serif"` | Preview font |
| `sync.editor` | `MDEditor` | `null` | The editor to bind |
| `sync.delay` | `number` | `300` | Render delay in milliseconds; `0` falls back to `300` |
| `sync.scroll` | `boolean` | `false` | Editor wheel scrolls the viewer |
| `hashtag.path` | `string` | `""` | `#tag` link prefix; an empty string disables conversion |
| `hashtag.target` | `string` | `""` | `"_blank"` opens a new tab, anything else means `_self` |

### MDViewer Methods and Properties

| Name | Description |
|---|---|
| `body` | The viewer container |
| `editor` | The bound editor; can be assigned after construction |
| `init(txt = "")` | After `sync.delay`, renders `txt`, the editor text or `emptyContent`, then runs code highlighting and Mermaid |
| `clear()` | Empties the container |
| `unsave()` | Sets `data-saved` to `0` |
| `changeMode(mode = "light")` | Writes `data-mode` directly |

### MDParser

| Name | Description |
|---|---|
| `new MDParser({ standard = true, text = "" })` | With `standard` true, only standard syntax is handled; `text` is the default for `parse()` without an argument |
| `parse(text?)` | Returns an HTML string; creates no DOM container but still needs a browser environment |

### Keyboard Shortcuts

| Combo | Action | Controlled by `hotKey` |
|---|---|---|
| `Cmd/Ctrl+B` / `I` / `U` / `M` / `K` | Bold / italic / underline / marker / code | Yes |
| `Cmd/Ctrl+Shift+X` | Strikethrough | Yes |
| `Cmd/Ctrl+↑` / `↓` | Superscript / subscript | Yes |
| `Cmd/Ctrl+Z` / `Cmd/Ctrl+Shift+Z` | Undo / redo | No |
| `Cmd/Ctrl+S` | `save()` | No |
| `Cmd/Ctrl+A` | Selects the editor content only | No |
| `Tab` / `Cmd/Ctrl+]` | Inserts 4 spaces / indents every selected row | No |

### Known Limitations (v1.11.6)

| Symptom | Cause |
|---|---|
| A `$` in the text is output as `@dollar@` | Wrong mapping in the pipeline's restore table |
| `MDViewer` produces no YouTube/Vimeo preview cards without `hashtag.path` | `transToHTML()` passes the hashtag path into `setLink()`'s `isDefault` argument; `MDParser` is unaffected |
| Rows built through `init(text)` (`defaultContent`, `openfile()`, `undo()` / `redo()`) may not render marker, sub/superscript or alerts in the preview | `init()` runs `escapeHTML()` and then writes the result as plain text, so rows hold literal `&nbsp;` strings |
| Vimeo links block the main thread | Thumbnails are fetched with a synchronous XHR |

***

©️ 2024 [邱敬幃 Pardn Chiu](https://www.linkedin.com/in/pardnchiu)
