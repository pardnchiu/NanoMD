"use strict";
var NewParser = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/parser/index.ts
  var index_exports = {};
  __export(index_exports, {
    EXTERNAL_DEPENDENCIES: () => EXTERNAL_DEPENDENCIES,
    Init: () => Init,
    Parse: () => Parse,
    ParseLines: () => ParseLines
  });

  // src/parser/regex.ts
  var REGEX_HTML_DOM = /^\s*<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/;
  var REGEX_MD_CODE_BLOCK = /^```(\S*)$/;
  var REGEX_MD_CODE_INLINE = /(?<!\\)`([^`\n]+)`/g;
  var REGEX_MD_H = /^(#{1,6})\s+(.+)$/;
  var REGEX_MD_H1 = /^ {0,3}=+[ \t]*$/;
  var REGEX_MD_H2 = /^ {0,3}-+[ \t]*$/;
  var REGEX_MD_HR = /^ {0,3}([-*_])( *\1){2,}$/;
  var REGEX_MD_BLOCKQUOTE = /^ {0,3}>[ \t]?(.*)$/;
  var REGEX_MD_BLOCKQUOTE_TAG = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*$/i;
  var REGEX_MD_TABLE_ALIGN = /^(:)?-+(:)?$/;
  var REGEX_FILE_PATH_1 = "[\\p{L}\\p{M}\\p{N}_.\\-\\/~]";
  var REGEX_FILE_PATH_2 = "[\\p{L}\\p{M}\\p{N}_.\\-~]+";
  var REGEX_FILE_EXT = "\\.[A-Za-z0-9]+";
  var REGEX_FILE_PATH = `~\\/${REGEX_FILE_PATH_1}*|\\/(?!v\\d+\\/)${REGEX_FILE_PATH_2}\\/${REGEX_FILE_PATH_2}\\/${REGEX_FILE_PATH_1}*|\\/${REGEX_FILE_PATH_1}+\\/${REGEX_FILE_PATH_1}*${REGEX_FILE_EXT}`;
  var REGEX_URL = "https?:\\/\\/[A-Za-z0-9\\-._~:/?#\\[\\]@!$&'()*+,;=%]+";
  var REGEX_MD_FILE_PATH = new RegExp(`^(?:${REGEX_FILE_PATH})$`, "u");
  var REGEX_MD_FILE_PATH_TRAILING = /[./]+$/;
  var REGEX_MD_URL_TRAILING = /[)\]}.,;:!?*_~、。，；：！？」』】》”）]+$/;
  var REGEX_MD_LINK = new RegExp(
    `!\\[(?<alt>[^\\]\\n]*)\\]\\((?<src>[^)\\s]+)(?:[ \\t]+(?<q1>["'])(?<imgTitle>[^)\\n]*?)\\k<q1>)?\\)(?:\\((?:(?<size>[0-9]+%?)|(?<width>[0-9]+%?)?[ \\t*x]+(?<height>[0-9]+%?)?)\\))?|\\[(?<label>[^\\]]+)\\]\\((?<href>https?:\\/\\/[^\\s)]+)(?:[ \\t]+(?<q2>["'])(?<linkTitle>[^)\\n]*?)\\k<q2>)?\\)|(?<![\\w/])(?<path>${REGEX_FILE_PATH})|(?<url>${REGEX_URL})`,
    "gu"
  );
  var REGEX_MD_VIDEO = /\.(mp4|mov)$/i;
  var REGEX_MD_IMAGE_SIZE_PERCENT = /%$/;
  var REGEX_MD_LINK_PLACEHOLDER = /\u0000(\d+)\u0000/;
  var REGEX_YOUTUBE = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?/;
  var REGEX_VIMEO = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/[\w]+\/|groups\/[\w]+\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/;
  var REGEX_MD_INLINE = new RegExp(
    [
      "\\*\\*\\*(.+?)\\*\\*\\*",
      // 1 ***bold em***
      "(?<![A-Za-z0-9_])___(.+?)___(?![A-Za-z0-9_])",
      // 2 ___bold em___, prevent ___abc___123
      "\\*\\*(.+?)\\*\\*",
      // 3 **bold**
      "\\*([^\\s*](?:[^*]*[^\\s*])?)\\*",
      // 4 *em*, prevent ***
      "(?<![A-Za-z0-9_])__(.+?)__(?![A-Za-z0-9_])",
      // 5 __bold__, prevent __abc__123
      "(?<![A-Za-z0-9_])_([^\\s_](?:[^_]*[^\\s_])?)_(?![A-Za-z0-9_])",
      // 6 _em_, prevent abc_123
      "~~(.+?)~~",
      // 7 ~~del~~
      "==(.+?)==",
      // 8 ==mark==
      "~([^\\s~]+)~",
      // 9 ~sub~
      "\\^([^\\s^]+)\\^"
      // 10 ^sup^
    ].join("|"),
    "g"
  );
  var MD_INLINE_TYPES = [
    null,
    "bem",
    "bem",
    "b",
    "em",
    "b",
    "em",
    "del",
    "mark",
    "sub",
    "sup"
  ];
  var REGEX_MD_ESCAPE = /\\([!-\/:-@\[-`{-~])/g;

  // src/parser/blockquote.ts
  function ParseBlockquote(lines, i, nested) {
    const quoteLines = [];
    let j = i;
    while (j < lines.length) {
      const match = lines[j].match(REGEX_MD_BLOCKQUOTE);
      if (!match) {
        break;
      }
      quoteLines.push(match[1]);
      j++;
    }
    if (quoteLines.length === 0) {
      return null;
    }
    let tag;
    const tagMatch = nested ? null : quoteLines[0].match(REGEX_MD_BLOCKQUOTE_TAG);
    if (tagMatch && quoteLines.slice(1).some((line) => line.trim() !== "")) {
      tag = tagMatch[1].toLowerCase();
    }
    const children = ParseLines(tag ? quoteLines.slice(1) : quoteLines, true);
    return { node: tag ? { type: "blockquote", tag, children } : { type: "blockquote", children }, next: j };
  }

  // src/parser/codeBlock.ts
  function ParseCodeBlock(lines, i) {
    const fence = lines[i].trim().match(REGEX_MD_CODE_BLOCK);
    if (!fence) {
      return null;
    }
    const blockLines = [];
    let j = i + 1;
    while (j < lines.length && lines[j].trim() !== "```") {
      blockLines.push(lines[j]);
      j++;
    }
    const value = blockLines.join("\n");
    const lang = fence[1].toLowerCase();
    if (lang && j < lines.length) {
      return { node: { type: "codeBlock", lang, value }, next: j + 1 };
    }
    return { node: { type: "codeBlock", value }, next: j + 1 };
  }

  // src/parser/link.ts
  function ParseLink(text) {
    const links = [];
    const mask = text.replace(/\u0000/g, "").replace(REGEX_MD_ESCAPE, (_, char) => {
      links.push({ type: "text", value: char });
      return `\0${links.length - 1}\0`;
    }).replace(REGEX_MD_LINK, (...args) => {
      const { node, trail } = parseMeta(args[args.length - 1]);
      links.push(node);
      return `\0${links.length - 1}\0${trail}`;
    });
    return { mask, links };
  }
  function parseMeta(meta) {
    if (meta.src !== void 0) {
      const node = {
        type: "link",
        href: meta.src,
        tag: REGEX_MD_VIDEO.test(meta.src) ? "video" : "image",
        children: [{ type: "text", value: meta.alt ?? "" }]
      };
      if (meta.imgTitle) {
        node.title = meta.imgTitle;
      }
      if (meta.size) {
        node.width = REGEX_MD_IMAGE_SIZE_PERCENT.test(meta.size) ? meta.size : `${meta.size}px`;
        node.height = node.width;
      }
      if (meta.width) {
        node.width = REGEX_MD_IMAGE_SIZE_PERCENT.test(meta.width) ? meta.width : `${meta.width}px`;
      }
      if (meta.height) {
        node.height = REGEX_MD_IMAGE_SIZE_PERCENT.test(meta.height) ? meta.height : `${meta.height}px`;
      }
      return { node, trail: "" };
    }
    if (meta.href !== void 0 && meta.label !== void 0) {
      return {
        node: linkNode(meta.href, [{ type: "text", value: meta.label }], meta.linkTitle),
        trail: ""
      };
    }
    if (meta.path !== void 0) {
      const trail2 = meta.path.match(REGEX_MD_FILE_PATH_TRAILING)?.[0] ?? "";
      const filePath = meta.path.slice(0, meta.path.length - trail2.length);
      return {
        node: { type: "link", href: filePath, tag: "file", children: [{ type: "text", value: filePath }] },
        trail: trail2
      };
    }
    const url = meta.url ?? "";
    const trail = url.match(REGEX_MD_URL_TRAILING)?.[0] ?? "";
    const bareURL = url.slice(0, url.length - trail.length);
    return { node: linkNode(bareURL, [{ type: "text", value: bareURL }]), trail };
  }
  function linkNode(href, children, title) {
    let tag;
    if (REGEX_YOUTUBE.test(href)) {
      tag = "youtube";
    } else if (REGEX_VIMEO.test(href)) {
      tag = "vimeo";
    }
    const node = tag ? { type: "link", href, tag, children } : { type: "link", href, children };
    if (title) {
      node.title = title;
    }
    return node;
  }
  function RestoreLinks(text, links) {
    const domMap = [];
    const parts = text.split(REGEX_MD_LINK_PLACEHOLDER);
    for (let k = 0; k < parts.length; k++) {
      if (k % 2 === 1) {
        domMap.push(links[Number(parts[k])]);
      } else if (parts[k]) {
        domMap.push({ type: "text", value: parts[k] });
      }
    }
    return domMap;
  }

  // src/parser/inline.ts
  function ParseInline(text) {
    const domMap = [];
    let last = 0;
    let match;
    REGEX_MD_CODE_INLINE.lastIndex = 0;
    while (match = REGEX_MD_CODE_INLINE.exec(text)) {
      if (match.index > last) {
        domMap.push(...parseInlineMarks(text.slice(last, match.index)));
      }
      domMap.push(
        REGEX_MD_FILE_PATH.test(match[1]) ? { type: "link", href: match[1], tag: "file", children: [{ type: "text", value: match[1] }] } : { type: "code", value: match[1] }
      );
      last = REGEX_MD_CODE_INLINE.lastIndex;
    }
    if (last < text.length) {
      domMap.push(...parseInlineMarks(text.slice(last)));
    }
    return domMap;
  }
  function parseInlineMarks(text) {
    const { mask: masked, links } = ParseLink(text);
    const domMap = [];
    let last = 0;
    let match;
    REGEX_MD_INLINE.lastIndex = 0;
    while (match = REGEX_MD_INLINE.exec(masked)) {
      if (match.index > last) {
        domMap.push(...RestoreLinks(masked.slice(last, match.index), links));
      }
      const target = match.findIndex((v, k) => k > 0 && v !== void 0);
      const children = RestoreLinks(match[target], links);
      const type = MD_INLINE_TYPES[target];
      domMap.push(type === "bem" ? { type: "b", children: [{ type: "em", children }] } : { type, children });
      last = REGEX_MD_INLINE.lastIndex;
    }
    if (last < masked.length) {
      domMap.push(...RestoreLinks(masked.slice(last), links));
    }
    return domMap;
  }

  // src/parser/heading.ts
  function ParseHeading(lines, i) {
    const line = lines[i];
    const mdHeading = line.match(REGEX_MD_H);
    if (mdHeading) {
      return { node: { type: "heading", level: mdHeading[1].length, children: ParseInline(mdHeading[2]) }, next: i + 1 };
    }
    if (lines[i + 1] !== void 0) {
      const nextLine = lines[i + 1];
      if (REGEX_MD_H1.test(nextLine)) {
        return { node: { type: "heading", level: 1, children: ParseInline(line) }, next: i + 2 };
      }
      if (REGEX_MD_H2.test(nextLine)) {
        return { node: { type: "heading", level: 2, children: ParseInline(line) }, next: i + 2 };
      }
    }
    return null;
  }

  // src/parser/tableBlock.ts
  function ParseTableBlock(lines, i) {
    const line = lines[i];
    if (!line.includes("|") || lines[i + 1] === void 0) {
      return null;
    }
    const align = parseAlign(lines[i + 1]);
    if (!align) {
      return null;
    }
    const rows = [
      {
        type: "tableRow",
        header: true,
        children: splitCells(line).map((cell) => ({ type: "tableCell", children: ParseInline(cell) }))
      }
    ];
    let j = i + 2;
    while (j < lines.length && lines[j].includes("|") && !parseAlign(lines[j])) {
      rows.push({
        type: "tableRow",
        header: false,
        children: splitCells(lines[j]).map((cell) => ({ type: "tableCell", children: ParseInline(cell) }))
      });
      j++;
    }
    return { node: { type: "table", align, children: rows }, next: j };
  }
  function parseAlign(line) {
    if (!line.includes("|")) {
      return null;
    }
    const align = [];
    for (const cell of splitCells(line)) {
      const match = cell.match(REGEX_MD_TABLE_ALIGN);
      if (!match) {
        return null;
      }
      if (match[1] && match[2]) {
        align.push("center");
      } else if (match[1]) {
        align.push("left");
      } else if (match[2]) {
        align.push("right");
      } else {
        align.push(null);
      }
    }
    return align;
  }
  function splitCells(line) {
    let lineTrim = line.trim();
    if (lineTrim.startsWith("|")) {
      lineTrim = lineTrim.slice(1);
    }
    if (lineTrim.endsWith("|")) {
      lineTrim = lineTrim.slice(0, -1);
    }
    return lineTrim.split("|").map((cell) => cell.trim());
  }

  // src/parser/index.ts
  var EXTERNAL_DEPENDENCIES = {
    mermaidjs: "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js",
    katexjs: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js",
    katexcss: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
    googleprettifyjs: "https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js",
    chartjs: "https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js"
  };
  var insertedDependencies = /* @__PURE__ */ new Map();
  function Init(enable = {}, endpoint = {}) {
    if (typeof document === "undefined") {
      return Promise.resolve([]);
    }
    const loads = [];
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
  function Parse(content) {
    return ParseLines(content.split("\n"));
  }
  function insertHead(type, url) {
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
    const load = new Promise((resolve, reject) => {
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
  function ParseLines(lines, nested = false) {
    const domMap = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === "") {
        i++;
        continue;
      }
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
  return __toCommonJS(index_exports);
})();
