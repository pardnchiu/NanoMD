var test = `# 標題 H1 (1)
## 標題 H2 (1)
### 標題 H3
#### 標題 H4
##### 標題 H5
###### 標題 H6

標題 H1 (2)
===

標題 H2 (2)
---

行內：**粗體**、__粗體__、*斜體*、_斜體_、~~刪除~~、==標記==、H~2~O、x^2^、\`code\`

不轉換：snake_case_name、__init__x、2^10 and 3^ x、\`a*b*c\`

連結：[NanoMD](https://nanomd.pardn.io)、裸網址 https://github.com/pardnchiu/NanoMD。

路徑：~/Desktop/test.md、/Users/pardn/a/b.go、\`/tmp/demo.png\`

> 引言第一行
> 引言第二行 **粗體**
>> 引言第三行，內引言 **粗體**

- 項目一
- 項目二
  - 巢狀項目
- 項目三

1. 第一
2. 第二

| 欄位 | 說明 |
|:---|---:|
| a | **粗體** |
| b | \`code\` |

***

- - -

___

\`\`\`js
const a = "<b>不轉換</b>";
\`\`\`

<div onclick="alert(1)">raw HTML（onclick 應被移除）</div>
<a href="javascript:alert(1)">javascript: href（應被移除）</a>
`;

const REGEX_HTML_DOM = /^\s*<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/;
const REGEX_MD_CODE_BLOCK_PREFIX = /^```(?!mermaid$)\S*$/;

function render(content) {
  if (!content) {
    content = test;
  }

  let lines = content.split("\n");
  let domMap = [];

  let i = 0;
  while (i < lines.length) {
    // * not trim, because need to be keep row indent, trim just for check
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    // * collect code block
    if (REGEX_MD_CODE_BLOCK_PREFIX.test(line.trim())) {
      let blockLines = [];
      let j = i + 1;
      while (j < lines.length && lines[j].trim() !== "```") {
        blockLines.push(lines[j]);
        j++;
      }
      domMap.push({ type: "codeBlock", value: blockLines.join("\n") });
      i = j + 1;
      continue;
    }

    if (REGEX_HTML_DOM.test(line)) {
      domMap.push({ type: "html", content: line });
      i++;
      continue;
    }

    console.log(line);
    domMap.push({ type: "text", content: line });

    i++;
  }
  return JSON.stringify(domMap, null, 2);
}
