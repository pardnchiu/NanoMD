export type ChildType = "text" | "code" | "b" | "em" | "del" | "mark" | "sub" | "sup";

export interface ChildNode {
  type: ChildType;
  value: string;
}

export type CodeBlockRender = "mermaid" | "latex";

export type TableAlign = "left" | "center" | "right";

export interface TableRow {
  type: "tableRow";
  header: boolean;
  children: TableCell[];
}

export interface TableCell {
  type: "tableCell";
  children: ChildNode[];
}

export type Node =
  | { type: "codeBlock"; render?: CodeBlockRender; value: string }
  | { type: "hr" }
  | { type: "heading"; level: number; children: ChildNode[] }
  | { type: "html"; value: string }
  | { type: "table"; align: (TableAlign | null)[]; children: TableRow[] }
  | { type: "text"; children: ChildNode[] };
