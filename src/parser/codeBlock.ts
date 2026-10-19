import { REGEX_MD_CODE_BLOCK } from "./regex";
import type { Node } from "./types";

export function ParseCodeBlock(
  lines: string[],
  i: number,
): { node: Extract<Node, { type: "codeBlock" }>; next: number } | null {
  const fence = lines[i].trim().match(REGEX_MD_CODE_BLOCK);
  if (!fence) {
    return null;
  }

  const blockLines: string[] = [];
  let j = i + 1;
  while (j < lines.length) {
    const line = lines[j].trim();
    if (line.length >= fence[1].length && line === fence[1][0].repeat(line.length)) {
      break;
    }
    blockLines.push(lines[j]);
    j++;
  }

  const value = blockLines.join("\n");
  const lang = fence[2].toLowerCase();
  if (lang && j < lines.length) {
    return { node: { type: "codeBlock", lang, value }, next: j + 1 };
  }
  return { node: { type: "codeBlock", value }, next: j + 1 };
}
