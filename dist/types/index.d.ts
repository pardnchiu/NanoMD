import "./html";
import { AST } from "./types";
import type { DependencyEndpoint, InitOptions, BlockNode } from "./types";
export { OnCopyClick, Refresh } from "./refresh";
export * as MDParser from "./index";
export declare const DEFAULT_ENDPOINT: Required<DependencyEndpoint>;
export declare const PARSE_OPTIONS: {
    indent: number;
    fileEndpoint: string;
};
export declare function Init(options?: InitOptions, endpoint?: DependencyEndpoint): Promise<void[]>;
export declare function Parse(content: string): AST;
export declare function ParseLines(lines: string[], nested?: boolean): BlockNode[];
