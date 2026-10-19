import type { BlockNode } from "./types";
export declare function ParseBlockquote(lines: string[], i: number, nested: boolean): {
    node: Extract<BlockNode, {
        type: "blockquote";
    }>;
    next: number;
} | null;
