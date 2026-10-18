import { parseBlockquote } from "./blockquote";
import { parseCodeBlock } from "./codeBlock";
import { parseHeading } from "./heading";
import { parseInline } from "./inline";
import { REGEX_HTML_DOM, REGEX_MD_HR } from "./regex";
import { parseTableBlock } from "./tableBlock";
import type { Node } from "./types";

export function Parse(content: string): Node[] {
  return parseLines(content.split("\n"));
}

export function parseLines(lines: string[], nested = false): Node[] {
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

    if (REGEX_HTML_DOM.test(line)) {
      domMap.push({ type: "html", value: line });
      i++;
      continue;
    }

    const table = parseTableBlock(lines, i);
    if (table) {
      domMap.push(table.node);
      i = table.next;
      continue;
    }

    if (line.includes("|")) {
      domMap.push({ type: "text", children: parseInline(line) });
      i++;
      continue;
    }

    if (REGEX_MD_HR.test(line)) {
      domMap.push({ type: "hr" });
      i++;
      continue;
    }

    const blockquote = parseBlockquote(lines, i, nested);
    if (blockquote) {
      domMap.push(blockquote.node);
      i = blockquote.next;
      continue;
    }

    const heading = parseHeading(lines, i);
    if (heading) {
      domMap.push(heading.node);
      i = heading.next;
      continue;
    }

    console.log(line);
    domMap.push({ type: "text", children: parseInline(line) });

    i++;
  }
  return domMap;
}
