import { parseInline } from "./inline";
import { REGEX_MD_H, REGEX_MD_H1, REGEX_MD_H2 } from "./regex";
import type { Node } from "./types";

export function parseHeading(lines: string[], i: number): { node: Extract<Node, { type: "heading" }>; next: number } | null {
  const line = lines[i];

  const mdHeading = line.match(REGEX_MD_H);
  if (mdHeading) {
    return { node: { type: "heading", level: mdHeading[1].length, children: parseInline(mdHeading[2]) }, next: i + 1 };
  }

  if (lines[i + 1] !== undefined) {
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
