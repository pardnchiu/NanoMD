# NanoMD - Architecture

> Back to [README](../README.md)

## Overview

NanoMD consists of three core components: **MDEditor** (editor), **MDParser** (parser), and **MDViewer** (previewer). Users type raw Markdown in the Editor, the Parser pipeline converts it to HTML, and the Viewer renders the result to the DOM.

```mermaid
graph LR
    Input[User Input] --> Editor[MDEditor]
    Editor -->|raw text| Parser[MDParser]
    Parser -->|HTML| Viewer[MDViewer]
    Editor -->|sync scroll| Viewer
    Editor -->|export| Export[Markdown / HTML File]
```

## Core Components

### MDEditor

Markdown editor responsible for user input, cursor management, shortcut handling, and history tracking.

```mermaid
graph TB
    Editor[MDEditor] --- Caret[editorCaret<br/>Cursor Positioning]
    Editor --- Selection[editorSelection<br/>Selection Ops]
    Editor --- History[editorHistory<br/>Undo / Redo Stack]
    Editor --- Keydown[editorKeydown<br/>Shortcut Mapping]
    Editor --- Panel[editorPanel<br/>Toolbar]
    Editor --- Tab[editorTab<br/>Tab Indentation]
```

| Module | Responsibility |
|--------|---------------|
| `editorCaret` | Track and set cursor position (row index and offset) |
| `editorSelection` | Handle multi-line selection, cut, and paste range calculation |
| `editorHistory` | Maintain undo/redo dual stacks with delayed writes to merge consecutive inputs |
| `editorKeydown` | Map keyboard combos (`Cmd+B`, `Cmd+Z`, etc.) to editor methods |
| `editorPanel` | Render top toolbar buttons and bind corresponding actions |
| `editorTab` | Handle Tab key indentation and de-indentation logic |

### MDParser

Standalone Markdown-to-HTML parser with no DOM dependency, usable independently.

```mermaid
graph LR
    Text[Markdown Text] --> Parse["parse()"]
    Parse --> Trans[transToHTML]
    Trans --> HTML[HTML String]
```

Parser internally calls `transToHTML()`, which sequentially executes each transform function in the parsing pipeline.

### MDViewer

Live previewer that receives HTML and renders it to the DOM. Includes a built-in vDOM diffing mechanism (currently paused in favor of full replacement for rendering correctness).

```mermaid
graph TB
    Viewer[MDViewer]
    Viewer -->|"timed trigger"| GetText["#get_text()"]
    GetText -->|"Markdown"| Trans[transToHTML]
    Trans -->|"HTML"| Render[replaceChildren]
    Viewer --- Scroll["Sync Scrolling<br/>(onwheel event forwarding)"]
    Viewer --- Theme["Theme Switching<br/>(light / dark / auto)"]

    subgraph VDOM["vDOM (paused)"]
        Diff["diff compare"]
        Patch["patch apply"]
        Diff --> Patch
    end
```

## Parsing Pipeline

`transToHTML()` is the core of the entire parsing flow, calling the following transform functions in fixed order:

```mermaid
graph TB
    Input["Raw Markdown"] --> Escape["Escape Pre-processing<br/>(backslash sequences → placeholders)"]

    Escape --> PreCode["setPreCode<br/>Fenced Code Blocks"]
    PreCode --> Code["setCode<br/>Inline Code"]
    Code --> Media["setMedia<br/>Image / Video / Vimeo / YouTube"]
    Media --> Link["setLink<br/>Hyperlink / Email"]
    Link --> Font["setFont<br/>Bold / Italic / Strikethrough / Highlight / Sub-Superscript"]
    Font --> Heading["setHeading<br/>H1 – H6 Headings"]
    Heading --> Hr["setHr<br/>Horizontal Rule"]
    Hr --> Table["setTable<br/>Table"]
    Table --> Blockquote["setBlockquote<br/>Blockquote"]
    Blockquote --> List["setList<br/>Ordered / Unordered List / Checkbox"]
    List --> TabCode["setTabCode<br/>Tab-indented Code Block"]
    TabCode --> Hashtag["setHashtag<br/>Hashtag Link"]

    Hashtag --> UUID["UUID Placeholder Restoration"]
    UUID --> Cleanup["Escape Restoration<br/>(placeholders → HTML entities)"]
    Cleanup --> Output["HTML Output"]
```

### Pipeline Order and Design Rationale

