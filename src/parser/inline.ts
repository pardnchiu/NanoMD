import { ParseLink, RestoreLinks } from "./link";
import { MD_INLINE_TYPES, REGEX_MD_INLINE } from "./regex";
import type { InlineNode, MarkType } from "./types";

export function ParseInline(text: string): InlineNode[] {
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
