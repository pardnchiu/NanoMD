# Links and Media

This page covers inline, reference and relative links, bare URLs, image sizing, videos, and YouTube or Vimeo embeds.

## Links

| Syntax | Notes |
|---|---|
| `[text](https://example.com)` | Inline link, opens in a new tab |
| `[text](https://example.com "title")` | The title takes double or single quotes |
| `[![alt](badge.svg)](https://example.com)`, `[![alt](badge.svg)][ref]`, ``[`code` and $x$](https://example.com)`` | Link text, inline or reference, can hold images (with sizes), inline code and inline math |
| `[text](./a.md)`, `[text](../b.md)`, `[text](/c)`, `[text](#anchor)` | Relative paths and anchors |
| `[mail](mailto:a@example.com)`, `[call](tel:+886912345678)` | `mailto:` and `tel:` links open in the same page, without `target="_blank"`; also works in reference definitions |
| `https://example.com` | Bare URLs become links; trailing punctuation stays in the text |
| `[text][ref]` with `[ref]: https://example.com "title"` | Reference link; `ref` is case-insensitive and the definition line is not output |

URLs with other schemes (such as `javascript:` or `ftp:`) are not linked and stay as plain text. The scheme must be lowercase (`MAILTO:` stays text), and a bare `mailto:` address is not linked.

## Images and Videos

| Syntax | Output |
|---|---|
| `![alt](a.png "title")` | `<img class="md-img">` |
| `![a](a.png)(300x200)` | 300px wide, 200px high |
| `![a](a.png)(50%x)` | Width only; a number with `%` is a percentage |
| `![a](a.png)(x120)` | Height only |
| `![a](a.png)(120)` | Same width and height |
| `![a](a.mp4)`, `![a](a.mov)` | `<video controls>`, sizes work the same way |

## Embedded Players

When a link points to YouTube (`youtube.com/watch?v=`, `youtu.be/`, `/embed/`) or Vimeo, an embedded player follows the link.

## Examples

### Links

Inline links, bare URLs, styles wrapping URLs, relative paths and titles.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Links: [NanoMD](https://nanomd.pardn.io), bare URL https://github.com/pardnchiu/NanoMD.

Styles around bare URLs: **https://nanomd.pardn.io**, ~~https://github.com~~, *https://nanomd.pardn.io*, _https://github.com_

Relative: [same dir](./other.md), [parent](../README.md), [root](/docs/a.md), [anchor](#md-fn-1), [javascript: rejected](javascript:alert(1))

Same page: [mail](mailto:dev@pardn.io), [call](tel:+886912345678), bare mailto:dev@pardn.io

Titles: [NanoMD](https://nanomd.pardn.io "NanoMD docs"), [GitHub](https://github.com/pardnchiu/NanoMD 'single-quoted title')
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### Linked Images

An image inside the link text becomes a clickable image, such as a badge; inline code and math in link text render as well.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Badge: [![Awesome Go](https://awesome.re/mentioned-badge.svg)](https://github.com/avelino/awesome-go)

Image with text: [dog ![dog](/static/image/dog-7128749_640.jpg)(x40) photo](https://nanomd.pardn.io)

Code and math: [`Parse()`](https://nanomd.pardn.io/parser-api), [formula $E=mc^2$](https://nanomd.pardn.io/syntax-inline)
</script>
<script>
  MDParser.Init({ enable: { latex: true } }).then(() => {
    const out = document.getElementById("out");
    out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
    MDParser.Refresh(out);
    console.log(out.querySelectorAll("a > img").length, "linked images");
  });
</script>
```

### Reference Links

Case-insensitive labels, titles, relative targets, styles around references and undefined labels.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
References: [NanoMD][nanomd], [different case][NANOMD], [with title][gh], [relative][rel], **[bold around][nanomd]**, [undefined][missing]

[nanomd]: https://nanomd.pardn.io
[gh]: https://github.com/pardnchiu/NanoMD "GitHub source"
[rel]: ./other.md
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### Images and Video

Titles, both sizes, width only, height only, a single square value and a video.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Image: ![dog](/static/image/dog-7128749_640.jpg "dog")

Size: ![flamingo](/static/image/flamingo-9190160_640.jpg)(300x200)

Width only: ![hippopotamus](/static/image/hippopotamus-9147023_640.jpg)(50%x)

Height only: ![stilt](/static/image/stilt-8593487_640.jpg)(x120)

Square: ![corn](/static/image/corn-9135131_640.jpg)(120) one value sets both

Video: ![video](/static/image/233867_tiny.mp4 "video title")(320x)
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### YouTube and Vimeo

Links and bare URLs to YouTube or Vimeo get an embedded player.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
YouTube: [Me at the zoo](https://www.youtube.com/watch?v=jNQXAC9IVRw)

YouTube bare URL: https://youtu.be/jNQXAC9IVRw

Vimeo: [The New Vimeo Player](https://vimeo.com/76979871)
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```
