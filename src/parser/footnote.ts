import { PARSE_OPTIONS, ParseLines } from "./index";
import { LeadingWhitespace, StripIndent } from "./list";
import { REGEX_HTML_DOM, REGEX_MD_BLOCKQUOTE, REGEX_MD_CODE_FENCE, REGEX_MD_FOOTNOTE_DEF, REGEX_MD_H, REGEX_MD_HR, REGEX_MD_LIST } from "./regex";
import type { InlineNode, Footnote, ListItem, BlockNode, TableCell, TableRow } from "./types";

const footnoteMap = new Map<string, { id: string; children: BlockNode[] }>();

export function ParseFootnoteBlock(lines: string[], i: number): { next: number } | null {
  const match = lines[i].match(REGEX_MD_FOOTNOTE_DEF);
  if (!match) {
    return null;
  }

  const contentLines = [match[2]];
  let j = i + 1;
  while (j < lines.length) {
    if (lines[j].trim() === "") {
      let k = j;
      while (k < lines.length && lines[k].trim() === "") {
        k++;
      }
      if (k < lines.length && LeadingWhitespace(lines[k]).width >= PARSE_OPTIONS.indent) {
        contentLines.push("");
        j++;
        continue;
      }
      break;
    }
    if (LeadingWhitespace(lines[j]).width >= PARSE_OPTIONS.indent) {
      contentLines.push(StripIndent(lines[j], PARSE_OPTIONS.indent));
      j++;
      continue;
    }
    if (!(
      REGEX_MD_FOOTNOTE_DEF.test(lines[j]) ||
      REGEX_MD_LIST.test(lines[j].trimStart()) ||
      REGEX_MD_H.test(lines[j]) ||
      REGEX_MD_HR.test(lines[j]) ||
      REGEX_MD_BLOCKQUOTE.test(lines[j]) ||
      REGEX_MD_CODE_FENCE.test(lines[j]) ||
      REGEX_HTML_DOM.test(lines[j]) ||
      lines[j].includes("|")
    )) {
      contentLines.push(lines[j]);
      j++;
      continue;
    }
    break;
  }

  const key = match[1].toLowerCase();
  if (!footnoteMap.has(key)) {
    footnoteMap.set(key, { id: match[1], children: ParseLines(contentLines, true) });
  }
  return { next: j };
}

export function AppendFootnotes(domMap: BlockNode[]): void {
  const footnotes = new Map<string, Footnote>();
  const collectRefs = (nodes: (BlockNode | InlineNode | TableRow | TableCell | ListItem | Footnote)[]): void => {
    for (let k = 0; k < nodes.length; k++) {
      const node = nodes[k];
      if (node.type === "footnoteRef") {
        const key = node.id.toLowerCase();
        const definition = footnoteMap.get(key);
        if (!definition) {
          nodes[k] = { type: "text", value: `[^${node.id}]` };
          continue;
        }
        let footnote = footnotes.get(key);
        if (!footnote) {
          footnote = { type: "footnote", id: definition.id, index: footnotes.size + 1, children: definition.children };
          footnotes.set(key, footnote);
        }
        node.index = footnote.index;
      } else if ("children" in node) {
        collectRefs(node.children);
      }
    }
  };

  collectRefs(domMap);
  for (const footnote of footnotes.values()) {
    collectRefs(footnote.children);
  }
  if (footnotes.size > 0) {
    domMap.push({ type: "footnotes", children: [...footnotes.values()] });
  }
}

export function ResetFootnote(): void {
  footnoteMap.clear();
}
