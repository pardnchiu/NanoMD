export interface InitOptions {
    enable?: DependencyEnable;
    indent?: number;
    fileEndpoint?: string;
    hashtagEndpoint?: string;
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
export interface Dependency {
    Chart?: {
        new (canvas: HTMLCanvasElement, config: unknown): unknown;
        instances: Record<string, {
            canvas: HTMLCanvasElement;
            destroy(): void;
        }>;
    };
    katex?: {
        render(tex: string, element: HTMLElement, options: {
            displayMode: boolean;
            throwOnError: boolean;
        }): void;
    };
    PR?: {
        prettyPrint(): void;
    };
    mermaid?: {
        initialize(config: {
            startOnLoad: boolean;
            theme: string;
        }): void;
        parse(text: string, options: {
            suppressErrors: boolean;
        }): Promise<unknown>;
        render(id: string, text: string): Promise<{
            svg: string;
            bindFunctions?: (element: Element) => void;
        }>;
    };
}
export type BlockNode = {
    type: "codeBlock";
    lang?: string;
    value: string;
} | {
    type: "hr";
} | {
    type: "break";
} | {
    type: "heading";
    level: number;
    children: InlineNode[];
} | {
    type: "html";
    value: string;
} | {
    type: "blockquote";
    tag?: BlockquoteTag;
    children: BlockNode[];
} | {
    type: "table";
    align: (TableAlign | null)[];
    children: TableRow[];
} | {
    type: "list";
    ordered: boolean;
    children: ListItem[];
} | {
    type: "footnotes";
    children: Footnote[];
} | {
    type: "text";
    children: InlineNode[];
};
export type InlineNode = {
    type: "text";
    value: string;
} | {
    type: "code";
    value: string;
} | {
    type: "math";
    value: string;
} | {
    type: "link";
    href: string;
    tag?: LinkTag;
    title?: string;
    width?: string;
    height?: string;
    children: InlineNode[];
} | {
    type: "footnoteRef";
    id: string;
    index: number;
} | {
    type: "linkRef";
    label: string;
    ref: string;
} | {
    type: MarkType;
    children: InlineNode[];
};
export interface TableRow {
    type: "tableRow";
    header: boolean;
    children: TableCell[];
}
export interface TableCell {
    type: "tableCell";
    children: InlineNode[];
}
export interface ListItem {
    type: "listItem";
    checked?: boolean;
    children: BlockNode[];
}
export interface Footnote {
    type: "footnote";
    id: string;
    index: number;
    children: BlockNode[];
}
export type BlockquoteTag = "note" | "tip" | "important" | "warning" | "caution";
export type TableAlign = "left" | "center" | "right";
export type LinkTag = "youtube" | "vimeo" | "file" | "image" | "video" | "hashtag";
export type MarkType = "b" | "em" | "del" | "mark" | "sub" | "sup";
export interface AST {
    html(): string;
    json(): BlockNode[];
}
export declare class AST extends Array<BlockNode> {
}
