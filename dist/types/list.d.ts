import type { BlockNode } from "./types";
export declare function ParseListBlock(lines: string[], i: number): {
    node: Extract<BlockNode, {
        type: "list";
    }>;
    next: number;
} | null;
export declare function LeadingWhitespace(line: string): {
    width: number;
    chars: number;
};
export declare function StripIndent(line: string, column: number): string;
