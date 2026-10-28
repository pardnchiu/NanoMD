# 樣式主題

NanoMD 的樣式都限定在 `.nanomd` 容器內；本頁說明樣式如何載入、深色模式屬性與可覆寫的 CSS 變數。

## 載入方式

| 情境 | 樣式來源 |
|---|---|
| `<script src=".../parser.js">` | 自動在 `<head>` 插入同目錄的 `parser.css` |
| ESM | 依 `import.meta.url` 載入同目錄的 `parser.css` |
| 打包工具改變了檔案位置 | 自行 `import "@pardnchiu/nanomd/parser.css"` |
| `<script src=".../parser.js" data-nanomd-css="off">` | 不插入任何樣式；頁面已內嵌或自行連結 `parser.css` 時使用 |

### 略過自動載入的樣式表

再載入一份帶 `data-nanomd-css="off"` 的 `parser.js` 不會新增樣式表；不帶時則會新增一份。

```demo
<script>
  const count = () => document.querySelectorAll('link[rel="stylesheet"][href$="parser.css"]').length;
  const load = (off) => new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = document.querySelector('script[src$="parser.js"]').src;
    if (off) s.dataset.nanomdCss = "off";
    s.onload = resolve;
    document.head.appendChild(s);
  });
  console.log("loaded once:", count());
  load(true)
    .then(() => console.log("with data-nanomd-css=off:", count()))
    .then(() => load(false))
    .then(() => console.log("without it:", count()));
</script>
```

## 容器屬性

| 屬性 | 效果 |
|---|---|
| `class="nanomd"` | 套用全部樣式；`html()` 的輸出要放在這個容器內 |
| `data-mode="dark"` | 強制深色 |
| `data-mode="light"` | 強制淺色；未設定時跟隨系統的 `prefers-color-scheme` |
| `data-fill="1"` | 容器絕對定位並填滿最近的定位祖先 |

## CSS 變數

`.nanomd` 在自身定義這些變數，設在祖先元素上的值會被蓋掉；請在 `.nanomd` 元素上覆寫，用行內 `style`，或至少與 `.nanomd[data-mode="dark"]` 同等具體的選擇器，深色模式下才會生效：

| 變數 | 用途 |
|---|---|
| `--text`、`--text-color`、`--ink` | 內文、提示框內文、粗體與表格文字 |
| `--accent` | 連結、引言邊框、註腳引用 |
| `--gray`、`--gray-2`、`--gray-3` | 表格斑馬列與行內程式碼底色、框線、次要文字 |
| `--code-bg`、`--code-hover` | 程式碼區塊底色、滑過底色 |
| `--code-success`、`--code-error` | 複製成功、失敗時的程式碼底色 |
| `--copy-bg` | 複製按鈕底色 |
| `--mark` | `==標記==` 底色 |
| `--alert-note`、`--alert-tip`、`--alert-important`、`--alert-warning`、`--alert-caution` | 五種提示框的顏色 |

```demo
<div id="out" class="nanomd" data-mode="dark" style="--accent:#e11d48;--mark:#f59e0b;padding:16px">
</div>
<script>
  const out = document.getElementById("out");
  out.innerHTML = MDParser.Parse("> [!TIP]\n> Dark mode with a custom [accent](https://nanomd.pardn.io) and ==mark==.").html();
  addEventListener("load", () => console.log(getComputedStyle(out.querySelector(".md-link")).color));
</script>
```
