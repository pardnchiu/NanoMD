import { REGEX_MD_CODE_BLOCK_LATEX, REGEX_MD_CODE_BLOCK_MERMAID, REGEX_MD_CODE_BLOCK_PREFIX } from "./regex";
import type { CodeBlockRender, Node } from "./types";

export function parseCodeBlock(
  lines: string[],
  i: number,
): { node: Extract<Node, { type: "codeBlock" }>; next: number } | null {
  const fence = lines[i].trim();

  let render: CodeBlockRender | undefined;
  if (REGEX_MD_CODE_BLOCK_MERMAID.test(fence)) {
    render = "mermaid";
  } else if (REGEX_MD_CODE_BLOCK_LATEX.test(fence)) {
    render = "latex";
  } else if (!REGEX_MD_CODE_BLOCK_PREFIX.test(fence)) {
    return null;
  }

  const blockLines: string[] = [];
  let j = i + 1;
  while (j < lines.length && lines[j].trim() !== "```") {
    blockLines.push(lines[j]);
    j++;
  }

  const value = blockLines.join("\n");
  return { node: render ? { type: "codeBlock", render, value } : { type: "codeBlock", value }, next: j + 1 };
}
