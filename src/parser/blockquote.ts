import { parseLines } from "./index";
import { REGEX_MD_BLOCKQUOTE_TAG, REGEX_MD_BLOCKQUOTE } from "./regex";
import type { BlockquoteTag, Node } from "./types";

export function parseBlockquote(
  lines: string[],
  i: number,
  nested: boolean,
): { node: Extract<Node, { type: "blockquote" }>; next: number } | null {
  const quoteLines: string[] = [];
  let j = i;
  while (j < lines.length) {
    const match = lines[j].match(REGEX_MD_BLOCKQUOTE);
    if (!match) {
      break;
    }
    quoteLines.push(match[1]);
    j++;
  }

  if (quoteLines.length === 0) {
    return null;
  }

  let tag: BlockquoteTag | undefined;
  const tagMatch = nested ? null : quoteLines[0].match(REGEX_MD_BLOCKQUOTE_TAG);
  if (tagMatch && quoteLines.slice(1).some((line) => line.trim() !== "")) {
    tag = tagMatch[1].toLowerCase() as BlockquoteTag;
  }

  const children = parseLines(tag ? quoteLines.slice(1) : quoteLines, true);
  return { node: tag ? { type: "blockquote", tag, children } : { type: "blockquote", children }, next: j };
}
