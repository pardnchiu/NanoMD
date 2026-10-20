import type { MarkType } from "./types";

export const REGEX_HTML_DOM = /^\s*<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/;
export const REGEX_MD_CODE_BLOCK = /^(`{3,}(?=[^`]*$)|~{3,})(\S*)$/; // * let 3+ `/~, for ` inside, prevent ```abc``` single foramt wrong
export const REGEX_MD_CODE_FENCE = /^\s*(```|~~~)/;
export const REGEX_MD_CODE_INLINE = /(?<![\\`])(`+)(?!`)(.+?)(?<!`)\1(?!`)/g; // * prevent \` or ``a`, need same number of ` on start and close
export const REGEX_MD_MATH_INLINE = /(?<![\\$])\$([^\s$](?:[^$\n]*[^\s$\\])?)\$(?![\d$])/g;
export const REGEX_MD_H = /^(#{1,6})\s+(.+)$/;
export const REGEX_MD_H1 = /^ {0,3}=+[ \t]*$/;
export const REGEX_MD_H2 = /^ {0,3}-+[ \t]*$/;
export const REGEX_MD_HR = /^ {0,3}([-*_])( *\1){2,}$/;
export const REGEX_MD_BLOCKQUOTE = /^ {0,3}>[ \t]?(.*)$/;
export const REGEX_MD_BLOCKQUOTE_TAG = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*$/i;
export const REGEX_MD_TABLE_ALIGN = /^(:)?-+(:)?$/;
export const REGEX_MD_LIST = /^([-*]|\d+\.)([ \t]+)(.*)$/;
export const REGEX_MD_LIST_TASK = /^\[([ xX])\][ \t]+(.*)$/;
export const REGEX_MD_FOOTNOTE_DEF = /^ {0,3}\[\^([^\]\s]+)\]:[ \t]*(.*)$/;
export const REGEX_MD_FOOTNOTE_REF = /\[\^([^\]\s]+)\]/g;
const REGEX_FILE_PATH_1 = "[\\p{L}\\p{M}\\p{N}_.\\-\\/~]";
const REGEX_FILE_PATH_2 = "[\\p{L}\\p{M}\\p{N}_.\\-~]+";
const REGEX_FILE_EXT = "\\.[A-Za-z0-9]+";
const REGEX_FILE_PATH =
  `~\\/${REGEX_FILE_PATH_1}*` +
  `|\\/(?!v\\d+\\/)${REGEX_FILE_PATH_2}\\/${REGEX_FILE_PATH_2}\\/${REGEX_FILE_PATH_1}*` +
  `|\\/${REGEX_FILE_PATH_1}+\\/${REGEX_FILE_PATH_1}*${REGEX_FILE_EXT}`;
