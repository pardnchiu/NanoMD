import { ParseLink, RestoreLinks } from "./link";
import { MD_INLINE_TYPES, REGEX_MD_CODE_INLINE, REGEX_MD_FILE_PATH, REGEX_MD_INLINE } from "./regex";
import type { ChildNode, MarkType } from "./types";

export function ParseInline(text: string): ChildNode[] {
  const domMap: ChildNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  REGEX_MD_CODE_INLINE.lastIndex = 0;
  while ((match = REGEX_MD_CODE_INLINE.exec(text))) {
    if (match.index > last) {
      domMap.push(...parseInlineMarks(text.slice(last, match.index)));
    }

    domMap.push(
      REGEX_MD_FILE_PATH.test(match[1])
        ? { type: "link", href: match[1], tag: "file", children: [{ type: "text", value: match[1] }] }
        : { type: "code", value: match[1] },
    );
    last = REGEX_MD_CODE_INLINE.lastIndex;
  }

  if (last < text.length) {
    domMap.push(...parseInlineMarks(text.slice(last)));
  }
  return domMap;
}

function parseInlineMarks(text: string): ChildNode[] {
  const { mask: masked, links } = ParseLink(text);

  const domMap: ChildNode[] = [];
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
    domMap.push({ type: MD_INLINE_TYPES[target] as MarkType, children: RestoreLinks(match[target], links) });
    last = REGEX_MD_INLINE.lastIndex;
  }

  // * not matched, return as text
  if (last < masked.length) {
    domMap.push(...RestoreLinks(masked.slice(last), links));
  }
  return domMap;
}
