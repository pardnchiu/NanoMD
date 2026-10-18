import { ParseBlockquote } from "./blockquote";
import { ParseCodeBlock } from "./codeBlock";
import { ParseHeading } from "./heading";
import { ParseInline } from "./inline";
import { REGEX_HTML_DOM, REGEX_MD_HR } from "./regex";
import { ParseTableBlock } from "./tableBlock";
import type { Node } from "./types";

export const EXTERNAL_DEPENDENCIES: string[] = [
  "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js",
  "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js",
  "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
  "https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js",
];

if (typeof document !== "undefined") {
  insertHead("link", { rel: "preconnect", href: "https://cdn.jsdelivr.net" });
  for (const url of EXTERNAL_DEPENDENCIES) {
    if (url.endsWith(".js")) {
      insertHead("link", { rel: "preload", href: url, as: "script" });
      insertHead("script", { src: url });
    } else if (url.endsWith(".css")) {
      insertHead("link", { rel: "preload", href: url, as: "style" });
      insertHead("link", { rel: "stylesheet", href: url });
    }
  }
}

function insertHead(tag: "link" | "script", attrs: Record<string, string>): void {
  const dom = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    dom.setAttribute(k, v);
  }
  document.head.appendChild(dom);
}

export function Parse(content: string): Node[] {
  return ParseLines(content.split("\n"));
}

export function ParseLines(lines: string[], nested = false): Node[] {
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
    const codeBlock = ParseCodeBlock(lines, i);
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

    const table = ParseTableBlock(lines, i);
    if (table) {
      domMap.push(table.node);
      i = table.next;
      continue;
    }

    if (REGEX_MD_HR.test(line)) {
      domMap.push({ type: "hr" });
      i++;
      continue;
    }

    const blockquote = ParseBlockquote(lines, i, nested);
    if (blockquote) {
      domMap.push(blockquote.node);
      i = blockquote.next;
      continue;
    }

    const heading = ParseHeading(lines, i);
    if (heading) {
      domMap.push(heading.node);
      i = heading.next;
      continue;
    }

    console.log(line);
    domMap.push({ type: "text", children: ParseInline(line) });

    i++;
  }
  return domMap;
}