const REGEX_URL = "https?:\\/\\/[A-Za-z0-9\\-._~:/?#\\[\\]@!$&'()*+,;=%]+";
export const REGEX_MD_FILE_PATH = new RegExp(`^(?:${REGEX_FILE_PATH})$`, "u");
export const REGEX_MD_FILE_PATH_TRAILING = /[./]+$/;
export const REGEX_MD_URL_TRAILING = /[)\]}.,;:!?*_~、。，；：！？」』】》”）]+$/;
export const REGEX_MD_LINK = new RegExp(
  "!\\[(?<alt>[^\\]\\n]*)\\]\\((?<src>[^)\\s]+)(?:[ \\t]+(?<q1>[\"'])(?<imgTitle>[^)\\n]*?)\\k<q1>)?\\)" + // 1 ![alt](src "title")
    "(?:\\((?:(?<size>[0-9]+%?)|(?<width>[0-9]+%?)?[ \\t*x]+(?<height>[0-9]+%?)?)\\))?|" + // (300x200) (50%x) (x200) (300)
    "\\[(?<label>[^\\]]+)\\]\\((?<href>https?:\\/\\/[^\\s)]+|(?![A-Za-z][A-Za-z0-9+.\\-]*:)[^\\s)]+)(?:[ \\t]+(?<q2>[\"'])(?<linkTitle>[^)\\n]*?)\\k<q2>)?\\)|" + // 2 [label](href "title")
    "\\[(?<refLabel>[^\\]]+)\\]\\[(?<ref>[^\\]]+)\\]|" + // 3 [label][ref]
    `(?<![\\w/])(?<path>${REGEX_FILE_PATH})|` + // 4 ~/a.md /Users/a/b.go, prevent a/b/c and http://a/b
    `(?<url>${REGEX_URL})|` + // 5 https://example.com
    "(?<![\\p{L}\\p{M}\\p{N}_&#/])(?<hashtag>[#＃][\\p{L}\\p{M}\\p{N}_]+)", // 6 #tag, prevent a#b and &#123;
  "gu",
);
export const REGEX_MD_LINK_DEF = /^ {0,3}\[(?!\^)([^\]]+)\]:[ \t]*(https?:\/\/\S+|(?![A-Za-z][A-Za-z0-9+.\-]*:)\S+)(?:[ \t]+(["'])(.*)\3)?[ \t]*$/;
export const REGEX_MD_VIDEO = /\.(mp4|mov)$/i;
export const REGEX_MD_IMAGE_SIZE_PERCENT = /%$/;
export const REGEX_MD_LINK_PLACEHOLDER = /\u0000(\d+)\u0000/;
export const REGEX_YOUTUBE = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?/;
export const REGEX_VIMEO = /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/[\w]+\/|groups\/[\w]+\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/;
export const REGEX_MD_INLINE = new RegExp(
  [
    "\\*\\*\\*(.+?)\\*\\*\\*", // 1 ***bold em***
    "(?<![A-Za-z0-9_])___(.+?)___(?![A-Za-z0-9_])", // 2 ___bold em___, prevent ___abc___123
    "\\*\\*(.+?)\\*\\*", // 3 **bold**
    "\\*([^\\s*](?:[^*]*[^\\s*])?)\\*", // 4 *em*, prevent ***
    "(?<![A-Za-z0-9_])__(.+?)__(?![A-Za-z0-9_])", // 5 __bold__, prevent __abc__123
    "(?<![A-Za-z0-9_])_([^\\s_](?:[^_]*[^\\s_])?)_(?![A-Za-z0-9_])", // 6 _em_, prevent abc_123
    "~~(.+?)~~", // 7 ~~del~~
    "==(.+?)==", // 8 ==mark==
    "~([^\\s~]+)~", // 9 ~sub~
    "\\^([^\\s^]+)\\^", // 10 ^sup^
  ].join("|"),
  "g",
);
export const MD_INLINE_TYPES: (MarkType | "bem" | null)[] = [null, "bem", "bem", "b", "em", "b", "em", "del", "mark", "sub", "sup"];
export const REGEX_MD_BR = /<br\s*\/?>/gi;
export const REGEX_MD_ESCAPE = /\\([!-\/:-@\[-`{-~])/g; // \* => *, \` => `, \[ => [, \\ => \
export const REGEX_HTML_SCRIPT =
  /<\s*(script|style|iframe|object|embed|form|link|meta|base)\b[\s\S]*?<\s*\/\s*\1\s*>|<\s*\/?\s*(script|style|iframe|object|embed|form|link|meta|base)\b[^>]*>/gi;
export const REGEX_HTML_EVENT = /\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
export const REGEX_HTML_URL =
  /\s(href|src|xlink:href|action|formaction)\s*=\s*(?:"\s*(?:javascript|vbscript|data:text\/html)[^"]*"|'\s*(?:javascript|vbscript|data:text\/html)[^']*'|(?:javascript|vbscript|data:text\/html)[^\s>]*)/gi;
export const REGEX_MD_VIDEO_MOV = /\.mov$/i;
export const CODE_TYPES = [
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
  "bash",
];
