# Hashtag Links

With `hashtagEndpoint` set, `#tag` in the document becomes a link to a URL you choose, such as your own tag pages; this page covers how tags are recognized and how to configure the endpoint.

## Recognized Tags

| Syntax | Example |
|---|---|
| `#` followed by letters, digits, marks or `_` in any script | `#nanomd`, `#中文標籤`, `#123`, `#snake_case` |
| Full-width `＃` | `＃全形` |
| Inside other inline styles | `**#bold**` |
| Inside a heading's text | `# heading #tag` |

A tag ends at the first character that is not a letter, digit, mark or `_`, so in `#tag.` the `.` stays outside the link.

| Not a tag | Example |
|---|---|
| `#` right after a letter, digit, `_`, `&`, `#` or `/` | `a#b`, `&#123;`, `##x` |
| URL fragments | `https://nanomd.pardn.io/#frag` |
| Code spans and inline math | `` `#code` ``, `$#x$` |
| Escaped | `\#escaped` |
| Inside link text | `[label #x](https://nanomd.pardn.io)` |

## Configuration

```javascript
MDParser.Init({ hashtagEndpoint: "/tags/{tag}" });
```

| Item | Rule |
|---|---|
| `{tag}` | Replaced with `encodeURIComponent(tag)` without the `#`; may appear more than once |
| Unset | `#tag` renders as plain text, and the original `#` or `＃` is kept |
| Not a string, or missing `{tag}` | Logs `[Invalid] hashtagEndpoint: must be a string containing {tag}` and is treated as unset |
| Output | `<a href="..." target="_blank" rel="noopener" class="md-link md-hashtag">#tag</a>` |
| AST | `{ type: "link", tag: "hashtag", href: "tag", children: [{ type: "text", value: "#tag" }] }` whether or not the endpoint is set |

The endpoint is read when `html()` runs, so call `Parse().html()` again after setting `hashtagEndpoint`.

## Examples

### Without hashtagEndpoint

Tags stay plain text.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Tags: #nanomd #中文標籤 ＃全形 #123
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  console.log(out.querySelectorAll(".md-hashtag").length);
</script>
```

### With hashtagEndpoint

Tags become `md-hashtag` links; the second line shows what is left alone.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Tags: #nanomd #中文標籤 ＃全形 #123, **#bold**

Not tags: a#b, &#123;, https://nanomd.pardn.io/#frag, `#code`, \#escaped, [label #x](https://nanomd.pardn.io)
</script>
<script>
  const out = document.getElementById("out");
  MDParser.Init({ hashtagEndpoint: "https://github.com/topics/{tag}" });
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  console.log([...out.querySelectorAll(".md-hashtag")].map((a) => a.getAttribute("href")).join("\n"));
</script>
```
