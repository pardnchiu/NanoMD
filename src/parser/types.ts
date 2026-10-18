export type ChildType = "text" | "b" | "em" | "del" | "mark" | "sub" | "sup";

export interface ChildNode {
  type: ChildType;
  value: string;
}

export type CodeBlockRender = "mermaid" | "latex";

export type Node =
  | { type: "codeBlock"; render?: CodeBlockRender; value: string }
  | { type: "hr" }
  | { type: "heading"; level: number; children: ChildNode[] }
  | { type: "html"; value: string }
  | { type: "text"; children: ChildNode[] };
