# Lists and Tables

This page covers unordered, ordered, nested and task lists, the indent width setting, and tables with column alignment.

## Lists

| Syntax | Output |
|---|---|
| `- item`, `* item` | `<ul class="md-list">` |
| `1. item` | `<ol class="md-list">` |
| `- [ ] todo`, `- [x] done`, `- [X] done` | `<li class="md-task">` with a disabled checkbox |
| More indentation than the parent | Nested list; the marker changes with depth: `ul` uses disc, circle, square, `+`, `-`, `>` and `ol` uses decimal, upper-alpha, lower-alpha, upper-roman, lower-roman, `>` |
| Indented content on the next line | Belongs to the same item and can hold any block |
| Unindented text on the next line | Joins the item's paragraph until another block starts |

## Indent Width

Lists decide nesting by column width, and the width of a tab comes from `Init({ indent })`, 4 by default. A list nested with tabs is read as different levels under `indent: 2`; see [API Reference](/parser-api).

## Tables

The first row is the header and the second is the separator row; each cell is made of `-`, with `:` on either side for alignment:

| Separator | Alignment |
|---|---|
| `---` | None |
| `:---` | Left |
| `:---:` | Center |
| `---:` | Right |

Cells accept inline formatting; the table sizes to its content, a cell wraps once it reaches `40rem`, and when wider than the page it scrolls horizontally inside `md-table-wrap`. Write `\|` for a literal `|` in a cell; this also works inside code spans and at the end of a row.

## Examples

### Lists

Bullets with nesting, ordered items and task items.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
- Item one
- Item two
  - Nested item
- Item three

1. First
2. Second

- [ ] Todo
- [x] Done
- [X] Uppercase X also counts
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### Nested Markers

Six levels of `ul` and `ol`, each level with its own marker.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
- Level 1
  - Level 2
    - Level 3
      - Level 4
        - Level 5
          - Level 6

1. Level 1
   1. Level 2
      1. Level 3
         1. Level 4
            1. Level 5
               1. Level 6
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### Indent 4

A tab-indented item nests under an item whose content starts at column 4.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
1.  Ordered item, content starts at column 4
	- Nested item indented with a tab
</script>
<script>
  const out = document.getElementById("out");
  MDParser.Init({ indent: 4 });
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### Indent 2

With `indent: 2` the same tab no longer reaches column 4, so the list splits in two.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
1.  Ordered item, content starts at column 4
	- Nested item indented with a tab
</script>
<script>
  const out = document.getElementById("out");
  MDParser.Init({ indent: 2 });
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
</script>
```

### Tables

Column alignment, inline formatting in cells, and escaped `\|` that stays in one cell.

```demo
<div id="out" class="nanomd"></div>
<script type="text/markdown" id="md">
| Field | Description |
|:---|---:|
| a | **bold** |
| b | `code` |
| c | a \| b |
| d | `x \| y` |
</script>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse(document.getElementById("md").textContent).html();
  MDParser.Refresh(out);
  console.log("cells per row:", [...out.querySelectorAll("tr")].map((tr) => tr.children.length).join(" "));
</script>
```
