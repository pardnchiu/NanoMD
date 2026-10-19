import { ParseInline } from "./inline";
import { REGEX_MD_H, REGEX_MD_H1, REGEX_MD_H2 } from "./regex";
import type { BlockNode } from "./types";

export function ParseHeading(lines: string[], i: number): { node: Extract<BlockNode, { type: "heading" }>; next: number } | null {
  const line = lines[i];

  const mdHeading = line.match(REGEX_MD_H);
  if (mdHeading) {
    return { node: { type: "heading", level: mdHeading[1].length, children: ParseInline(mdHeading[2]) }, next: i + 1 };
  }

  if (lines[i + 1] !== undefined) {
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
