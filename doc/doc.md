# NanoMD - Documentation

Last updated: 2026-10-20

> Back to [README](../README.md)

## Prerequisites

- A browser with ES2022, RegExp lookbehind and `\p{L}`: Chrome, Edge, Firefox, Safari 16.4+
- Node.js 22 or higher to use the ESM build in Node; Node and Workers only need `Parse()` and `html()`, no DOM
- Network access to `cdn.jsdelivr.net` when Mermaid, KaTeX, Chart.js or code-prettify is enabled (override the URLs through `Init()` to self-host)
- Node.js 22 or higher to build from source

## Installation

### CDN (IIFE)

```html
<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@2.0.0/dist/parser.js"></script>
```

The script exposes a global `MDParser` and inserts `parser.css` from the same directory into `<head>`.

### npm (ESM)

```bash
npm i @pardnchiu/nanomd
```

```javascript
import { MDParser } from "@pardnchiu/nanomd";
```

`dist/parser.esm.js` also provides named exports (`Parse`, `Init`, `Refresh`, `OnCopyClick`...). Bundlers rewrite `import.meta.url`, so if the auto-loaded `parser.css` is not found, import it yourself:

```javascript
import "@pardnchiu/nanomd/parser.css";
```

### From Source

```bash
git clone https://github.com/pardnchiu/NanoMD.git
cd NanoMD
npm install
npm run build:once
```

`build:once` type-checks, then produces `dist/parser.js` (minified IIFE), `dist/parser.debug.js` (unminified IIFE), `dist/parser.esm.js` (ESM), `dist/types/` (`.d.ts`) and `dist/parser.css`; `npm run build` watches `src/parser/*.ts` and `src/sass/*.scss` and rebuilds.

## Configuration

### Init Options

`Init(options, endpoint)` sets the indent width and loads external dependencies; the returned Promise resolves once every dependency has loaded.

| Option | Type | Default | Description |
|---|---|---|---|
| `indent` | `number` | `4` | Column width of a tab, used for nested lists and code block alignment |
| `fileEndpoint` | `string` | `""` | URL requested when a file path is clicked; `{filepath}` is replaced with the encoded path (such as `http://localhost:3000/v1/file/open?path={filepath}`); when unset or missing `{filepath}`, paths render as plain text |
| `hashtagEndpoint` | `string` | `""` | Link target for `#tag`; `{tag}` is replaced with the encoded tag without `#` (such as `/tags/{tag}`); when unset or missing `{tag}`, `#tag` renders as plain text |
| `enable.mermaid` | `boolean` | `false` | Loads Mermaid to render ` ```mermaid ` blocks |
| `enable.latex` | `boolean` | `false` | Loads KaTeX (JS and CSS) to render ` ```math ` and `$...$` |
| `enable.highlight` | `boolean` | `false` | Loads code-prettify to highlight code blocks |
| `enable.chartjs` | `boolean` | `false` | Loads Chart.js to render ` ```chartjs ` blocks |

### Dependency URLs

The second argument overrides any dependency URL; the rest fall back to `DEFAULT_ENDPOINT`:

| Key | Default |
|---|---|
| `mermaidjs` | `https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js` |
| `katexjs` | `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js` |
| `katexcss` | `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css` |
| `googleprettifyjs` | `https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js` |
| `chartjs` | `https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js` |

KaTeX references its fonts by relative path inside the CSS, so when self-hosting keep `fonts/` next to `katex.min.css`, and point `katexjs` and `katexcss` at the same version.

### Styling

| Item | Description |
|---|---|
| Container | Styles apply only inside an element with `class="nanomd"` |
| Dark mode | Follows `prefers-color-scheme` by default; `data-mode="dark"` forces dark, `data-mode="light"` forces light |
| Fill parent | `data-fill="1"` positions the container absolutely to fill the nearest positioned ancestor |
| Dependency blocks | Mermaid / math / chartjs blocks show only the plain code block until `Refresh` renders them; on success the wrapper gets `data-rendered` and shows the diagram, formula or chart instead |
| Tables | Tables size to their content without wrapping cells; a table wider than the container scrolls horizontally inside `md-table-wrap` |
| Theme variables | Override CSS variables such as `--text`, `--accent`, `--code-bg`, `--mark` and `--alert-note` on `.nanomd` |

## Usage

### Basic: Render Markdown

```html
<div id="preview" class="nanomd"></div>

