import { ParseBlockquote } from "./blockquote";
import { ParseCodeBlock } from "./codeBlock";
import { ParseHeading } from "./heading";
import { ParseInline } from "./inline";
import { REGEX_HTML_DOM, REGEX_MD_HR } from "./regex";
import { ParseTableBlock } from "./tableBlock";
import type { DependencyEnable, DependencyEndpoint, Node } from "./types";

export const EXTERNAL_DEPENDENCIES: Required<DependencyEndpoint> = {
  mermaidjs: "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js",
  katexjs: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js",
  katexcss: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
  googleprettifyjs: "https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js",
  chartjs: "https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js",
};

const insertedDependencies = new Map<string, Promise<void>>();

export function Init(enable: DependencyEnable = {}, endpoint: DependencyEndpoint = {}): Promise<void[]> {
  if (typeof document === "undefined") {
    return Promise.resolve([]);
  }
  const loads: Promise<void>[] = [];
  if (enable.mermaid) {
    loads.push(insertHead("script", endpoint.mermaidjs ?? EXTERNAL_DEPENDENCIES.mermaidjs));
  }
  if (enable.latex) {
    loads.push(insertHead("style", endpoint.katexcss ?? EXTERNAL_DEPENDENCIES.katexcss));
    loads.push(insertHead("script", endpoint.katexjs ?? EXTERNAL_DEPENDENCIES.katexjs));
  }
  if (enable.highlight) {
    loads.push(insertHead("script", endpoint.googleprettifyjs ?? EXTERNAL_DEPENDENCIES.googleprettifyjs));
  }
  if (enable.chartjs) {
    loads.push(insertHead("script", endpoint.chartjs ?? EXTERNAL_DEPENDENCIES.chartjs));
  }
  return Promise.all(loads);
}

export function Parse(content: string): Node[] {
  return ParseLines(content.split("\n"));
}

function insertHead(type: "script" | "style", url: string): Promise<void> {
  const inserted = insertedDependencies.get(url);
  if (inserted) {
    return inserted;
  }
  const preload = document.createElement("link");
  preload.rel = "preload";
  preload.href = url;
  preload.as = type;
  document.head.appendChild(preload);
  const element = type === "script" ? document.createElement("script") : document.createElement("link");
  const load = new Promise<void>((resolve, reject) => {
    element.onload = () => resolve();
    element.onerror = () => reject(new Error(`[Unavailable] ${url}: failed to load`));
  });
  insertedDependencies.set(url, load);
  if (element instanceof HTMLScriptElement) {
    element.src = url;
  } else {
    element.rel = "stylesheet";
    element.href = url;
  }
  document.head.appendChild(element);
  return load;
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

    domMap.push({ type: "text", children: ParseInline(line) });

    i++;
  }
  return domMap;
}
