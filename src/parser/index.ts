import { ParseBlockquote } from "./blockquote";
import { ParseCodeBlock } from "./codeBlock";
import { ParseHeading } from "./heading";
import { ParseInline } from "./inline";
import {
  REGEX_HTML_DOM,
  REGEX_MD_CODE_LANG_CHARTJS,
  REGEX_MD_CODE_LANG_LATEX,
  REGEX_MD_CODE_LANG_MERMAID,
  REGEX_MD_HR,
} from "./regex";
import { ParseTableBlock } from "./tableBlock";
import type { Dependencies, DependencyEndpoint, Node } from "./types";

export const EXTERNAL_DEPENDENCIES: Required<DependencyEndpoint> = {
  mermaidjs: "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js",
  katexjs: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js",
  katexcss: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
  googleprettifyjs: "https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js",
  chartjs: "https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js",
};

const insertedDependencies = new Set<string>();

export function Parse(content: string, dependencies: Dependencies = {}): Node[] {
  const nodes = ParseLines(content.split("\n"));
  if (dependencies.enable && typeof document !== "undefined") {
    const endpoint = dependencies.endpoint ?? {};
    insertDependencies(nodes, {
      mermaidjs: endpoint.mermaidjs ?? EXTERNAL_DEPENDENCIES.mermaidjs,
      katexjs: endpoint.katexjs ?? EXTERNAL_DEPENDENCIES.katexjs,
      katexcss: endpoint.katexcss ?? EXTERNAL_DEPENDENCIES.katexcss,
      googleprettifyjs: endpoint.googleprettifyjs ?? EXTERNAL_DEPENDENCIES.googleprettifyjs,
      chartjs: endpoint.chartjs ?? EXTERNAL_DEPENDENCIES.chartjs,
    });
  }
  return nodes;
}

function insertDependencies(nodes: Node[], dependencies: Required<DependencyEndpoint>): void {
  for (const node of nodes) {
    if (node.type === "blockquote") {
      insertDependencies(node.children, dependencies);
    } else if (node.type === "codeBlock") {
      const lang = node.lang ?? "";
      if (REGEX_MD_CODE_LANG_MERMAID.test(lang)) {
        insertHead("script", dependencies.mermaidjs);
      } else if (REGEX_MD_CODE_LANG_LATEX.test(lang)) {
        insertHead("style", dependencies.katexcss);
        insertHead("script", dependencies.katexjs);
      } else if (REGEX_MD_CODE_LANG_CHARTJS.test(lang)) {
        insertHead("script", dependencies.chartjs);
      } else {
        insertHead("script", dependencies.googleprettifyjs);
      }
    }
  }
}

function insertHead(type: "script" | "style", url: string): void {
  if (insertedDependencies.has(url)) {
    return;
  }
  insertedDependencies.add(url);
  const preload = document.createElement("link");
  preload.rel = "preload";
  preload.href = url;
  preload.as = type;
  document.head.appendChild(preload);
  if (type === "script") {
    const script = document.createElement("script");
    script.src = url;
    document.head.appendChild(script);
  } else {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
  }
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