| Order | Function | Rationale |
|-------|----------|-----------|
| 1 | `setPreCode` | Fenced code blocks must be isolated first to prevent inner syntax from being misinterpreted |
| 2 | `setCode` | Inline code must be isolated before font formatting |
| 3 | `setMedia` | Image syntax `![]()` resembles link syntax `[]()` and must match first |
| 4 | `setLink` | Hyperlinks and email links |
| 5 | `setFont` | Bold, italic, and other inline formatting |
| 6 | `setHeading` | Headings must precede lists (`#` may appear inside list items) |
| 7 | `setHr` | Horizontal rules `---` must precede tables to avoid conflicts |
| 8 | `setTable` | Table parsing |
| 9 | `setBlockquote` | Blockquotes (nestable) |
| 10 | `setList` | Ordered/unordered lists and checkboxes |
| 11 | `setTabCode` | Tab-indented code blocks processed last to avoid list conflicts |
| 12 | `setHashtag` | Hashtag links as the final text transform |

### UUID Placeholder Mechanism

During parsing, processed HTML fragments are replaced with UUID placeholders (`{{uuid32}}`) to prevent re-parsing by subsequent steps. After all transforms complete, placeholders are restored to actual HTML.

### Standard Mode

When `standard: true`, the extended versions of `setPreCode`, `setMedia`, `setLink`, `setFont`, `setBlockquote`, and `setHashtag` are skipped. Only standard Markdown equivalents (`setLinkStandard`, `setFontStandard`, `setBlockquoteStandard`) are used.

## Editor Event Flow

```mermaid
sequenceDiagram
    participant U as User
    participant E as MDEditor
    participant H as editorHistory
    participant V as MDViewer
    participant T as transToHTML

    U->>E: Keyboard input / Paste / Cut
    E->>E: editorKeydown intercepts shortcuts
    E->>E: editorCaret updates cursor position
    E->>H: add(cursor, clearForward, delay)
    H->>H: Delayed merge then push to undo stack

    alt autosave enabled
        E->>V: Trigger init()
        V->>V: #get_text() reads editor text
        V->>T: transToHTML(markdown)
        T-->>V: HTML string
        V->>V: replaceChildren(HTML)
    end

    U->>E: Cmd+Z
    E->>H: undo()
    H-->>E: Previous state (content + cursor)
    E->>E: Restore editor content and cursor
    E->>V: Trigger init()
```

## Virtual DOM Diffing

The vDOM module implements a lightweight diff algorithm that compares old and new node trees to produce minimal patch operations.

```mermaid
stateDiagram-v2
    [*] --> Compare: Old/New vDOM input

    Compare --> Create: Old node missing
    Compare --> Remove: New node missing
    Compare --> Replace: Different tag
    Compare --> DiffProps: Same tag

    DiffProps --> DiffChildren: Props diffed
    DiffChildren --> Text: Both children are text
    DiffChildren --> Append: Old child missing
    DiffChildren --> RemoveChild: New child missing
    DiffChildren --> Recurse: Recurse into children

    Create --> [*]
    Remove --> [*]
    Replace --> [*]
    Text --> [*]
    Append --> [*]
    RemoveChild --> [*]
    Recurse --> Compare
```

### Patch Operation Types

| Type | Description |
|------|-------------|
| `create` | Add new node |
| `remove` | Remove node |
| `replace` | Replace node (different tag) |
| `prop` | Update or remove attribute |
| `text` | Update text content |
| `append` | Append child node |

> The vDOM diffing is currently paused in favor of `replaceChildren()` full replacement to ensure rendering correctness. A future version plans to rewrite the diff algorithm to reduce DOM operations.

## Theme System

```mermaid
graph LR
    System["System Preference<br/>prefers-color-scheme"] -->|auto| Mode{Mode Check}
    User["User Specified<br/>light / dark"] --> Mode
    Mode -->|dark| Dark["data-mode='dark'"]
    Mode -->|light| Light["data-mode=''"]
    Dark --> CSS["SCSS Variable Switch"]
    Light --> CSS
```

Editor and Viewer each maintain a `data-mode` attribute. SCSS uses `[data-mode="dark"]` selectors to switch color variables.

## Keyboard Shortcuts

| Combo | Action |
|-------|--------|
| `Cmd+B` | Bold |
| `Cmd+I` | Italic |
| `Cmd+Shift+X` | Strikethrough |
| `Cmd+U` | Underline |
| `Cmd+M` | Highlight marker |
| `Cmd+K` | Inline code |
| `Cmd+↑` | Superscript |
| `Cmd+↓` | Subscript |
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+A` | Select all |
| `Cmd+S` | Save |
| `Cmd+]` | Indent |
| `Tab` | Insert indentation |

***

©️ 2024 [邱敬幃 Pardn Chiu](https://linkedin.com/in/pardnchiu)
