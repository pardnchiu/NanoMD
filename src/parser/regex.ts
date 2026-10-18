import type { MarkType } from "./types";

export const REGEX_HTML_DOM = /^\s*<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/;
export const REGEX_MD_CODE_BLOCK = /^```(\S*)$/;
export const REGEX_MD_CODE_LANG_MERMAID = /^mermaid/;
export const REGEX_MD_CODE_LANG_LATEX = /^(latex|math)/;
export const REGEX_MD_CODE_LANG_CHARTJS = /^chartjs/;
export const REGEX_MD_CODE_INLINE = /`([^`\n]+)`/g;
export const REGEX_MD_H = /^(#{1,6})\s+(.+)$/;
export const REGEX_MD_H1 = /^ {0,3}=+[ \t]*$/;
export const REGEX_MD_H2 = /^ {0,3}-+[ \t]*$/;
export const REGEX_MD_HR = /^ {0,3}([-*_])( *\1){2,}$/;
export const REGEX_MD_BLOCKQUOTE = /^ {0,3}>[ \t]?(.*)$/;
export const REGEX_MD_BLOCKQUOTE_TAG = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*$/i;
export const REGEX_MD_TABLE_ALIGN = /^(:)?-+(:)?$/;
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
  "!\\[(?<alt>[^\\]\\n]*)\\]\\((?<src>[^)\\s]+)(?:[ \\t]+(?<q1>[\"'])(?<imgTitle>[^)\\n]*?)\\k<q1>)?\\)" +
    "(?:\\((?:(?<size>[0-9]+%?)|(?<width>[0-9]+%?)?[ \\t*x]+(?<height>[0-9]+%?)?)\\))?|" +
    "\\[(?<label>[^\\]]+)\\]\\((?<href>https?:\\/\\/[^\\s)]+)(?:[ \\t]+(?<q2>[\"'])(?<linkTitle>[^)\\n]*?)\\k<q2>)?\\)|" +
    `(?<![\\w/])(?<path>${REGEX_FILE_PATH})|` +
    `(?<url>${REGEX_URL})`,
  "gu",
);
export const REGEX_MD_VIDEO = /\.(mp4|mov)$/i;
export const REGEX_MD_IMAGE_SIZE_PERCENT = /%$/;
export const REGEX_MD_LINK_PLACEHOLDER = /\u0000(\d+)\u0000/;
export const REGEX_YOUTUBE = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?/;
export const REGEX_VIMEO =
  /(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(?:channels\/[\w]+\/|groups\/[\w]+\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/;
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
export const MD_INLINE_TYPES: (MarkType | null)[] = [null, "b", "em", "b", "em", "del", "mark", "sub", "sup"];
