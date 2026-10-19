import type { BlockNode } from "./types";
export declare function ParseHeading(lines: string[], i: number): {
    node: Extract<BlockNode, {
        type: "heading";
    }>;
    next: number;
} | null;
