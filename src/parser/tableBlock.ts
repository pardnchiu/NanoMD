import { ParseInline } from "./inline";
import { REGEX_MD_TABLE_ALIGN } from "./regex";
import type { BlockNode, TableAlign, TableRow } from "./types";

export function ParseTableBlock(lines: string[], i: number): { node: Extract<BlockNode, { type: "table" }>; next: number } | null {
  const line = lines[i];
  if (!line.includes("|") || lines[i + 1] === undefined) {
    return null;
  }

  const align = parseAlign(lines[i + 1]);
  if (!align) {
    return null;
  }

  const rows: TableRow[] = [
    {
      type: "tableRow",
      header: true,
      children: splitCells(line).map((cell) => ({ type: "tableCell", children: ParseInline(cell) })),
    },
  ];
  let j = i + 2;
  while (j < lines.length && lines[j].includes("|") && !parseAlign(lines[j])) {
    rows.push({
      type: "tableRow",
      header: false,
      children: splitCells(lines[j]).map((cell) => ({ type: "tableCell", children: ParseInline(cell) })),
    });
    j++;
  }

  return { node: { type: "table", align, children: rows }, next: j };
}

function parseAlign(line: string): (TableAlign | null)[] | null {
  if (!line.includes("|")) {
    return null;
  }

  const align: (TableAlign | null)[] = [];
  for (const cell of splitCells(line)) {
    const match = cell.match(REGEX_MD_TABLE_ALIGN);
    if (!match) {
      return null;
    }
    if (match[1] && match[2]) {
      align.push("center");
    } else if (match[1]) {
      align.push("left");
    } else if (match[2]) {
      align.push("right");
    } else {
      align.push(null);
    }
  }
  return align;
}

function splitCells(line: string): string[] {
  let lineTrim = line.trim();
  if (lineTrim.startsWith("|")) {
    lineTrim = lineTrim.slice(1);
  }
  if (lineTrim.endsWith("|")) {
    lineTrim = lineTrim.slice(0, -1);
  }
  return lineTrim.split("|").map((cell) => cell.trim());
}
