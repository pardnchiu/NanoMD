# Blocks

This page covers headings, paragraphs and blank lines, blockquotes with GitHub alerts, horizontal rules and raw HTML lines.

## Headings

| Syntax | Output |
|---|---|
| `#` to `######`, a space and text | `md-h1` to `md-h6` |
| Text followed by a `===` line | `md-h1` (Setext) |
| Text followed by a `---` line | `md-h2` (Setext) |
| Any heading with `Init({ parseHeading: true })` | `<h1>` to `<h6>` with the same class instead of `<span>`; see [API Reference](/parser-api) |

Headings accept every inline format.

## Paragraphs and Blank Lines

| Syntax | Result |
|---|---|
| Two adjacent lines of text | Merged into one paragraph joined by a newline, shown as a space |
| One or more blank lines | One `break` node; consecutive blank lines are output once |
| Blank lines at the end of the document | Not output |

## Blockquotes and Alerts

Lines that start with `>` form a blockquote whose content can hold any block; `>>` nests a blockquote.

When the first line is only `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]` or `[!CAUTION]` (case-insensitive), the blockquote becomes the matching alert. With other text on the same line, or inside a nested blockquote, it stays a normal blockquote.

## Horizontal Rules

`***`, `---` or `___`: three or more of the same character, with optional spaces in between (such as `- - -`).

## Raw HTML

A whole line that starts with an HTML tag is kept as an `html` node; at output, dangerous tags, event attributes and `javascript:` URLs are removed. See [Security](/security).

## Examples

### Headings

ATX headings 1 to 6 with inline formatting, and Setext headings.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
# Heading H1 *(1)*
## Heading H2 _(1)_
### Heading ~~H3~~
#### Heading ==H4==
##### Heading H5
###### Heading H6

Setext H1^(2)^
===

Setext H2~(2)~
---
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### Paragraphs and Breaks

Adjacent lines merge into one paragraph; three blank lines still produce a single break.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Paragraph merge: two adjacent lines
become one paragraph joined by a soft break.

Three blank lines below produce a single break.



This line follows the merged break.
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### Blockquotes and Alerts

Nested quotes, the five GitHub alerts, and markers that stay plain blockquotes.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
> First quote line
> Second quote line **bold**
>> Nested quote **bold**

> [!NOTE]
> Useful information users should know, even when skimming.

> [!TIP]
> Helpful advice, with **bold** and `code`.

> [!IMPORTANT]
> Key information users need to know.
>
> - Lists work inside
> - Second item

> [!WARNING]
> Urgent info that needs immediate attention.

> [!CAUTION]
> Advises about risks or negative outcomes.

Not alerts (marker only, text on the marker line, nested in a quote):

> [!NOTE]

> [!TIP] text on the same line

> Outer quote
>> [!WARNING]
>> Marker inside a nested quote
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### Horizontal Rules and Pipes

The three rule styles, and lines that contain `|` but are not tables.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Lines containing | that are not tables keep their block type:

# Heading A | B

> Quote a | b

***

- - -

___
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```
