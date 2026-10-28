# Security

`AST.html()` escapes content and sanitizes raw HTML at output; this page lists how each kind of input is handled.

## Escaping

| Position | Handling |
|---|---|
| Text, code spans, math, code blocks | `&` and `<` become entities |
| Attributes (`href`, `src`, `title`, `alt`, `data-*`, language tags) | `&`, `<` and `"` become entities |

The AST keeps the original text and escaping happens only in `html()`; code that renders the AST itself must escape on its own.

## Links and URLs

| Input | Result |
|---|---|
| `[x](javascript:alert(1))` and other schemes besides `http(s)`, `mailto:` and `tel:` | Not linked; stays as plain text |
| Relative paths, `#anchor` | Rendered as links |
| `mailto:` / `tel:` links | No `target` or `rel`; open in the same page |
| Other links | Get `target="_blank" rel="noopener"` |

## Raw HTML Sanitization

Lines that start with an HTML tag go through these rules before output:

| Rule | Examples |
|---|---|
| Remove dangerous tags (with paired content) | `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `<link>`, `<meta>`, `<base>` |
| Remove event attributes | `onclick`, `onerror` and every other `on*` preceded by whitespace, in single-quoted, double-quoted and unquoted forms; an attribute joined to the tag name by `/` (such as `<svg/onload=...>`) is not matched |
| Remove dangerous URL attributes | `href`, `src`, `xlink:href`, `action`, `formaction` whose literal value starts with `javascript:`, `vbscript:` or `data:text/html`; values are not entity-decoded first, so `jav&#x61;script:` is kept |

This is rule-based sanitization; when displaying fully untrusted content, pair it with a dedicated sanitizer such as DOMPurify.

## Examples

### Raw HTML

Event attributes and `javascript:` URLs are stripped from raw HTML lines.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
<div onclick="alert(1)">raw HTML (onclick removed)</div>
<a href="javascript:alert(1)">javascript: href (removed)</a>

[x](javascript:alert(1)) stays text, and <b> in text is escaped
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
  console.log(out.innerHTML);
</script>
```
