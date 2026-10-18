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

\`\`\`mermaid
flowchart LR
  A[輸入 Markdown] --> B{是否為區塊?}
  B -->|是| C[parseLines]
  B -->|否| D[parseInline]
  C --> E[renderToHTML]
  D --> E
\`\`\`

\`\`\`mermaid
sequenceDiagram
  User->>Editor: 輸入文字
  Editor->>Parser: render()
  Parser-->>Editor: JSON
\`\`\`

\`\`\`latex
E = mc^2
\`\`\`

\`\`\`math
\\int_0^\\infty e^{-x^2} \\, dx = \\frac{\\sqrt{\\pi}}{2}
\`\`\`

<div onclick="alert(1)">raw HTML（onclick 應被移除）</div>
<a href="javascript:alert(1)">javascript: href（應被移除）</a>
`;

const REGEX_HTML_DOM = /^\s*<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/;
const REGEX_MD_CODE_BLOCK_PREFIX = /^```(?!mermaid|latex|math)\S*$/;
const REGEX_MD_CODE_BLOCK_MERMAID = /^```mermaid\S*$/;
const REGEX_MD_CODE_BLOCK_LATEX = /^```(latex|math)\S*$/;
const REGEX_MD_H = /^(#{1,6})\s+(.+)$/;
const REGEX_MD_H1 = /^ {0,3}=+[ \t]*$/;
const REGEX_MD_H2 = /^ {0,3}-+[ \t]*$/;
const REGEX_MD_HR = /^ {0,3}([-*_])( *\1){2,}$/;

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

    if (REGEX_MD_CODE_BLOCK_MERMAID.test(line.trim())) {
      let blockLines = [];
      let j = i + 1;
      while (j < lines.length && lines[j].trim() !== "```") {
        blockLines.push(lines[j]);
        j++;
      }
      domMap.push({ type: "codeBlock", render: "mermaid", value: blockLines.join("\n") });
      i = j + 1;
      continue;
    }

    if (REGEX_MD_CODE_BLOCK_LATEX.test(line.trim())) {
      let blockLines = [];
      let j = i + 1;
      let nextLine = lines[j];
      while (j < lines.length && nextLine.trim() !== "```") {
        blockLines.push(nextLine);
        j++;
        nextLine = lines[j];
      }
      domMap.push({ type: "codeBlock", render: "latex", value: blockLines.join("\n") });
      i = j + 1;
      continue;
    }

    if (REGEX_MD_HR.test(line)) {
      domMap.push({ type: "hr" });
      i++;
      continue;
    }

    let mdHeading = line.match(REGEX_MD_H);
    if (mdHeading) {
      domMap.push({ type: "heading", level: mdHeading[1].length, value: mdHeading[2] });
      i++;
      continue;
    }

    if (lines[i + 1] !== undefined) {
      const nextLine = lines[i + 1];
      if (REGEX_MD_H1.test(nextLine)) {
        domMap.push({ type: "heading", level: 1, value: line });
        i += 2;
        continue;
      }
      if (REGEX_MD_H2.test(nextLine)) {
        domMap.push({ type: "heading", level: 2, value: line });
        i += 2;
        continue;
      }
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
