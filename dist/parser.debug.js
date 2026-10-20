"use strict";
var MDParser = (() => {
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
    DEFAULT_ENDPOINT: () => DEFAULT_ENDPOINT,
    Init: () => Init,
    MDParser: () => index_exports,
    OnCopyClick: () => OnCopyClick,
    PARSE_OPTIONS: () => PARSE_OPTIONS,
    Parse: () => Parse,
    ParseLines: () => ParseLines,
    Refresh: () => Refresh
  });

  // src/parser/regex.ts
  var REGEX_HTML_DOM = /^\s*<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/;
  var REGEX_MD_CODE_BLOCK = /^(`{3,}(?=[^`]*$)|~{3,})(\S*)$/;
  var REGEX_MD_CODE_FENCE = /^\s*(```|~~~)/;
  var REGEX_MD_CODE_INLINE = /(?<![\\`])(`+)(?!`)(.+?)(?<!`)\1(?!`)/g;
  var REGEX_MD_MATH_INLINE = /(?<![\\$])\$([^\s$](?:[^$\n]*[^\s$\\])?)\$(?![\d$])/g;
  var REGEX_MD_H = /^(#{1,6})\s+(.+)$/;
  var REGEX_MD_H1 = /^ {0,3}=+[ \t]*$/;
  var REGEX_MD_H2 = /^ {0,3}-+[ \t]*$/;
  var REGEX_MD_HR = /^ {0,3}([-*_])( *\1){2,}$/;
  var REGEX_MD_BLOCKQUOTE = /^ {0,3}>[ \t]?(.*)$/;
  var REGEX_MD_BLOCKQUOTE_TAG = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*$/i;
  var REGEX_MD_TABLE_ALIGN = /^(:)?-+(:)?$/;
  var REGEX_MD_LIST = /^([-*]|\d+\.)([ \t]+)(.*)$/;
  var REGEX_MD_LIST_TASK = /^\[([ xX])\][ \t]+(.*)$/;
  var REGEX_MD_FOOTNOTE_DEF = /^ {0,3}\[\^([^\]\s]+)\]:[ \t]*(.*)$/;
  var REGEX_MD_FOOTNOTE_REF = /\[\^([^\]\s]+)\]/g;
  var REGEX_FILE_PATH_1 = "[\\p{L}\\p{M}\\p{N}_.\\-\\/~]";
  var REGEX_FILE_PATH_2 = "[\\p{L}\\p{M}\\p{N}_.\\-~]+";
  var REGEX_FILE_EXT = "\\.[A-Za-z0-9]+";
  var REGEX_FILE_PATH = `~\\/${REGEX_FILE_PATH_1}*|\\/(?!v\\d+\\/)${REGEX_FILE_PATH_2}\\/${REGEX_FILE_PATH_2}\\/${REGEX_FILE_PATH_1}*|\\/${REGEX_FILE_PATH_1}+\\/${REGEX_FILE_PATH_1}*${REGEX_FILE_EXT}`;
  var REGEX_URL = "https?:\\/\\/[A-Za-z0-9\\-._~:/?#\\[\\]@!$&'()*+,;=%]+";
  var REGEX_MD_FILE_PATH = new RegExp(`^(?:${REGEX_FILE_PATH})$`, "u");
  var REGEX_MD_FILE_PATH_TRAILING = /[./]+$/;
  var REGEX_MD_URL_TRAILING = /[)\]}.,;:!?*_~、。，；：！？」』】》”）]+$/;
  var REGEX_MD_LINK = new RegExp(
    `!\\[(?<alt>[^\\]\\n]*)\\]\\((?<src>[^)\\s]+)(?:[ \\t]+(?<q1>["'])(?<imgTitle>[^)\\n]*?)\\k<q1>)?\\)(?:\\((?:(?<size>[0-9]+%?)|(?<width>[0-9]+%?)?[ \\t*x]+(?<height>[0-9]+%?)?)\\))?|\\[(?<label>[^\\]]+)\\]\\((?<href>https?:\\/\\/[^\\s)]+|(?![A-Za-z][A-Za-z0-9+.\\-]*:)[^\\s)]+)(?:[ \\t]+(?<q2>["'])(?<linkTitle>[^)\\n]*?)\\k<q2>)?\\)|\\[(?<refLabel>[^\\]]+)\\]\\[(?<ref>[^\\]]+)\\]|(?<![\\w/])(?<path>${REGEX_FILE_PATH})|(?<url>${REGEX_URL})|(?<![\\p{L}\\p{M}\\p{N}_&#/])(?<hashtag>[#\uFF03][\\p{L}\\p{M}\\p{N}_]+)`,
    // 6 #tag, prevent a#b and &#123;
    "gu"
  );
  var REGEX_MD_LINK_DEF = /^ {0,3}\[(?!\^)([^\]]+)\]:[ \t]*(https?:\/\/\S+|(?![A-Za-z][A-Za-z0-9+.\-]*:)\S+)(?:[ \t]+(["'])(.*)\3)?[ \t]*$/;
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
  var MD_INLINE_TYPES = [null, "bem", "bem", "b", "em", "b", "em", "del", "mark", "sub", "sup"];
  var REGEX_MD_ESCAPE = /\\([!-\/:-@\[-`{-~])/g;
  var REGEX_HTML_SCRIPT = /<\s*(script|style|iframe|object|embed|form|link|meta|base)\b[\s\S]*?<\s*\/\s*\1\s*>|<\s*\/?\s*(script|style|iframe|object|embed|form|link|meta|base)\b[^>]*>/gi;
  var REGEX_HTML_EVENT = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
  var REGEX_HTML_URL = /\s(href|src|xlink:href|action|formaction)\s*=\s*(?:"\s*(?:javascript|vbscript|data:text\/html)[^"]*"|'\s*(?:javascript|vbscript|data:text\/html)[^']*'|(?:javascript|vbscript|data:text\/html)[^\s>]*)/gi;
  var REGEX_MD_VIDEO_MOV = /\.mov$/i;
  var CODE_TYPES = [
    "javascript",
    "js",
    "ts",
    "html",
    "css",
    "xml",
    "json",
    "sql",
    "java",
    "python",
    "ruby",
    "php",
    "cpp",
    "csharp",
    "swift",
    "typescript",
    "kotlin",
    "go",
    "rust",
    "perl",
    "bash"
  ];

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
    while (j < lines.length) {
      const line = lines[j].trim();
      if (line.length >= fence[1].length && line === fence[1][0].repeat(line.length)) {
        break;
      }
      blockLines.push(lines[j]);
      j++;
    }
    const value = blockLines.join("\n");
    const lang = fence[2].toLowerCase();
    if (lang && j < lines.length) {
      return { node: { type: "codeBlock", lang, value }, next: j + 1 };
    }
    return { node: { type: "codeBlock", value }, next: j + 1 };
  }

  // src/parser/list.ts
  function ParseListBlock(lines, i) {
    const baseIndent = LeadingWhitespace(lines[i]).width;
    if (!matchMarker(lines[i], baseIndent)) {
      return null;
    }
    const items = [];
    let ordered = null;
    let j = i;
    while (j < lines.length) {
      if (j > i && lines[j].trim() === "") {
        let k = j;
        while (k < lines.length && lines[k].trim() === "") {
          k++;
        }
        if (k < lines.length && matchMarker(lines[k], baseIndent)) {
          j = k;
        } else {
          break;
        }
      }
      const marker = matchMarker(lines[j], baseIndent);
      if (!marker || ordered !== null && marker.ordered !== ordered) {
        break;
      }
      ordered = marker.ordered;
      const itemLines = [marker.content];
      j++;
      while (j < lines.length) {
        if (lines[j].trim() === "") {
          let k = j;
          while (k < lines.length && lines[k].trim() === "") {
            k++;
          }
          if (k < lines.length && LeadingWhitespace(lines[k]).width >= marker.column) {
            itemLines.push("");
            j++;
            continue;
          }
          break;
        }
        if (LeadingWhitespace(lines[j]).width >= marker.column) {
          itemLines.push(StripIndent(lines[j], marker.column));
          j++;
          continue;
        }
        if (!matchMarker(lines[j], baseIndent) && !(REGEX_MD_H.test(lines[j]) || REGEX_MD_HR.test(lines[j]) || REGEX_MD_BLOCKQUOTE.test(lines[j]) || REGEX_MD_CODE_FENCE.test(lines[j]) || REGEX_MD_FOOTNOTE_DEF.test(lines[j]) || REGEX_HTML_DOM.test(lines[j]) || lines[j].includes("|"))) {
          itemLines.push(lines[j]);
          j++;
          continue;
        }
        break;
      }
      const task = itemLines[0].match(REGEX_MD_LIST_TASK);
      if (task) {
        itemLines[0] = task[2];
      }
      const children = ParseLines(itemLines, true);
      items.push(task ? { type: "listItem", checked: task[1] !== " ", children } : { type: "listItem", children });
    }
    return { node: { type: "list", ordered: ordered ?? false, children: items }, next: j };
  }
  function matchMarker(line, baseIndent) {
    const { width, chars } = LeadingWhitespace(line);
    if (width < baseIndent || width > baseIndent + 3) {
      return null;
    }
    const match = line.slice(chars).match(REGEX_MD_LIST);
    if (!match) {
      return null;
    }
    let column = width + match[1].length;
    for (const char of match[2]) {
      column += char === "	" ? PARSE_OPTIONS.indent - column % PARSE_OPTIONS.indent : 1;
    }
    return { ordered: match[1].endsWith("."), content: match[3], column };
  }
  function LeadingWhitespace(line) {
    let width = 0;
    let chars = 0;
    for (; chars < line.length; chars++) {
      if (line[chars] === " ") {
        width += 1;
      } else if (line[chars] === "	") {
        width += PARSE_OPTIONS.indent - width % PARSE_OPTIONS.indent;
      } else {
        break;
      }
    }
    return { width, chars };
  }
  function StripIndent(line, column) {
    let width = 0;
    let k = 0;
    while (k < line.length && width < column) {
      if (line[k] === " ") {
        width += 1;
      } else if (line[k] === "	") {
        width += PARSE_OPTIONS.indent - width % PARSE_OPTIONS.indent;
      } else {
        break;
      }
      k++;
    }
    return line.slice(k);
  }

  // src/parser/footnote.ts
  var footnoteMap = /* @__PURE__ */ new Map();
  function ParseFootnoteBlock(lines, i) {
    const match = lines[i].match(REGEX_MD_FOOTNOTE_DEF);
    if (!match) {
      return null;
    }
    const contentLines = [match[2]];
    let j = i + 1;
    while (j < lines.length) {
      if (lines[j].trim() === "") {
        let k = j;
        while (k < lines.length && lines[k].trim() === "") {
          k++;
        }
        if (k < lines.length && LeadingWhitespace(lines[k]).width >= PARSE_OPTIONS.indent) {
          contentLines.push("");
          j++;
          continue;
        }
        break;
      }
      if (LeadingWhitespace(lines[j]).width >= PARSE_OPTIONS.indent) {
        contentLines.push(StripIndent(lines[j], PARSE_OPTIONS.indent));
        j++;
        continue;
      }
      if (!(REGEX_MD_FOOTNOTE_DEF.test(lines[j]) || REGEX_MD_LIST.test(lines[j].trimStart()) || REGEX_MD_H.test(lines[j]) || REGEX_MD_HR.test(lines[j]) || REGEX_MD_BLOCKQUOTE.test(lines[j]) || REGEX_MD_CODE_FENCE.test(lines[j]) || REGEX_HTML_DOM.test(lines[j]) || lines[j].includes("|"))) {
        contentLines.push(lines[j]);
        j++;
        continue;
      }
      break;
    }
    const key = match[1].toLowerCase();
    if (!footnoteMap.has(key)) {
      footnoteMap.set(key, { id: match[1], children: ParseLines(contentLines, true) });
    }
    return { next: j };
  }
  function AppendFootnotes(domMap) {
    const footnotes = /* @__PURE__ */ new Map();
    const collectRefs = (nodes) => {
      for (let k = 0; k < nodes.length; k++) {
        const node = nodes[k];
        if (node.type === "footnoteRef") {
          const key = node.id.toLowerCase();
          const definition = footnoteMap.get(key);
          if (!definition) {
            nodes[k] = { type: "text", value: `[^${node.id}]` };
            continue;
          }
          let footnote = footnotes.get(key);
          if (!footnote) {
            footnote = { type: "footnote", id: definition.id, index: footnotes.size + 1, children: definition.children };
            footnotes.set(key, footnote);
          }
          node.index = footnote.index;
        } else if ("children" in node) {
          collectRefs(node.children);
        }
      }
    };
    collectRefs(domMap);
    for (const footnote of footnotes.values()) {
      collectRefs(footnote.children);
    }
    if (footnotes.size > 0) {
      domMap.push({ type: "footnotes", children: [...footnotes.values()] });
    }
  }
  function ResetFootnote() {
    footnoteMap.clear();
  }

  // src/parser/link.ts
  var linkMap = /* @__PURE__ */ new Map();
  function ParseLink(text) {
    const links = [];
    const mask = text.replace(/\u0000/g, "").replace(REGEX_MD_MATH_INLINE, (_, value) => {
      links.push({ type: "math", value });
      return `\0${links.length - 1}\0`;
    }).replace(REGEX_MD_ESCAPE, (_, char) => {
      links.push({ type: "text", value: char });
      return `\0${links.length - 1}\0`;
    }).replace(REGEX_MD_FOOTNOTE_REF, (_, id) => {
      links.push({ type: "footnoteRef", id, index: 0 });
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
    if (meta.ref !== void 0 && meta.refLabel !== void 0) {
      return { node: { type: "linkRef", label: meta.refLabel, ref: meta.ref }, trail: "" };
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
    if (meta.hashtag !== void 0) {
      return {
        node: { type: "link", href: meta.hashtag.slice(1), tag: "hashtag", children: [{ type: "text", value: meta.hashtag }] },
        trail: ""
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
  function ParseLinkDefBlock(lines, i) {
    const match = lines[i].match(REGEX_MD_LINK_DEF);
    if (!match) {
      return null;
    }
    const key = match[1].toLowerCase();
    if (!linkMap.has(key)) {
      linkMap.set(key, { href: match[2], title: match[4] });
    }
    return { next: i + 1 };
  }
  function RestoreLinkRefs(nodes) {
    for (let k = 0; k < nodes.length; k++) {
      const node = nodes[k];
      if (node.type === "linkRef") {
        const definition = linkMap.get(node.ref.toLowerCase());
        nodes[k] = definition ? linkNode(definition.href, [{ type: "text", value: node.label }], definition.title) : { type: "text", value: `[${node.label}][${node.ref}]` };
      } else if ("children" in node) {
        RestoreLinkRefs(node.children);
      }
    }
  }
  function ResetLinkRef() {
    linkMap.clear();
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
      const code = match[2].startsWith(" ") && match[2].endsWith(" ") && /[^ ]/.test(match[2]) ? match[2].slice(1, -1) : match[2];
      domMap.push(
        REGEX_MD_FILE_PATH.test(code) ? { type: "link", href: code, tag: "file", children: [{ type: "text", value: code }] } : { type: "code", value: code }
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

  // src/parser/types.ts
  var AST = class extends Array {
  };

  // src/parser/html.ts
  AST.prototype.html = function() {
    return this.map(render).join("");
  };
  AST.prototype.json = function() {
    return JSON.parse(JSON.stringify(this));
  };
  function render(node) {
    switch (node.type) {
      case "text":
        return `<span class="md-line">${renderInlines(node.children)}</span>`;
      case "hr":
        return "<hr>";
      case "break":
        return "<br>";
      case "heading":
        return `<span class="md-h${node.level}">${renderInlines(node.children)}</span>`;
      case "blockquote":
        return renderBlockquote(node);
      case "codeBlock":
        return renderCodeBlock(node.value, node.lang ?? "");
      case "html":
        return node.value.replace(REGEX_HTML_SCRIPT, "").replace(REGEX_HTML_EVENT, "").replace(REGEX_HTML_URL, "");
      case "table":
        return renderTable(node);
      case "list":
        return renderList(node);
      case "footnotes":
        return renderFootnote(node);
      default:
        return "";
    }
  }
  function renderInlines(nodes) {
    return nodes.map(renderInline).join("");
  }
  function renderBlockquote(node) {
    const children = node.children.map(render).join("\n");
    if (!node.tag) {
      return `<blockquote class="md-quote">${children}</blockquote>`;
    }
    const title = node.tag[0].toUpperCase() + node.tag.slice(1);
    return `<blockquote class="md-quote md-alert md-alert-${node.tag}"><span class="md-alert-title">${title}</span>${children}</blockquote>`;
  }
  function renderCodeBlock(value, lang) {
    const code = codeBlockHTML(value, lang);
    if (lang === "mermaid") {
      return `<div class="md-mermaid"><pre class="mermaid">${escapeHTML(value)}</pre>${code}</div>`;
    }
    if (lang === "math") {
      return `<div class="md-latex"><div class="md-math">${escapeHTML(value)}</div>${code}</div>`;
    }
    if (lang === "chartjs") {
      let config;
      try {
        config = JSON.parse(value);
      } catch {
        return code;
      }
      const isRecord = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
      if (!isRecord(config) || typeof config.type !== "string" || !isRecord(config.data)) {
        return code;
      }
      const chart = escapeAttr(JSON.stringify({ type: config.type, data: config.data }));
      return `<div class="md-chart"><canvas data-chart="${chart}"></canvas>${code}</div>`;
    }
    return code;
  }
  function codeBlockHTML(value, lang) {
    const rows = value.split("\n");
    const indent = Math.floor(LeadingWhitespace(rows[0]).width / PARSE_OPTIONS.indent) * PARSE_OPTIONS.indent;
    const items = rows.map((row) => `<li>${escapeHTML(StripIndent(row, indent))}</li>`).join("");
    const name = lang ? ` name="${escapeAttr(lang)}"` : "";
    const langClass = CODE_TYPES.includes(lang) ? ` class="language-${lang}"` : "";
    return `<pre class="prettyprint"${name}><code${langClass}${name}><ol>${items}</ol></code><button class="copy"></button></pre>`;
  }
  function renderTable(node) {
    const [head, ...rows] = node.children;
    const renderRow = (row) => {
      const tag = row.header ? "th" : "td";
      const cells = row.children.map((cell, k) => {
        const align = node.align[k];
        return `<${tag}${align ? ` style="text-align:${align}"` : ""}>${renderInlines(cell.children)}</${tag}>`;
      });
      return `<tr>${cells.join("")}</tr>`;
    };
    return `<div class="md-table-wrap"><table class="md-table"><thead>${renderRow(head)}</thead><tbody>${rows.map(renderRow).join("")}</tbody></table></div>`;
  }
  function renderList(node) {
    const tag = node.ordered ? "ol" : "ul";
    return `<${tag} class="md-list">${node.children.map(renderListItem).join("")}</${tag}>`;
  }
  function renderListItem(item) {
    const children = item.children.map(render).join("\n");
    if (item.checked === void 0) {
      return `<li>${children}</li>`;
    }
    return `<li class="md-task"><input type="checkbox" disabled${item.checked ? " checked" : ""}>${children}</li>`;
  }
  function renderFootnote(node) {
    const items = node.children.map((footnote) => `<li id="md-fn-${footnote.index}">${footnote.children.map(render).join("\n")}</li>`);
    return `<section class="md-footnotes"><ol>${items.join("")}</ol></section>`;
  }
  function renderInline(node) {
    switch (node.type) {
      case "text":
        return escapeHTML(node.value);
      case "code":
        return `<code>${escapeHTML(node.value)}</code>`;
      case "math":
        return `<span class="md-math-inline">${escapeHTML(node.value)}</span>`;
      case "b":
        return `<span class="md-bold">${renderInlines(node.children)}</span>`;
      case "em":
      case "del":
      case "mark":
      case "sub":
      case "sup":
        return `<${node.type}>${renderInlines(node.children)}</${node.type}>`;
      case "footnoteRef":
        return `<sup class="md-footnote-ref"><a href="#md-fn-${node.index}">${node.index}</a></sup>`;
      case "link":
        return renderLink(node);
      default:
        return "";
    }
  }
  function renderLink(node) {
    const children = renderInlines(node.children);
    if (node.tag === "file") {
      if (!PARSE_OPTIONS.fileEndpoint) {
        return children;
      }
      return `<a class="md-link md-file-link" data-path="${escapeAttr(node.href)}">${children}</a>`;
    }
    if (node.tag === "hashtag") {
      if (!PARSE_OPTIONS.hashtagEndpoint) {
        return children;
      }
      const href = PARSE_OPTIONS.hashtagEndpoint.replaceAll("{tag}", encodeURIComponent(node.href));
      return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener" class="md-link md-hashtag">${children}</a>`;
    }
    const title = node.title ? ` title="${escapeAttr(node.title)}"` : "";
    if (node.tag === "image" || node.tag === "video") {
      const style = [node.width && `width:${node.width}`, node.height && `height:${node.height}`].filter(Boolean);
      const styleAttr = style.length ? ` style="${escapeAttr(style.join(";"))}"` : "";
      if (node.tag === "video") {
        const type = REGEX_MD_VIDEO_MOV.test(node.href) ? "video/quicktime" : "video/mp4";
        return `<video class="md-img" controls${title}${styleAttr}><source src="${escapeAttr(node.href)}" type="${type}"></video>`;
      }
      const alt = node.children.map((child) => "value" in child ? child.value : "").join("");
      return `<img class="md-img" src="${escapeAttr(node.href)}" alt="${escapeAttr(alt)}"${title}${styleAttr}>`;
    }
    const link = `<a href="${escapeAttr(node.href)}"${title} target="_blank" rel="noopener" class="md-link">${children}</a>`;
    if (node.tag === "youtube") {
      return `${link}<iframe class="md-embed" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/${node.href.match(REGEX_YOUTUBE)[1]}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }
    if (node.tag === "vimeo") {
      return `${link}<iframe class="md-embed" loading="lazy" src="https://player.vimeo.com/video/${node.href.match(REGEX_VIMEO)[1]}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    }
    return link;
  }
  function escapeHTML(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  }
  function escapeAttr(text) {
    return escapeHTML(text).replace(/"/g, "&quot;");
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
    if (lineTrim.endsWith("|") && !lineTrim.endsWith("\\|")) {
      lineTrim = lineTrim.slice(0, -1);
    }
    const cells = [];
    let cell = "";
    for (let k = 0; k < lineTrim.length; k++) {
      if (lineTrim[k] === "\\" && lineTrim[k + 1] === "|") {
        cell += "|";
        k++;
      } else if (lineTrim[k] === "|") {
        cells.push(cell.trim());
        cell = "";
      } else {
        cell += lineTrim[k];
      }
    }
    cells.push(cell.trim());
    return cells;
  }

  // src/parser/refresh.ts
  var deps = globalThis;
  var mermaidReady = false;
  var mermaidCount = 0;
  var copyHandler = null;
  function OnCopyClick(handler) {
    copyHandler = handler;
  }
  function Refresh(container) {
    if (typeof document === "undefined") {
      return Promise.resolve();
    }
    const root = container ?? document;
    if (!root.isConnected) {
      console.error("[Invalid] container: not attached to the document");
      return Promise.resolve();
    }
    bindCopy(root);
    bindFile(root);
    renderChart(root);
    renderLatex(root);
    deps.PR?.prettyPrint();
    return renderMermaid(root);
  }
  function bindFile(root) {
    for (const e of root.querySelectorAll("a.md-file-link")) {
      e.onclick = async (event) => {
        event.preventDefault();
        if (!PARSE_OPTIONS.fileEndpoint) {
          return;
        }
        const url = PARSE_OPTIONS.fileEndpoint.replaceAll("{filepath}", encodeURIComponent(e.dataset.path ?? ""));
        try {
          const res = await fetch(url);
          if (!res.ok) {
            console.error(`[Upstream] ${url}: HTTP ${res.status}`);
          }
        } catch (err) {
          console.error(`[Unavailable] ${url}: ${err instanceof Error ? err.message : err}`);
        }
      };
    }
  }
  function bindCopy(root) {
    for (const e of root.querySelectorAll("pre.prettyprint button.copy")) {
      e.onclick = async () => {
        const pre = e.parentElement;
        const text = [...pre.querySelectorAll("li")].map((li) => li.textContent).join("\n");
        let success = true;
        try {
          await navigator.clipboard.writeText(text);
        } catch (err) {
          console.error(`[Denied] clipboard: ${err instanceof Error ? err.message : err}`);
          success = false;
        }
        copyHandler?.(success, pre);
      };
    }
  }
  function renderChart(root) {
    const Chart = deps.Chart;
    if (!Chart) {
      return;
    }
    for (const e of Object.values(Chart.instances)) {
      if (e.canvas.isConnected) {
        continue;
      }
      e.destroy();
    }
    for (const e of root.querySelectorAll(".md-chart canvas")) {
      try {
        new Chart(e, JSON.parse(e.dataset.chart ?? ""));
        e.parentElement?.setAttribute("data-rendered", "");
      } catch {
        replaceWithCode(e.parentElement, "pre");
      }
    }
  }
  function renderLatex(root) {
    const katex = deps.katex;
    if (!katex) {
      return;
    }
    for (const e of root.querySelectorAll(".md-math")) {
      try {
        katex.render(e.textContent ?? "", e, { displayMode: true, throwOnError: true });
        e.parentElement?.setAttribute("data-rendered", "");
      } catch {
        replaceWithCode(e.parentElement, "pre.prettyprint");
      }
    }
    for (const e of root.querySelectorAll(".md-math-inline")) {
      try {
        katex.render(e.textContent ?? "", e, { displayMode: false, throwOnError: true });
      } catch {
        e.replaceWith(`$${e.textContent}$`);
      }
    }
  }
  async function renderMermaid(root) {
    const mermaid = deps.mermaid;
    if (!mermaid) {
      return;
    }
    if (!mermaidReady) {
      mermaid.initialize({
        startOnLoad: false,
        theme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default"
      });
      mermaidReady = true;
    }
    for (const pre of root.querySelectorAll(".md-mermaid:not([data-rendered]) > pre.mermaid")) {
      const text = pre.textContent ?? "";
      if (!await mermaid.parse(text, { suppressErrors: true })) {
        replaceWithCode(pre.parentElement, "pre.prettyprint");
        continue;
      }
      try {
        const { svg, bindFunctions } = await mermaid.render(`nanomd-mermaid-${++mermaidCount}`, text);
        pre.innerHTML = svg;
        bindFunctions?.(pre);
        pre.parentElement?.setAttribute("data-rendered", "");
      } catch {
        replaceWithCode(pre.parentElement, "pre.prettyprint");
      }
    }
  }
  function replaceWithCode(wrapper, selector) {
    const code = wrapper?.querySelector(selector);
    if (wrapper && code) {
      wrapper.replaceWith(code);
    }
  }

  // src/parser/index.ts
  var import_meta = {};
  var SCRIPT_ELEMENT = typeof document !== "undefined" && document.currentScript instanceof HTMLScriptElement ? document.currentScript : null;
  var SCRIPT_URL = SCRIPT_ELEMENT ? SCRIPT_ELEMENT.src : import_meta.url;
  var DEFAULT_ENDPOINT = {
    mermaidjs: "https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js",
    katexjs: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js",
    katexcss: "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css",
    googleprettifyjs: "https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js",
    chartjs: "https://cdn.jsdelivr.net/npm/chart.js@4.5.1/dist/chart.umd.min.js"
  };
  var PARSE_OPTIONS = {
    indent: 4,
    fileEndpoint: "",
    hashtagEndpoint: ""
  };
  var insertedDependencies = /* @__PURE__ */ new Map();
  if (typeof document !== "undefined" && SCRIPT_URL && SCRIPT_ELEMENT?.dataset.nanomdCss !== "off") {
    insertHead("style", new URL("parser.css", SCRIPT_URL).href).catch((err) => console.error(err.message));
  }
  function Init(options = {}, endpoint = {}) {
    PARSE_OPTIONS.indent = Number.isInteger(options.indent) && options.indent > 0 ? options.indent : 4;
    PARSE_OPTIONS.fileEndpoint = "";
    if (options.fileEndpoint !== void 0) {
      if (typeof options.fileEndpoint === "string" && options.fileEndpoint.includes("{filepath}")) {
        PARSE_OPTIONS.fileEndpoint = options.fileEndpoint;
      } else {
        console.error("[Invalid] fileEndpoint: must be a string containing {filepath}");
      }
    }
    PARSE_OPTIONS.hashtagEndpoint = "";
    if (options.hashtagEndpoint !== void 0) {
      if (typeof options.hashtagEndpoint === "string" && options.hashtagEndpoint.includes("{tag}")) {
        PARSE_OPTIONS.hashtagEndpoint = options.hashtagEndpoint;
      } else {
        console.error("[Invalid] hashtagEndpoint: must be a string containing {tag}");
      }
    }
    if (typeof document === "undefined") {
      return Promise.resolve([]);
    }
    const enable = options.enable ?? {};
    const loads = [];
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
  function Parse(content) {
    ResetFootnote();
    ResetLinkRef();
    const domMap = ParseLines(content.split("\n"));
    AppendFootnotes(domMap);
    RestoreLinkRefs(domMap);
    return AST.from(domMap);
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
    let textLine = -1;
    let i = 0;
    while (i < lines.length) {
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
  return __toCommonJS(index_exports);
})();
