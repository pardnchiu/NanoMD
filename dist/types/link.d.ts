import type { InlineNode, Footnote, ListItem, BlockNode, TableCell, TableRow } from "./types";
export declare function ParseLink(text: string): {
    mask: string;
    links: InlineNode[];
};
export declare function RestoreLinks(text: string, links: InlineNode[]): InlineNode[];
export declare function ParseLinkDefBlock(lines: string[], i: number): {
    next: number;
} | null;
export declare function RestoreLinkRefs(nodes: (BlockNode | InlineNode | TableRow | TableCell | ListItem | Footnote)[]): void;
export declare function ResetLinkRef(): void;
