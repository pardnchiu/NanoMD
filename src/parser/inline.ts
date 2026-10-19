import { ParseLink, RestoreLinks } from "./link";
import { MD_INLINE_TYPES, REGEX_MD_CODE_INLINE, REGEX_MD_FILE_PATH, REGEX_MD_INLINE } from "./regex";
import type { InlineNode, MarkType } from "./types";

export function ParseInline(text: string): InlineNode[] {
  const domMap: InlineNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  REGEX_MD_CODE_INLINE.lastIndex = 0;
  while ((match = REGEX_MD_CODE_INLINE.exec(text))) {
    if (match.index > last) {
      domMap.push(...parseInlineMarks(text.slice(last, match.index)));
    }

    const code = match[2].startsWith(" ") && match[2].endsWith(" ") && /[^ ]/.test(match[2]) ? match[2].slice(1, -1) : match[2];
    domMap.push(
      REGEX_MD_FILE_PATH.test(code) ? { type: "link", href: code, tag: "file", children: [{ type: "text", value: code }] } : { type: "code", value: code },
    );
    last = REGEX_MD_CODE_INLINE.lastIndex;
  }

  if (last < text.length) {
    domMap.push(...parseInlineMarks(text.slice(last)));
  }
  return domMap;
}

function parseInlineMarks(text: string): InlineNode[] {
  const { mask: masked, links } = ParseLink(text);

  const domMap: InlineNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  REGEX_MD_INLINE.lastIndex = 0;
  while ((match = REGEX_MD_INLINE.exec(masked))) {
    // * not matched, return as text
    if (match.index > last) {
      domMap.push(...RestoreLinks(masked.slice(last, match.index), links));
    }

    // * matched
    const target = match.findIndex((v, k) => k > 0 && v !== undefined);
    const children = RestoreLinks(match[target], links);
    const type = MD_INLINE_TYPES[target] as MarkType | "bem";
    domMap.push(type === "bem" ? { type: "b", children: [{ type: "em", children }] } : { type, children });
    last = REGEX_MD_INLINE.lastIndex;
  }

  // * not matched, return as text
  if (last < masked.length) {
    domMap.push(...RestoreLinks(masked.slice(last), links));
  }
  return domMap;
}
