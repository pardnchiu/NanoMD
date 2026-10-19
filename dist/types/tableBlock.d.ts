import type { BlockNode } from "./types";
export declare function ParseTableBlock(lines: string[], i: number): {
    node: Extract<BlockNode, {
        type: "table";
    }>;
    next: number;
} | null;
