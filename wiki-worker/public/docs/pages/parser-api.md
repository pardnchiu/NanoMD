# API Reference

Every export of `MDParser`; the IIFE build exposes a global `MDParser`, and the ESM build provides `MDParser` plus named exports of the same names.

## Exports

| Name | Signature | Description |
|---|---|---|
| `Parse` | `(content: string) => AST` | Parses Markdown into an AST |
| `AST.html` | `() => string` | Renders the AST to HTML with escaping and raw HTML sanitization |
| `AST.json` | `() => BlockNode[]` | Returns a deep copy of the nodes as plain JSON data, without `html()` |
| `Init` | `(options?: InitOptions, endpoint?: DependencyEndpoint) => Promise<void[]>` | Sets options and loads the enabled dependencies |
| `Refresh` | `(container?: ParentNode) => Promise<void>` | Renders dependencies and binds copy buttons and file links inside a container already in the document |
| `OnCopyClick` | `(handler: (success: boolean, pre: HTMLElement) => void) => void` | Registers a callback that runs after the built-in `success` / `error` feedback; only the last one is kept |
| `DEFAULT_ENDPOINT` | `Required<DependencyEndpoint>` | Default dependency URLs |
| `PARSE_OPTIONS` | `{ indent: number; fileEndpoint: string; hashtagEndpoint: string; parseHeading: boolean }` | The options currently in effect |
| `ParseLines` | `(lines: string[], nested?: boolean) => BlockNode[]` | The block parser itself; does not resolve footnotes or reference links |

## InitOptions

| Field | Type | Default | Description |
|---|---|---|---|
| `indent` | `number` | `4` | Column width of a tab |
| `enable` | `{ mermaid?, latex?, highlight?, chartjs? }` | All `false` | Dependencies to load |
| `fileEndpoint` | `string` | `""` | URL for file links, must contain `{filepath}`; see [File Links](/file-links) |
| `hashtagEndpoint` | `string` | `""` | URL for `#tag` links, must contain `{tag}`; see [Hashtag Links](/hashtag-links) |
| `parseHeading` | `boolean` | `false` | Render headings as `<h1>` to `<h6>` instead of `<span>`; only the boolean `true` enables it |

Every `Init()` call resets the options from that call; omitted fields return to their defaults.

### Heading Elements

With `parseHeading: true`, headings render as real heading elements that keep the same `md-h1` to `md-h6` classes and look the same; calling `Init()` without it switches back to `<span>`.

```demo
<div id="out" class="nanomd"></div>
<script>
  const out = document.getElementById("out");
  const md = "# Title\n## Section";
  MDParser.Init({ parseHeading: true });
  out.innerHTML = MDParser.Parse(md).html();
  console.log(out.innerHTML);
  MDParser.Init();
  console.log(MDParser.Parse(md).html());
</script>
```

## DependencyEndpoint

| Key | Default |
|---|---|
| `mermaidjs` | `https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js` |
| `katexjs` | `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js` |
| `katexcss` | `https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css` |
| `googleprettifyjs` | `https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js` |
| `chartjs` | `https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js` |

## Copy Callback

```demo
<div id="out" class="nanomd"></div>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse("~~~js\nconst a = 1;\n~~~").html();
  MDParser.OnCopyClick((success, pre) => {
    console.log("copied:", success, pre.getAttribute("name"));
  });
  MDParser.Refresh(out);
  console.log(Object.keys(MDParser).join(", "));
</script>
```

See [AST Nodes](/ast) for the node types.
