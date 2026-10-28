# Footnotes

This page covers footnote references and definitions, the numbering rule, multi-line definitions and unresolved references.

## Syntax

| Syntax | Notes |
|---|---|
| `text[^1]`, `text[^note]` | Reference; the `id` can be a number or a word and is case-insensitive |
| `[^1]: content` | Definition, checked at the top level only; the content accepts inline formatting and can reference other footnotes |
| Indented line after a definition | Belongs to the same footnote and can continue over several paragraphs |
| Unindented text after a definition | Joins the same paragraph until another block starts |

## Output

| Case | Result |
|---|---|
| Reference with a definition | `<sup class="md-footnote-ref">` linking to `#md-fn-{index}` |
| Numbering | 1, 2, 3... by first reference; referencing the same footnote again reuses its number |
| Footnote section | A `<section class="md-footnotes">` at the end, each item with `id="md-fn-{index}"` |
| Reference without a definition | Output as the literal `[^id]` text |
| Definition that is never referenced | Not output |
| `[^1]` inside code or escaped | Not treated as a reference |

## Examples

### Footnotes

Numbered and named footnotes, repeated and case-insensitive references, undefined references, footnotes in footnotes and unused definitions.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Footnotes: first[^1], named[^note], again[^1], different case[^NOTE], undefined[^missing], not in code `[^1]`, escaped \[^1]

[^note]: Named footnote content with **bold**, referencing another footnote[^nested]
    Indented second paragraph

[^1]: First footnote content
continuing the same paragraph

[^nested]: A footnote referenced from a footnote

[^unused]: Unreferenced footnotes are not output
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```
