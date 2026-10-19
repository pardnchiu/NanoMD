export interface InitOptions {
  enable?: DependencyEnable;
  indent?: number;
}

export interface DependencyEndpoint {
  mermaidjs?: string;
  katexjs?: string;
  katexcss?: string;
  googleprettifyjs?: string;
  chartjs?: string;
}

export interface DependencyEnable {
  mermaid?: boolean;
  latex?: boolean;
  highlight?: boolean;
  chartjs?: boolean;
}

export type Node =
  | { type: "codeBlock"; lang?: string; value: string }
  | { type: "hr" }
  | { type: "break" }
  | { type: "heading"; level: number; children: ChildNode[] }
  | { type: "html"; value: string }
  | { type: "blockquote"; tag?: BlockquoteTag; children: Node[] }
  | { type: "table"; align: (TableAlign | null)[]; children: TableRow[] }
  | { type: "list"; ordered: boolean; children: ListItem[] }
  | { type: "footnotes"; children: Footnote[] }
  | { type: "text"; children: ChildNode[] };

// * ![a](x.png)
// * ![a](x.png "title")
// * ![a](x.png)(300x200)
// * ![a](x.png)(50%x)
// * ![a](x.png)(x200)
// * ![a](x.png)(300)
// * ![a](x.mp4)
// * ![a](x.mov "title")(320x)
// * [a](https://example.com)
// * [a](https://example.com "title")
// * [a](https://www.youtube.com/watch?v=jNQXAC9IVRw)
// * [a](https://vimeo.com/76979871)
// * https://example.com
// * ~/Desktop/a.md
// * /Users/pardn/a/b.go
export type ChildNode =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | {
      type: "link";
      href: string;
      tag?: LinkTag;
      title?: string;
      width?: string;
      height?: string;
      children: ChildNode[];
    }
  | { type: "footnoteRef"; id: string; index: number }
  | { type: MarkType; children: ChildNode[] };

export interface TableRow {
  type: "tableRow";
  header: boolean;
  children: TableCell[];
}

export interface TableCell {
  type: "tableCell";
  children: ChildNode[];
}

export interface ListItem {
  type: "listItem";
  checked?: boolean;
  children: Node[];
}

export interface Footnote {
  type: "footnote";
  id: string;
  index: number;
  children: Node[];
}

export type BlockquoteTag = "note" | "tip" | "important" | "warning" | "caution";

export type TableAlign = "left" | "center" | "right";

export type LinkTag = "youtube" | "vimeo" | "file" | "image" | "video";

export type MarkType = "b" | "em" | "del" | "mark" | "sub" | "sup";
