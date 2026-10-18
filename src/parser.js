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
    Parse: () => Parse
  });

  // src/parser/regex.ts
  var REGEX_HTML_DOM = /^\s*<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/;
  var REGEX_MD_CODE_BLOCK_PREFIX = /^```(?!mermaid|latex|math)\S*$/;
  var REGEX_MD_CODE_BLOCK_MERMAID = /^```mermaid\S*$/;
  var REGEX_MD_CODE_BLOCK_LATEX = /^```(latex|math)\S*$/;
  var REGEX_MD_H = /^(#{1,6})\s+(.+)$/;
  var REGEX_MD_H1 = /^ {0,3}=+[ \t]*$/;
  var REGEX_MD_H2 = /^ {0,3}-+[ \t]*$/;
  var REGEX_MD_HR = /^ {0,3}([-*_])( *\1){2,}$/;
  var REGEX_MD_INLINE = new RegExp(
    [
      "\\*\\*(.+?)\\*\\*",
      // 1 **bold**
      "\\*([^\\s*](?:[^*]*[^\\s*])?)\\*",
      // 2 *em*, prevent ***
      "(?<![A-Za-z0-9_])__(.+?)__(?![A-Za-z0-9_])",
      // 3 __bold__, prevent __abc__123
      "(?<![A-Za-z0-9_])_([^\\s_](?:[^_]*[^\\s_])?)_(?![A-Za-z0-9_])",
      // 4 _em_, prevent abc_123
      "~~(.+?)~~",
      // 5 ~~del~~
      "==(.+?)==",
      // 6 ==mark==
      "~([^\\s~]+)~",
      // 7 ~sub~
      "\\^([^\\s^]+)\\^"
      // 8 ^sup^
    ].join("|"),
    "g"
  );
  var MD_INLINE_TYPES = [null, "b", "em", "b", "em", "del", "mark", "sub", "sup"];

  // src/parser/codeBlock.ts
  function parseCodeBlock(lines, i) {
    const fence = lines[i].trim();
    let render;
    if (REGEX_MD_CODE_BLOCK_MERMAID.test(fence)) {
      render = "mermaid";
    } else if (REGEX_MD_CODE_BLOCK_LATEX.test(fence)) {
      render = "latex";
    } else if (!REGEX_MD_CODE_BLOCK_PREFIX.test(fence)) {
      return null;
    }
    const blockLines = [];
    let j = i + 1;
    while (j < lines.length && lines[j].trim() !== "```") {
      blockLines.push(lines[j]);
      j++;
    }
    const value = blockLines.join("\n");
    return { node: render ? { type: "codeBlock", render, value } : { type: "codeBlock", value }, next: j + 1 };
  }

  // src/parser/inline.ts
  function parseInline(text) {
    const domMap = [];
    let last = 0;
    let match;
    REGEX_MD_INLINE.lastIndex = 0;
    while (match = REGEX_MD_INLINE.exec(text)) {
      if (match.index > last) {
        domMap.push({ type: "text", value: text.slice(last, match.index) });
      }
      const target = match.findIndex((v, k) => k > 0 && v !== void 0);
      domMap.push({ type: MD_INLINE_TYPES[target], value: match[target] });
      last = REGEX_MD_INLINE.lastIndex;
    }
    if (last < text.length) {
      domMap.push({ type: "text", value: text.slice(last) });
    }
    return domMap;
  }

  // src/parser/heading.ts
  function parseHeading(lines, i) {
    const line = lines[i];
    const mdHeading = line.match(REGEX_MD_H);
    if (mdHeading) {
      return { node: { type: "heading", level: mdHeading[1].length, children: parseInline(mdHeading[2]) }, next: i + 1 };
    }
    if (lines[i + 1] !== void 0) {
      const nextLine = lines[i + 1];
      if (REGEX_MD_H1.test(nextLine)) {
        return { node: { type: "heading", level: 1, children: parseInline(line) }, next: i + 2 };
      }
      if (REGEX_MD_H2.test(nextLine)) {
        return { node: { type: "heading", level: 2, children: parseInline(line) }, next: i + 2 };
      }
    }
    return null;
  }

  // src/parser/index.ts
  function Parse(content) {
    const lines = content.split("\n");
    const domMap = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (line.trim() === "") {
        i++;
        continue;
      }
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
  return __toCommonJS(index_exports);
})();
