# File Links

With `fileEndpoint` set, local file paths in the document become clickable links that call a URL you choose; this page covers how paths are recognized and how to configure the endpoint.

## Recognized Paths

| Syntax | Example |
|---|---|
| Starts with `~/` | `~/Desktop/test.md` |
| Absolute path with at least two directories | `/Users/pardn/a/b.go` |
| Absolute path with a file extension | `/tmp/demo.png` |
| Any of the above inside a code span | `` `/tmp/demo.png` `` |

Paths may contain Chinese, Japanese, Korean and other characters; a trailing `.` or `/` is not part of the path.

## Configuration

```javascript
MDParser.Init({ fileEndpoint: "http://localhost:3000/v1/file/open?path={filepath}" });
```

| Item | Rule |
|---|---|
| `{filepath}` | Replaced with `encodeURIComponent(path)` on click; may appear more than once |
| Unset | Paths render as plain text with no link |
| Not a string, or missing `{filepath}` | Logs `[Invalid] fileEndpoint: must be a string containing {filepath}` and is treated as unset |
| Output | `<a class="md-link md-file-link" data-path="...">` |
| Click | Once `Refresh()` binds it, `fetch()` calls the replaced URL |
| Errors | Non-2xx logs `[Upstream] <url>: HTTP <status>`; a connection failure logs `[Unavailable] <url>: <reason>` |

Call `Parse().html()` again after setting `fileEndpoint` so paths render as links.

## Examples

### Without fileEndpoint

Paths stay plain text, including paths with non-ASCII characters.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Paths: ~/Desktop/test.md, /Users/pardn/a/b.go, `/tmp/demo.png`

Non-ASCII paths: /Users/pardn/Desktop/截圖2026-10-19凌晨1.03.32.png, ~/문서/보고서.md, /Users/pardn/ドキュメント/メモ.txt
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### With fileEndpoint

The same paths become `md-file-link` anchors; clicking one calls the endpoint.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Paths: ~/Desktop/test.md, /Users/pardn/a/b.go, `/tmp/demo.png`

Non-ASCII paths: /Users/pardn/Desktop/截圖2026-10-19凌晨1.03.32.png, ~/문서/보고서.md, /Users/pardn/ドキュメント/メモ.txt
</script>
<script>
  const out = document.getElementById("out");
  MDParser.Init({ fileEndpoint: "https://example.com/open?path={filepath}" });
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
  console.log([...out.querySelectorAll(".md-file-link")].map((a) => a.dataset.path).join("\n"));
</script>
```
