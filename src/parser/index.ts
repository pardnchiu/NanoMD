import { ParseBlockquote } from "./blockquote";
import { ParseCodeBlock } from "./codeBlock";
import { AppendFootnotes, ParseFootnoteBlock, ResetFootnote } from "./footnote";
import { ParseHeading } from "./heading";
import "./html";
import { ParseInline } from "./inline";
import { ParseLinkDefBlock, ResetLinkRef, RestoreLinkRefs } from "./link";
import { ParseListBlock } from "./list";
import { REGEX_HTML_DOM, REGEX_MD_HR } from "./regex";
import { ParseTableBlock } from "./tableBlock";
import { AST } from "./types";
import type { DependencyEndpoint, InitOptions, BlockNode } from "./types";

export { OnCopyClick, Refresh } from "./refresh";
export * as MDParser from "./index";

const SCRIPT_ELEMENT = typeof document !== "undefined" && document.currentScript instanceof HTMLScriptElement ? document.currentScript : null;
const SCRIPT_URL = SCRIPT_ELEMENT ? SCRIPT_ELEMENT.src : import.meta.url;

export const DEFAULT_ENDPOINT: Required<DependencyEndpoint> = {
  mermaidjs: "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js",
  katexjs: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js",
  katexcss: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
  googleprettifyjs: "https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js",
  chartjs: "https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js",
};

export const PARSE_OPTIONS: { indent: number; fileEndpoint: string } = {
  indent: 4,
  fileEndpoint: "",
};

const insertedDependencies = new Map<string, Promise<void>>();

if (typeof document !== "undefined" && SCRIPT_URL && SCRIPT_ELEMENT?.dataset.nanomdCss !== "off") {
  insertHead("style", new URL("parser.css", SCRIPT_URL).href).catch((err: Error) => console.error(err.message));
}

export function Init(options: InitOptions = {}, endpoint: DependencyEndpoint = {}): Promise<void[]> {
  PARSE_OPTIONS.indent = Number.isInteger(options.indent) && options.indent! > 0 ? options.indent! : 4;
  PARSE_OPTIONS.fileEndpoint = "";
  if (options.fileEndpoint !== undefined) {
    if (typeof options.fileEndpoint === "string" && options.fileEndpoint.includes("{filepath}")) {
      PARSE_OPTIONS.fileEndpoint = options.fileEndpoint;
    } else {
      console.error("[Invalid] fileEndpoint: must be a string containing {filepath}");
    }
  }
  if (typeof document === "undefined") {
    return Promise.resolve([]);
  }
  const enable = options.enable ?? {};
  const loads: Promise<void>[] = [];
  if (enable.mermaid) {
    loads.push(insertHead("script", endpoint.mermaidjs ?? DEFAULT_ENDPOINT.mermaidjs));
  }
  if (enable.latex) {
    loads.push(insertHead("style", endpoint.katexcss ?? DEFAULT_ENDPOINT.katexcss));
    loads.push(insertHead("script", endpoint.katexjs ?? DEFAULT_ENDPOINT.katexjs));
  }
  if (enable.highlight) {
    loads.push(insertHead("script", endpoint.googleprettifyjs ?? DEFAULT_ENDPOINT.googleprettifyjs));
  }
  if (enable.chartjs) {
    loads.push(insertHead("script", endpoint.chartjs ?? DEFAULT_ENDPOINT.chartjs));
  }
  return Promise.all(loads);
}

export function Parse(content: string): AST {
  ResetFootnote();
  ResetLinkRef();
  const domMap = ParseLines(content.split("\n"));
  AppendFootnotes(domMap);
  RestoreLinkRefs(domMap);
  return AST.from(domMap) as AST;
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

export function ParseLines(lines: string[], nested = false): BlockNode[] {
  const domMap: BlockNode[] = [];
  let textLine = -1;

  let i = 0;
  while (i < lines.length) {
    // * not trim, because need to be keep row indent, trim just for check
    const line = lines[i];

    if (line.trim() === "") {
      let next = i + 1;
      while (next < lines.length && lines[next].trim() === "") {
        next++;
      }
      if (domMap.length > 0 && domMap[domMap.length - 1].type !== "break") {
        domMap.push({ type: "break" });
      }
      i = next;
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

    if (!nested) {
      const footnote = ParseFootnoteBlock(lines, i);
      if (footnote) {
        i = footnote.next;
        continue;
      }
    }

    const linkDef = ParseLinkDefBlock(lines, i);
    if (linkDef) {
      i = linkDef.next;
      continue;
    }

    const list = ParseListBlock(lines, i);
    if (list) {
      domMap.push(list.node);
      i = list.next;
      continue;
    }

    const heading = ParseHeading(lines, i);
    if (heading) {
      domMap.push(heading.node);
      i = heading.next;
      continue;
    }

    const last = domMap[domMap.length - 1];
    if (last?.type === "text" && textLine === i - 1) {
      last.children.push({ type: "text", value: "\n" }, ...ParseInline(line));
    } else {
      domMap.push({ type: "text", children: ParseInline(line) });
    }
    textLine = i;

    i++;
  }
  if (domMap[domMap.length - 1]?.type === "break") {
    domMap.pop();
  }
  return domMap;
}