<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@2.0.0/dist/parser.js"></script>
<script>
  const preview = document.getElementById("preview");
  preview.innerHTML = MDParser.Parse("# Hello\n\nThis is **NanoMD**.").html();
</script>
```

### Basic: Output HTML in Node.js (SSR)

```javascript
import { MDParser } from "@pardnchiu/nanomd";

const html = MDParser.Parse("## Title\n\n- [x] Done\n- [ ] Todo").html();
console.log(html);
```

Node has no DOM, so `Init()` only sets `indent`, `fileEndpoint` and `hashtagEndpoint` and loads nothing, and `Refresh()` returns immediately.

### Advanced: Enable Mermaid, KaTeX, Chart.js and Highlighting

```javascript
import { MDParser } from "@pardnchiu/nanomd";

const preview = document.getElementById("preview");

function render(markdown) {
  preview.innerHTML = MDParser.Parse(markdown).html();
  return MDParser.Refresh(preview);
}

render(source);
MDParser.Init({ enable: { mermaid: true, latex: true, highlight: true, chartjs: true } })
  .then(() => render(source))
  .catch((err) => console.error(err.message));
```

When a dependency fails to load, the Promise rejects with `[Unavailable] <url>: failed to load`; blocks for dependencies that have not loaded show only the plain code block.

### Advanced: Live Preview with Debounce

```javascript
const input = document.querySelector("textarea");
let timer;

input.addEventListener("input", () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    preview.innerHTML = MDParser.Parse(input.value).html();
    MDParser.Refresh(preview).catch((err) => console.error(err.message));
  }, 300);
});
```

### Advanced: Hand the AST to Another Renderer

```javascript
const ast = MDParser.Parse(source);
const nodes = ast.json();
await fetch("/render", { method: "POST", body: JSON.stringify(nodes) });
```

`json()` returns a deep copy as a plain `BlockNode[]`: it has no `html()`, `undefined` fields are dropped, and changing it does not affect `ast`.

### Advanced: Link Hashtags

```javascript
MDParser.Init({ hashtagEndpoint: "/tags/{tag}" });
preview.innerHTML = MDParser.Parse("Release notes #nanomd #中文").html();
```

`#tag` and full-width `＃tag` become `<a class="md-link md-hashtag" href="/tags/nanomd">#nanomd</a>`; tags accept letters, digits, marks and `_` in any script. `#` right after a letter, digit, `_`, `&`, `#` or `/` (such as `a#b`, `&#123;`, URL fragments) is not a tag, nor is `#` inside code, math, link text or escaped as `\#`.

### Advanced: Copy Button Feedback

```javascript
MDParser.OnCopyClick((success, pre) => {
  pre.classList.add(success ? "success" : "error");
  setTimeout(() => pre.classList.remove("success", "error"), 1000);
});
```

`parser.css` changes the button label from `copy` to `copied` on the `success` class of `pre`, and both `success` and `error` switch the code background.

## API Reference

### Exports

