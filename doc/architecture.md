# NanoMD - Architecture

Last updated: 2026-10-20

> Back to [README](../README.md)

## Overview

```mermaid
graph TB
    Input[Markdown text] --> Parse["Parse()"]
    Parse --> Reset[Reset footnotes and link definitions]
    Reset --> Lines[ParseLines block parsing]
    Lines --> Inline[ParseInline inline parsing]
    Lines --> Post[AppendFootnotes / RestoreLinkRefs]
    Post --> AST[AST array]
    AST --> JSON["JSON for native renderers (build your own)"]
    AST --> HTML["AST.html() HTML string"]
    HTML --> DOM[Written into a .nanomd container]
    DOM --> Refresh["Refresh() dependency rendering"]
    Init["Init() loads dependencies"] --> Refresh
    Load[Module load] --> CSS[Inserts parser.css]
```

## Module: Block Parsing (ParseLines)

Each line is classified in priority order; nested content (blockquotes, list items, footnotes) calls `ParseLines` recursively.

```mermaid
graph TB
    subgraph ParseLines
        Line[Current line] --> Blank{Blank?}
        Blank -->|Yes| Break[break node, consecutive blanks merged]
        Blank -->|No| Code[ParseCodeBlock]
        Code --> HTML[Raw HTML line]
        HTML --> Table[ParseTableBlock]
        Table --> HR[Horizontal rule]
        HR --> Quote[ParseBlockquote with alerts]
        Quote --> Foot[ParseFootnoteBlock top level only]
        Foot --> LinkDef[ParseLinkDefBlock]
        LinkDef --> List[ParseListBlock]
        List --> Heading[ParseHeading ATX / Setext]
        Heading --> Text[Plain line, adjacent lines merged into a paragraph]
    end
    Quote -.recursion.-> ParseLines
    List -.recursion.-> ParseLines
    Foot -.recursion.-> ParseLines
    Text --> ParseInline[ParseInline]
```

## Module: Inline Parsing (ParseInline)

Code spans are cut out first; the remaining segments mask content that must not be styled with placeholders, then styles are matched.

```mermaid
graph TB
    subgraph ParseInline
        Seg[Text segment] --> CodeSpan[Cut code spans, any backtick length]
        CodeSpan --> Path{Content is a path?}
        Path -->|Yes| File[link tag=file]
        Path -->|No| CodeNode[code node]
        CodeSpan --> Mask[ParseLink masking]
        Mask --> M1[Inline math $...$]
        Mask --> M2[Escapes]
        Mask --> M3["Footnote refs [^id]"]
        Mask --> M4[Links / images / reference links / paths / bare URLs]
        M4 --> Marks[Style matching bold italic strike mark sub sup]
        Marks --> Restore[RestoreLinks restores placeholders]
    end
```

## Module: Post-Processing

Nodes that need whole-document information are resolved once parsing finishes.

```mermaid
graph LR
    subgraph PostProcessing
        Refs[footnoteRef nodes] --> Number[Number by first reference]
        Number --> Missing{Defined?}
        Missing -->|No| BackText1["Restored as [^id] text"]
        Missing -->|Yes| Section[footnotes block appended at the end]
        LinkRef[linkRef nodes] --> Def{Defined?}
        Def -->|Yes| Link[link node]
        Def -->|No| BackText2["Restored as [label][ref] text"]
    end
```

## Module: HTML Output (AST.html)

`AST` extends `Array` and `html()` lives on its prototype; output is chosen by node type and escaping happens at output time.

```mermaid
graph TB
    subgraph html
        Node[BlockNode] --> Render[render]
        Render --> Block[renderBlockquote / renderTable / renderList / renderFootnote]
        Render --> CodeBlock[renderCodeBlock]
        CodeBlock --> Wrap{lang}
        Wrap -->|mermaid| MW[md-mermaid wrapper plus fallback code]
        Wrap -->|math| LW[md-latex wrapper plus fallback code]
        Wrap -->|chartjs| CW[md-chart canvas, invalid config outputs code]
        Wrap -->|other| Pre[prettyprint code block]
        Render --> Inline[renderInline / renderLink]
        Inline --> FileLink{fileEndpoint set?}
        FileLink -->|Yes| FileA[md-file-link anchor]
        FileLink -->|No| FileText[Plain path text]
        Inline --> TagLink{hashtagEndpoint set?}
        TagLink -->|Yes| TagA[md-hashtag anchor]
        TagLink -->|No| TagText[Plain #tag text]
        Render --> Raw[Raw HTML sanitization]
    end
    Escape[escapeHTML / escapeAttr] --> Inline
    Escape --> Pre
```

## Module: Dependencies and Runtime (Init / Refresh)

`Init` only loads; `Refresh` renders on DOM that is already in place. Both read dependencies only from globals that already exist.

```mermaid
graph TB
    subgraph Init
        Opt[options.enable] --> Insert[insertHead deduplicated by URL]
        Insert --> M[mermaid.min.js]
        Insert --> K[katex.min.js and katex.min.css]
        Insert --> P[run_prettify.js]
        Insert --> C[chart.umd.min.js]
    end
    subgraph Refresh
        Guard{Container in the document?} -->|No| Skip[Log Invalid and skip]
        Guard -->|Yes| Copy[bindCopy → OnCopyClick callback]
        File[bindFile → fetch fileEndpoint]
        Chart[renderChart, falls back to code]
        Latex[renderLatex, block falls back to code, inline restores $...$]
        PR[PR.prettyPrint]
        Mermaid[renderMermaid, parse precheck then mermaid.render to SVG, falls back to code]
        Done[Successful wrappers get data-rendered, hiding the fallback code]
    end
    Module[Module load] --> URL[currentScript.src or import.meta.url]
    URL --> CSS[parser.css in the same directory]
```

## Data Flow

```mermaid
sequenceDiagram
    participant App as Caller
    participant P as MDParser
    participant DOM as .nanomd container
    participant CDN as Dependency CDN
    App->>P: Load parser.js
    P->>DOM: Insert parser.css
    App->>P: Parse(markdown)
    P-->>App: AST
    App->>P: ast.html()
    P-->>App: HTML string
    App->>DOM: innerHTML = HTML
    App->>P: Init({ enable })
    P->>CDN: Load enabled dependencies
    CDN-->>P: Loaded
    App->>P: Refresh(container)
    P->>DOM: Copy buttons, charts, math, highlighting, Mermaid
```

***

©️ 2024 [邱敬幃 Pardn Chiu](https://www.linkedin.com/in/pardnchiu)
