# 連結與媒體

本頁涵蓋行內、參照式與相對路徑連結、裸網址、圖片尺寸、影片與 YouTube／Vimeo 內嵌。

## 連結

| 寫法 | 說明 |
|---|---|
| `[文字](https://example.com)` | 行內連結，以新分頁開啟 |
| `[文字](https://example.com "標題")` | 標題可用雙引號或單引號 |
| `[![alt](badge.svg)](https://example.com)`、`[![alt](badge.svg)][ref]`、``[`code` 與 $x$](https://example.com)`` | 行內與參照式連結的文字皆可包含圖片（含尺寸）、行內程式碼與行內數學式 |
| `[文字](./a.md)`、`[文字](../b.md)`、`[文字](/c)`、`[文字](#anchor)` | 相對路徑與錨點 |
| `[mail](mailto:a@example.com)`、`[call](tel:+886912345678)` | `mailto:` 與 `tel:` 連結在同一頁開啟，不加 `target="_blank"`；參照式連結的定義行同樣適用 |
| `https://example.com` | 裸網址自動轉為連結，結尾的標點留在文字中 |
| `[文字][ref]` 搭配 `[ref]: https://example.com "標題"` | 參照式連結；`ref` 不分大小寫，定義行本身不輸出 |

帶有其他協定的網址（如 `javascript:`、`ftp:`）不轉為連結，原樣輸出為文字。協定須為小寫（`MAILTO:` 維持文字），裸寫的 `mailto:` 位址也不轉為連結。

## 圖片與影片

| 寫法 | 輸出 |
|---|---|
| `![替代文字](a.png "標題")` | `<img class="md-img">` |
| `![a](a.png)(300x200)` | 寬 300px、高 200px |
| `![a](a.png)(50%x)` | 只設寬度，數字加 `%` 為百分比 |
| `![a](a.png)(x120)` | 只設高度 |
| `![a](a.png)(120)` | 寬高相同 |
| `![a](a.mp4)`、`![a](a.mov)` | `<video controls>`，同樣可指定尺寸 |

## 內嵌播放器

連結網址是 YouTube（`youtube.com/watch?v=`、`youtu.be/`、`/embed/`）或 Vimeo 時，連結後面會附上內嵌播放器。

## 範例

### 連結

行內連結、裸網址、樣式包住網址、相對路徑與標題。

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

### 連結內的圖片

連結文字中的圖片會成為可點擊的圖片（例如徽章）；連結文字中的行內程式碼與數學式同樣會渲染。

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

### 參照式連結

不分大小寫的標籤、標題、相對路徑、樣式包住參照與未定義的標籤。

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

### 圖片與影片

標題、寬高、只設寬度、只設高度、單一數值的正方形，以及影片。

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

### YouTube 與 Vimeo

YouTube 或 Vimeo 的連結與裸網址會附上內嵌播放器。

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