| Name | Signature | Description |
|---|---|---|
| `MDParser` | Namespace | All of the exports below; the global name of the IIFE |
| `Parse` | `(content: string) => AST` | Parses Markdown into an AST |
| `AST.html` | `() => string` | Renders the AST to an HTML string with escaping and raw HTML sanitization |
| `AST.json` | `() => BlockNode[]` | Returns a deep copy of the nodes as plain JSON data, without the `AST` prototype |
| `Init` | `(options?: InitOptions, endpoint?: DependencyEndpoint) => Promise<void[]>` | Sets `indent`, `fileEndpoint` and `hashtagEndpoint`, and loads the enabled dependencies |
| `Refresh` | `(container?: ParentNode) => Promise<void>` | Binds copy buttons and file link clicks, and renders Chart.js, KaTeX, prettify and Mermaid inside the container; without an argument it processes the whole `document`; a container not yet in the document is skipped with an `[Invalid]` log |
| `OnCopyClick` | `(handler: (success: boolean, pre: HTMLElement) => void) => void` | Registers the copy button result callback; only the last registration is kept |
| `DEFAULT_ENDPOINT` | `Required<DependencyEndpoint>` | Default dependency URLs |
| `PARSE_OPTIONS` | `{ indent: number; fileEndpoint: string; hashtagEndpoint: string }` | Current parse settings |
| `ParseLines` | `(lines: string[], nested?: boolean) => BlockNode[]` | The block parser itself; does not resolve footnotes or reference links |

### Block Nodes (BlockNode)

| `type` | Fields | Syntax |
|---|---|---|
| `text` | `children: InlineNode[]` | Paragraph; adjacent lines are joined by a `text` node whose value is `"\n"` |
| `heading` | `level`, `children` | `#` to `######`, Setext (`===` / `---`) |
| `blockquote` | `tag?`, `children: BlockNode[]` | `>`; `tag` is `note` / `tip` / `important` / `warning` / `caution` |
| `list` | `ordered`, `children: ListItem[]` | `-`, `*`, `1.`; `ListItem.checked` marks task items |
| `table` | `align`, `children: TableRow[]` | GFM tables with `:---` / `:---:` / `---:` alignment |
| `codeBlock` | `lang?`, `value` | ` ``` ` / `~~~` (3 or more, nestable); `mermaid` / `math` / `chartjs` get extra rendering |
| `html` | `value` | Lines that start with an HTML tag |
| `hr` | — | `***`, `---`, `___` |
| `break` | — | Blank lines; consecutive ones merge into one |
| `footnotes` | `children: Footnote[]` | Footnote section at the end, numbered by first reference |

### Inline Nodes (InlineNode)

| `type` | Fields | Syntax |
|---|---|---|
| `text` | `value` | Plain text |
| `b`, `em`, `del`, `mark`, `sub`, `sup` | `children` | `**` / `__`, `*` / `_`, `~~`, `==`, `~x~`, `^x^`; `***` is `b` wrapping `em` |
| `code` | `value` | Backtick runs of any length with matching open and close counts |
| `math` | `value` | `$...$` |
| `link` | `href`, `tag?`, `title?`, `width?`, `height?`, `children` | Inline and reference links, relative paths, bare URLs, file paths, `![]()` images and videos, `#tag`; `tag` is `image` / `video` / `youtube` / `vimeo` / `file` / `hashtag` (`href` holds the tag without `#`) |
| `footnoteRef` | `id`, `index` | `[^id]` |

Image size goes after `![alt](src)`: `(300x200)`, `(50%x)`, `(x120)`, `(120)`; `.mp4` / `.mov` sources render as `<video>`.

### Main CSS Classes

| Class | Element |
|---|---|
| `md-line` | Paragraph |
| `md-h1` to `md-h6` | Headings |
| `md-bold` | Bold |
| `md-quote`, `md-alert`, `md-alert-{tag}`, `md-alert-title` | Blockquotes and alerts |
| `md-list`, `md-task` | Lists and task items |
| `md-table-wrap`, `md-table` | Tables |
| `md-link`, `md-file-link`, `md-hashtag`, `md-img`, `md-embed` | Links, file links (`data-path`, only when `fileEndpoint` is set), hashtags (only when `hashtagEndpoint` is set), images/videos, embedded players |
| `md-mermaid`, `md-latex`, `md-math`, `md-math-inline`, `md-chart` | Dependency rendering wrappers |
| `md-footnote-ref`, `md-footnotes` | Footnote references and section (anchor `#md-fn-{index}`) |
| `prettyprint`, `copy` | Code blocks and the copy button |

***

©️ 2024 [邱敬幃 Pardn Chiu](https://www.linkedin.com/in/pardnchiu)
