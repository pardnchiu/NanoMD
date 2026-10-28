# Theming

All NanoMD styles are scoped to the `.nanomd` container; this page covers how the styles load, the dark mode attributes and the CSS variables you can override.

## Loading

| Case | Style source |
|---|---|
| `<script src=".../parser.js">` | `parser.css` from the same directory is inserted into `<head>` automatically |
| ESM | `parser.css` is loaded from the same directory via `import.meta.url` |
| A bundler moves the files | `import "@pardnchiu/nanomd/parser.css"` yourself |
| `<script src=".../parser.js" data-nanomd-css="off">` | Nothing is inserted; use it when the page already inlines or links `parser.css` |

### Skip the Automatic Stylesheet

A second copy of `parser.js` with `data-nanomd-css="off"` adds no stylesheet; the same copy without it adds one.

```demo
<script>
  const count = () => document.querySelectorAll('link[rel="stylesheet"][href$="parser.css"]').length;
  const load = (off) => new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = document.querySelector('script[src$="parser.js"]').src;
    if (off) s.dataset.nanomdCss = "off";
    s.onload = resolve;
    document.head.appendChild(s);
  });
  console.log("loaded once:", count());
  load(true)
    .then(() => console.log("with data-nanomd-css=off:", count()))
    .then(() => load(false))
    .then(() => console.log("without it:", count()));
</script>
```

## Container Attributes

| Attribute | Effect |
|---|---|
| `class="nanomd"` | Applies all styles; put the output of `html()` inside this container |
| `data-mode="dark"` | Forces dark |
| `data-mode="light"` | Forces light; without it the system `prefers-color-scheme` applies |
| `data-fill="1"` | Positions the container absolutely to fill the nearest positioned ancestor |

## CSS Variables

`.nanomd` defines these variables on itself, so values set on an ancestor are replaced; override them on the `.nanomd` element, with an inline `style` or a selector at least as specific as `.nanomd[data-mode="dark"]` so the override also holds in dark mode:

| Variable | Used for |
|---|---|
| `--text`, `--text-color`, `--ink` | Body text, alert text, bold and table text |
| `--accent` | Links, blockquote border, footnote references |
| `--gray`, `--gray-2`, `--gray-3` | Striped table rows and code span background, borders, secondary text |
| `--code-bg`, `--code-hover` | Code block background, hover background |
| `--code-success`, `--code-error` | Code background after a successful or failed copy |
| `--copy-bg` | Copy button background |
| `--mark` | `==mark==` background |
| `--alert-note`, `--alert-tip`, `--alert-important`, `--alert-warning`, `--alert-caution` | Colors of the five alerts |

```demo
<div id="out" class="nanomd" data-mode="dark" style="--accent:#e11d48;--mark:#f59e0b;padding:16px">
</div>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse("> [!TIP]\n> Dark mode with a custom [accent](https://nanomd.pardn.io) and ==mark==.").html();
  addEventListener("load", () => console.log(getComputedStyle(out.querySelector(".md-link")).color));
</script>
```
