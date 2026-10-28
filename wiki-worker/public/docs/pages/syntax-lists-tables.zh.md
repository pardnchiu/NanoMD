# 清單與表格

本頁涵蓋無序、有序、巢狀與任務清單、縮排寬度設定，以及可對齊欄位的表格。

## 清單

| 寫法 | 輸出 |
|---|---|
| `- 項目`、`* 項目` | `<ul class="md-list">` |
| `1. 項目` | `<ol class="md-list">` |
| `- [ ] 待辦`、`- [x] 完成`、`- [X] 完成` | `<li class="md-task">` 加停用的勾選框 |
| 比上一層多縮排 | 巢狀清單；符號依層級切換：`ul` 依序為 disc、circle、square、`+`、`-`、`>`，`ol` 依序為 decimal、upper-alpha、lower-alpha、upper-roman、lower-roman、`>` |
| 項目下一行縮排的內容 | 屬於同一項目，可放任何區塊 |
| 項目下一行未縮排的文字 | 併入該項目的段落，遇到其他區塊開頭時結束 |

## 縮排寬度

清單以欄寬判斷層級，tab 換算的欄寬由 `Init({ indent })` 設定，預設 4。以 tab 縮排的巢狀清單，在 `indent: 2` 時會被視為不同層級，見 [API 參考](/zh/parser-api)。

## 表格

第一列為表頭，第二列為分隔列，每格由 `-` 組成，前後加 `:` 指定對齊：

| 分隔列寫法 | 對齊 |
|---|---|
| `---` | 不指定 |
| `:---` | 靠左 |
| `:---:` | 置中 |
| `---:` | 靠右 |

儲存格內可使用行內格式；表格依內容寬度顯示，儲存格超過 `40rem` 時換行，比頁面寬時在外層 `md-table-wrap` 內橫向捲動。儲存格內要放 `|` 時寫成 `\|`，在行內程式碼內與列尾同樣適用。

## 範例

### 清單

巢狀無序清單、有序清單與任務清單。

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

### 巢狀符號

`ul` 與 `ol` 各六層，每一層使用不同符號。

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

### indent 為 4

以 tab 縮排的項目，巢狀在內容從第 4 欄開始的項目底下。

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

### indent 為 2

`indent: 2` 時同樣的 tab 到不了第 4 欄，清單斷成兩個。

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

### 表格

欄位對齊、儲存格內的行內格式，以及留在同一格的 `\|` 跳脫。

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
