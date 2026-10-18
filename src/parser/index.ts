import { parseCodeBlock } from "./codeBlock";
import { parseHeading } from "./heading";
import { parseInline } from "./inline";
import { REGEX_HTML_DOM, REGEX_MD_HR } from "./regex";
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
    const codeBlock = parseCodeBlock(lines, i);
    if (codeBlock) {
      domMap.push(codeBlock.node);
      i = codeBlock.next;
      continue;
    }

    if (REGEX_MD_HR.test(line)) {
      domMap.push({ type: "hr" });
      i++;
      continue;
    }

    const heading = parseHeading(lines, i);
    if (heading) {
      domMap.push(heading.node);
      i = heading.next;
      continue;
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
