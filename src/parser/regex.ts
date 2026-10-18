import type { ChildType } from "./types";

export const REGEX_HTML_DOM = /^\s*<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/;
export const REGEX_MD_CODE_BLOCK_PREFIX = /^```(?!mermaid|latex|math)\S*$/;
export const REGEX_MD_CODE_BLOCK_MERMAID = /^```mermaid\S*$/;
export const REGEX_MD_CODE_BLOCK_LATEX = /^```(latex|math)\S*$/;
export const REGEX_MD_CODE_INLINE = /`([^`\n]+)`/g;
export const REGEX_MD_H = /^(#{1,6})\s+(.+)$/;
export const REGEX_MD_H1 = /^ {0,3}=+[ \t]*$/;
export const REGEX_MD_H2 = /^ {0,3}-+[ \t]*$/;
export const REGEX_MD_HR = /^ {0,3}([-*_])( *\1){2,}$/;
export const REGEX_MD_BLOCKQUOTE = /^ {0,3}>[ \t]?(.*)$/;
export const REGEX_MD_BLOCKQUOTE_TAG = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*$/i;
export const REGEX_MD_TABLE_ALIGN = /^(:)?-+(:)?$/;
export const REGEX_MD_INLINE = new RegExp(
  [
    "\\*\\*(.+?)\\*\\*", // 1 **bold**
    "\\*([^\\s*](?:[^*]*[^\\s*])?)\\*", // 2 *em*, prevent ***
    "(?<![A-Za-z0-9_])__(.+?)__(?![A-Za-z0-9_])", // 3 __bold__, prevent __abc__123
    "(?<![A-Za-z0-9_])_([^\\s_](?:[^_]*[^\\s_])?)_(?![A-Za-z0-9_])", // 4 _em_, prevent abc_123
    "~~(.+?)~~", // 5 ~~del~~
    "==(.+?)==", // 6 ==mark==
    "~([^\\s~]+)~", // 7 ~sub~
    "\\^([^\\s^]+)\\^", // 8 ^sup^
  ].join("|"),
  "g",
);
export const MD_INLINE_TYPES: (ChildType | null)[] = [null, "b", "em", "b", "em", "del", "mark", "sub", "sup"];
