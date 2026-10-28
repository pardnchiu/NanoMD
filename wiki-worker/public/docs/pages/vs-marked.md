# Markdown to HTML: NanoMD vs marked

This page renders the same Markdown with NanoMD and [marked](https://marked.js.org) 18.1.1 side by side, then compares parse speed.

## Differences

| Item | NanoMD `Parse().html()` | marked `marked.parse()` |
|---|---|---|
| Output structure | Classed elements such as `<span class="md-h1">` and `<span class="md-line">`, styled by `parser.css` inside `.nanomd`; see [HTML Output](/html-output) | Plain `<h1>`, `<p>` and other standard tags with no styles |
| `==mark==`, `H~2~O`, `x^2^` | `<mark>`, `<sub>`, `<sup>` | Left as text; `~2~` becomes `<del>` |
| `> [!NOTE]` alerts | `md-alert` blockquote with a title | Plain blockquote with the `[!NOTE]` text |
| Footnotes `[^1]` | Reference link and a footnote section | Left as text |
| Bare URL | Link with `target="_blank"` | Link |
| Event attributes in raw HTML (`onload`) | Removed | Kept and executed |
| `javascript:` link | Not converted to a link | Kept as `href` |
| JSON AST | `Parse()` returns a tree before `html()`; see [AST Nodes](/ast) | Token list from `marked.lexer()` |

## XSS Protection

Markdown often comes from users, so the renderer decides whether a comment or note can run script in the page. NanoMD sanitizes its own output; marked [does not sanitize its output](https://github.com/markedjs/marked#readme) and asks you to pass the HTML through DOMPurify or another sanitizer.

| Input | NanoMD | marked without a sanitizer |
|---|---|---|
| `[click](javascript:console.log('clicked'))` | Not linked; the Markdown stays visible as plain text, so nothing can be clicked and no content is lost | `<a href="javascript:...">`; clicking runs the script |
| `<img src="..." onload="...">` | `onload` removed, the image is kept | `onload` kept and runs when the image loads |

Only `http(s)`, `mailto:`, `tel:`, relative paths and `#anchor` become links. In the example below, the `[click](javascript:...)` line shows up as text on the NanoMD side, and only the marked side prints `onload ran` to the log. See [Security](/security) for every escaping and sanitizing rule.

## Speed

The documentation pages of this site are joined into one document and repeated to each size, then rendered to HTML in headless Chrome 155 on macOS. Each case warms up 5 runs, then repeats for at least 1.5 seconds and shows the average.

| Size | NanoMD `Parse().html()` | marked `marked.parse()` | marked / NanoMD |
|---|---|---|---|
| 6.1 KB | 0.097 ms | 0.127 ms | 1.30× |
| 42.2 KB | 0.87 ms | 1.08 ms | 1.24× |
| 405.2 KB | 9.15 ms | 10.2 ms | 1.11× |
| 1.00 MB | 23.1 ms | 26.3 ms | 1.14× |
| 2.00 MB | 44.6 ms | 53.9 ms | 1.21× |
| 4.00 MB | 88.3 ms | 101.7 ms | 1.15× |

The two outputs differ in structure, so the numbers show the same order of magnitude rather than identical work: NanoMD also builds the AST and sanitizes HTML, and its output is about 16% larger.

## Examples

### Same Markdown, Two Renderers

The left side is NanoMD, the right side is marked. The image's `onload` runs only on the marked side and prints to the log below.

```demo
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1rem">
  <section><h4>NanoMD</h4><div id="nano" class="nanomd"></div></section>
  <section><h4>marked</h4><div id="marked"></div></section>
</div>
<script type="text/markdown" id="md">
# Release Notes

**Bold**, *italic*, ~~deleted~~, ==marked==, H~2~O, x^2^ and `code`.

> [!NOTE]
> GitHub alert blockquote.

- [x] Task done
- [ ] Task pending
  - Nested item

| Left | Center | Right |
|:---|:---:|---:|
| a | b | c |

Footnote reference[^1] and https://nanomd.pardn.io bare URL.

~~~js
console.log("hello");
~~~

<img src="/static/image/dog-7128749_640.jpg" width="120" onload="console.log('onload ran')">

[click](javascript:console.log('clicked'))

[^1]: Footnote definition.
</script>
<script type="module">
  import { marked } from "https://cdn.jsdelivr.net/npm/marked@18.1.1/lib/marked.esm.js";

  const md = document.getElementById("md").textContent;
  document.getElementById("nano").innerHTML = MDParser.Parse(md).html();
  document.getElementById("marked").innerHTML = marked.parse(md);
</script>
```

### Speed in Your Browser

Press the button to time both parsers on the sample repeated to about 10 KB, 100 KB and 1 MB; each case runs for one second and the result table is rendered by NanoMD.

```demo
<button id="run">Run benchmark</button>
<div id="result" class="nanomd"></div>
<script type="text/markdown" id="md">
## Section

Paragraph with **bold**, *italic*, `code`, a [link](https://nanomd.pardn.io) and ~~deleted~~ text.

- Item one
- Item two
  1. Nested ordered
  2. Another

| Name | Value |
|---|---:|
| alpha | 1 |
| beta | 2 |

> Quoted line with *emphasis*.

~~~js
const sum = (a, b) => a + b;
~~~
</script>
<script type="module">
  import { marked } from "https://cdn.jsdelivr.net/npm/marked@18.1.1/lib/marked.esm.js";

  const base = document.getElementById("md").textContent;
  const button = document.getElementById("run");
  const result = document.getElementById("result");
  const nano = (s) => MDParser.Parse(s).html();
  const mark = (s) => marked.parse(s);

  function bench(fn, input) {
    for (let i = 0; i < 10; i++) fn(input);
    let runs = 0;
    const start = performance.now();
    while (performance.now() - start < 1000) {
      fn(input);
      runs++;
    }
    return (performance.now() - start) / runs;
  }

  button.addEventListener("click", async () => {
    button.disabled = true;
    const rows = ["| Size | NanoMD | marked | marked / NanoMD |", "|---|---|---|---|"];
    for (const kb of [10, 100, 1000]) {
      result.innerHTML = MDParser.Parse(`Running ${kb} KB...`).html();
      await new Promise((r) => setTimeout(r, 50));
      const input = Array(Math.ceil((kb * 1024) / base.length)).fill(base).join("\n");
      const a = bench(nano, input);
      const b = bench(mark, input);
      rows.push(`| ${(input.length / 1024).toFixed(1)} KB | ${a.toFixed(3)} ms | ${b.toFixed(3)} ms | ${(b / a).toFixed(2)}× |`);
    }
    result.innerHTML = MDParser.Parse(rows.join("\n")).html();
    console.log(navigator.userAgent);
    button.disabled = false;
  });
</script>
```
