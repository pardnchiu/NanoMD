import type { BlockNode } from "./types";
export declare function ParseFootnoteBlock(lines: string[], i: number): {
    next: number;
} | null;
export declare function AppendFootnotes(domMap: BlockNode[]): void;
export declare function ResetFootnote(): void;
