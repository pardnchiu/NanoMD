# Dependencies and Refresh

`Init()` loads Mermaid, KaTeX, Chart.js and code-prettify on demand, and `Refresh()` renders them inside a container on the page; this page covers how the two divide the work and how blocks fall back.

## Init

```javascript
MDParser.Init({ enable: { mermaid: true, latex: true, highlight: true, chartjs: true } })
  .then(() => MDParser.Refresh(container))
  .catch((err) => console.error(err.message));
```

| `enable` key | Loads | Renders |
|---|---|---|
| `mermaid` | Mermaid 11.4.1 | ` ```mermaid ` |
| `latex` | KaTeX 0.16.11 (JS and CSS) | ` ```math `, `$...$` |
| `highlight` | code-prettify | Code block highlighting |
| `chartjs` | Chart.js 4.5.1 | ` ```chartjs ` |

The second argument overrides any URL (`mermaidjs`, `katexjs`, `katexcss`, `googleprettifyjs`, `chartjs`); the rest fall back to `DEFAULT_ENDPOINT`. Each URL is inserted once; when one fails to load, the Promise rejects with `[Unavailable] <url>: failed to load`. In Node.js, `Init()` only sets options and loads nothing.

## Refresh

`Refresh(container)` processes the container in this order; without an argument it processes the whole `document`:

| Item | Behavior |
|---|---|
| Copy buttons | Binds clicks, marks the `pre` with `success` / `error` for one second, and passes the result to `OnCopyClick` |
| File links | Binds clicks that call `fileEndpoint`; see [File Links](/file-links) |
| Chart.js | Draws from `data-chart`, first destroying charts that left the page |
| KaTeX | Block and inline math |
| code-prettify | Highlights code blocks |
| Mermaid | Checks the syntax, then generates the SVG |

The container must already be in the document; otherwise nothing is processed and `[Invalid] container: not attached to the document` is logged.

## Fallbacks

| Case | Shown |
|---|---|
| `Refresh()` not called yet, or dependency not loaded | Plain code block |
| Rendered successfully | The wrapper gets `data-rendered` and shows the chart, formula or diagram; the code block hides |
| Invalid Mermaid syntax, block math or Chart.js config | Replaced by a plain code block |
| Invalid inline math | Restored as `$...$` text |

```demo
<div id="out" class="nanomd"></div>
<script>
  const md = "~~~math\n\\int_0^1 x\\,dx = \\frac{1}{2}\n~~~\n\nInline $a^2+b^2=c^2$, broken $\\frac{1}{$.";
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(md).html();
  console.log("before:", out.querySelectorAll("[data-rendered]").length);
  MDParser.Init({ enable: { latex: true } })
    .then(() => MDParser.Refresh(out))
    .then(() => console.log("after:", out.querySelectorAll("[data-rendered]").length))
    .catch((err) => console.error(err.message));
</script>
```
