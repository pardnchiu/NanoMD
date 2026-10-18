import { MD_INLINE_TYPES, REGEX_MD_CODE_INLINE, REGEX_MD_INLINE } from "./regex";
import type { ChildNode, ChildType } from "./types";

export function parseInline(text: string): ChildNode[] {
  const domMap: ChildNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  REGEX_MD_CODE_INLINE.lastIndex = 0;
  while ((match = REGEX_MD_CODE_INLINE.exec(text))) {
    if (match.index > last) {
      domMap.push(...parseInlineMarks(text.slice(last, match.index)));
    }

    domMap.push({ type: "code", value: match[1] });
    last = REGEX_MD_CODE_INLINE.lastIndex;
  }

  if (last < text.length) {
    domMap.push(...parseInlineMarks(text.slice(last)));
  }
  return domMap;
}

function parseInlineMarks(text: string): ChildNode[] {
  const domMap: ChildNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  REGEX_MD_INLINE.lastIndex = 0;
  while ((match = REGEX_MD_INLINE.exec(text))) {
    // * not matched, return as text
    if (match.index > last) {
      domMap.push({ type: "text", value: text.slice(last, match.index) });
    }

    // * matched
    const target = match.findIndex((v, k) => k > 0 && v !== undefined);
    domMap.push({ type: MD_INLINE_TYPES[target] as ChildType, value: match[target] });
    last = REGEX_MD_INLINE.lastIndex;
  }

  // * not matched, return as text
  if (last < text.length) {
    domMap.push({ type: "text", value: text.slice(last) });
  }
  return domMap;
}
