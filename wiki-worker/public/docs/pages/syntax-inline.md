# Inline Formatting

This page covers bold, italic, strikethrough, highlight, subscript, superscript, escapes, code spans and inline math.

## Styles

| Syntax | Output | Notes |
|---|---|---|
| `**bold**`, `__bold__` | `<span class="md-bold">` | `__` next to letters or digits is not converted (such as `__init__x`) |
| `*em*`, `_em_` | `<em>` | `_` between letters or digits is not converted (such as `snake_case`) |
| `***both***`, `___both___` | Bold wrapping italic | |
| `~~del~~` | `<del>` | |
| `==mark==` | `<mark>` | |
| `H~2~O` | `<sub>` | No spaces inside |
| `x^2^` | `<sup>` | No spaces inside |

Styles can wrap links, such as `**[link](https://nanomd.pardn.io)**`.

## Escapes

A backslash followed by any ASCII punctuation outputs that character, such as `\*`, `\_`, `` \` ``, `\[`, `\$` and `\\`.

## Code Spans

| Syntax | Notes |
|---|---|
| `` `code` `` | The content is not parsed further |
| `` **bold `code`** `` | Code spans can sit inside bold, italic, strikethrough and other styles; a `**` inside the code does not close the style |
| ```` `` a`b `` ```` | Matching open and close backtick counts wrap shorter backtick runs |
| One space on both sides of the content | One space is removed from each side, so content can start with a backtick |
| The content is a file path | Becomes a file link when `fileEndpoint` is set; see [File Links](/file-links) |

## Inline Math

`$...$` outputs `md-math-inline`, which `Refresh()` renders once KaTeX is enabled; see [Dependencies and Refresh](/runtime-dependencies). These are not converted:

| Syntax | Reason |
|---|---|
| `$5 and $10` | The closing `$` is followed by a digit |
| `$ a $` | Whitespace inside the `$` |
| `$$a$$` | Two `$` in a row |
| `\$` | Escaped |

## Examples

### Styles

Every inline style in one paragraph.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Inline: **bold**, __bold__, *italic*, _italic_, ***bold italic***, ___bold italic___, ~~deleted~~, ==marked==, H~2~O, x^2^, `code`
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### Escapes and Non-Conversion

Escaped markers and patterns that intentionally stay plain text.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Escapes: \*not italic\*, \_\_not bold\_\_, \`not code\`, \[not a link\](https://a.com), \\ a backslash itself

Not converted: snake_case_name, __init__x, 2^10 and 3^ x, `a*b*c`
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### Code Spans

Multi-backtick code spans, unmatched backtick runs and code inside styles.

`````demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Multi-backtick code: ```abc```, `` a`b ``, `` ``` ``, ``mismatched`, ```` a lone backtick run

Inside styles: **bold `code` here**, *`italic code`*, ~~`struck code`~~, **a `**` b**
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
`````

### Inline Math

Inline math renders with KaTeX; invalid math falls back to `$...$`, and money amounts stay text.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
Inline math: $E=mc^2$, $\frac{a}{b}$, $x_1 + x_2^{*}$, $\{a, b\}$, $\frac{1}{$ shows the source when invalid

Not math: prices $5 and $10, \$escaped\$, `$inside code$`, $ spaced $, $$a$$
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Init({ enable: { latex: true } })
    .then(() => MDParser.Refresh(out))
    .catch((err) => console.error(err.message));
</script>
```
