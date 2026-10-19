import type { BlockNode } from "./types";
export declare function ParseCodeBlock(lines: string[], i: number): {
    node: Extract<BlockNode, {
        type: "codeBlock";
    }>;
    next: number;
} | null;
