import { PARSE_OPTIONS, ParseLines } from "./index";
import {
  REGEX_HTML_DOM,
  REGEX_MD_BLOCKQUOTE,
  REGEX_MD_CODE_FENCE,
  REGEX_MD_H,
  REGEX_MD_HR,
  REGEX_MD_LIST,
  REGEX_MD_LIST_TASK,
} from "./regex";
import type { ListItem, Node } from "./types";

export function ParseListBlock(
  lines: string[],
  i: number,
): { node: Extract<Node, { type: "list" }>; next: number } | null {
  const baseIndent = leadingWhitespace(lines[i]).width;
  if (!matchMarker(lines[i], baseIndent)) {
    return null;
  }

  const items: ListItem[] = [];
  let ordered: boolean | null = null;
  let j = i;
  while (j < lines.length) {
    if (j > i && lines[j].trim() === "") {
      let k = j;
      while (k < lines.length && lines[k].trim() === "") {
        k++;
      }
      if (k < lines.length && matchMarker(lines[k], baseIndent)) {
        j = k;
      } else {
        break;
      }
    }

    const marker = matchMarker(lines[j], baseIndent);
    if (!marker || (ordered !== null && marker.ordered !== ordered)) {
      break;
    }
    ordered = marker.ordered;

    const itemLines = [marker.content];
    j++;
    while (j < lines.length) {
      if (lines[j].trim() === "") {
        let k = j;
        while (k < lines.length && lines[k].trim() === "") {
          k++;
        }
        if (k < lines.length && leadingWhitespace(lines[k]).width >= marker.column) {
          itemLines.push("");
          j++;
          continue;
        }
        break;
      }
      if (leadingWhitespace(lines[j]).width >= marker.column) {
        itemLines.push(stripIndent(lines[j], marker.column));
        j++;
        continue;
      }
      if (
        !matchMarker(lines[j], baseIndent) &&
        !(
          REGEX_MD_H.test(lines[j]) ||
          REGEX_MD_HR.test(lines[j]) ||
          REGEX_MD_BLOCKQUOTE.test(lines[j]) ||
          REGEX_MD_CODE_FENCE.test(lines[j]) ||
          REGEX_HTML_DOM.test(lines[j]) ||
          lines[j].includes("|")
        )
      ) {
        itemLines.push(lines[j]);
        j++;
        continue;
      }
      break;
    }

    const task = itemLines[0].match(REGEX_MD_LIST_TASK);
    if (task) {
      itemLines[0] = task[2];
    }
    const children = ParseLines(itemLines, true);
    items.push(task ? { type: "listItem", checked: task[1] !== " ", children } : { type: "listItem", children });
  }

  return { node: { type: "list", ordered: ordered ?? false, children: items }, next: j };
}

function matchMarker(line: string, baseIndent: number): { ordered: boolean; content: string; column: number } | null {
  const { width, chars } = leadingWhitespace(line);
  if (width < baseIndent || width > baseIndent + 3) {
    return null;
  }
  const match = line.slice(chars).match(REGEX_MD_LIST);
  if (!match) {
    return null;
  }
  let column = width + match[1].length;
  for (const char of match[2]) {
    column += char === "\t" ? PARSE_OPTIONS.indent - (column % PARSE_OPTIONS.indent) : 1;
  }
  return { ordered: match[1].endsWith("."), content: match[3], column };
}

function leadingWhitespace(line: string): { width: number; chars: number } {
  let width = 0;
  let chars = 0;
  for (; chars < line.length; chars++) {
    if (line[chars] === " ") {
      width += 1;
    } else if (line[chars] === "\t") {
      width += PARSE_OPTIONS.indent - (width % PARSE_OPTIONS.indent);
    } else {
      break;
    }
  }
  return { width, chars };
}

function stripIndent(line: string, column: number): string {
  let width = 0;
  let k = 0;
  while (k < line.length && width < column) {
    if (line[k] === " ") {
      width += 1;
    } else if (line[k] === "\t") {
      width += PARSE_OPTIONS.indent - (width % PARSE_OPTIONS.indent);
    } else {
      break;
    }
    k++;
  }
  return line.slice(k);
}
