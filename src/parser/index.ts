import { parseInline } from "./inline";
import {
  REGEX_HTML_DOM,
  REGEX_MD_CODE_BLOCK_LATEX,
  REGEX_MD_CODE_BLOCK_MERMAID,
  REGEX_MD_CODE_BLOCK_PREFIX,
  REGEX_MD_H,
  REGEX_MD_H1,
  REGEX_MD_H2,
  REGEX_MD_HR,
} from "./regex";
import type { Node } from "./types";

export function Parse(content: string): string {
  const lines = content.split("\n");
  const domMap: Node[] = [];

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
      const blockLines: string[] = [];
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
      const blockLines: string[] = [];
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
      const blockLines: string[] = [];
      let j = i + 1;
      while (j < lines.length && lines[j].trim() !== "```") {
        blockLines.push(lines[j]);
        j++;
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

    const mdHeading = line.match(REGEX_MD_H);
    if (mdHeading) {
      domMap.push({ type: "heading", level: mdHeading[1].length, children: parseInline(mdHeading[2]) });
      i++;
      continue;
    }

    if (lines[i + 1] !== undefined) {
      const nextLine = lines[i + 1];
      if (REGEX_MD_H1.test(nextLine)) {
        domMap.push({ type: "heading", level: 1, children: parseInline(line) });
        i += 2;
        continue;
      }
      if (REGEX_MD_H2.test(nextLine)) {
        domMap.push({ type: "heading", level: 2, children: parseInline(line) });
        i += 2;
        continue;
      }
    }

    if (REGEX_HTML_DOM.test(line)) {
      domMap.push({ type: "html", value: line });
      i++;
      continue;
    }

    console.log(line);
    domMap.push({ type: "text", children: parseInline(line) });

    i++;
  }
  return JSON.stringify(domMap, null, 2);
}
