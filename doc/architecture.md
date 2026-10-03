# NanoMD - Architecture

> Back to [README](../README.md)

## Overview

```mermaid
graph LR
    User[User input] --> Editor[MDEditor]
    Editor -->|"init() triggers render"| Viewer[MDViewer]
    Viewer -->|reads each row| Editor
    Viewer -->|Markdown| Trans["transToHTML()"]
    Parser[MDParser] -->|Markdown| Trans
    Editor -->|"download('html')"| Trans
    Trans -->|HTML string| Viewer
    Trans -->|HTML string| Parser
    Trans --> Funcs["set* transforms<br/>src/function/"]
    Data["src/data.js<br/>CDN injection"] --> Runtime[Material Symbols / Mermaid / code-prettify / NanoMD.css]
    Viewer --> Runtime
```

None of the three components parses Markdown itself; all call the same `transToHTML()`. `MDViewer` passes its hashtag settings and always uses extended mode, `MDParser` passes its `standard` flag, and `MDEditor` calls it only when exporting HTML.

## Module: MDEditor

A `contentEditable` editor where each row is a `<div>`; sub-modules handle the caret, selection, history, shortcuts and toolbar.

```mermaid
graph TB
    subgraph MDEditor["MDEditor (src/model/editor.js)"]
        Core[MDEditor core<br/>init / save / download / formatting]
        Caret[editorCaret<br/>caret row and offset]
        Selection[editorSelection<br/>selection range]
        History[editorHistory<br/>snapshot undo / redo stacks]
        Keydown[editorKeydown<br/>key combo mapping]
        Tab[editorTab<br/>floating toolbar]
        Core --- Caret
        Core --- Selection
        Core --- History
        Core --- Keydown
        Core --- Tab
    end
    Keyboard[Keyboard events] --> Keydown
    Tab -->|event.upload| Upload[User upload function]
    Core -->|event.save| Save[User save function]
    Core -->|"viewer.init()"| Viewer[MDViewer]
    Core -->|export| File[.md / .html file]
```

## Module: MDViewer

A debounced preview container that wires copy buttons, code highlighting and Mermaid after each render.

```mermaid
graph TB
    subgraph MDViewer["MDViewer (src/model/viewer.js)"]
        Init["init(txt)"]
        Timer[Delay timer<br/>sync.delay]
        Pick[Pick content<br/>txt / editor text / emptyContent]
        Replace["replaceChildren()"]
        Copy[Bind copy buttons]
        Poll[Poll for PR every 50ms]
        Init --> Timer --> Pick
        Pick --> Trans["transToHTML()"]
        Trans --> Replace --> Copy --> Poll
    end
    Editor[MDEditor] -->|wheel deltaY| Scroll[sync.scroll]
    Scroll --> MDViewer
    Poll --> PR["PR.prettyPrint()"]
    Poll --> Mermaid["mermaid.run()"]
    VDOM[vDOM<br/>kept but inactive] -.-> MDViewer
```

## Module: Parsing Pipeline

`transToHTML()` runs the transforms in a fixed order; converted fragments are isolated as `{{tag-uuid}}` placeholders and restored once at the end.

```mermaid
graph TB
    subgraph Pipeline["transToHTML() (src/function/)"]
        Escape[Escape pre-processing<br/>\\* → @ast@, $ → @dollar@]
        Pre[setPreCode<br/>fenced code / Mermaid]
        Code[setCode<br/>inline code]
        Media[setMedia / setMediaDefault<br/>images, video]
        Link[setLink / setLinkStandard<br/>links, YouTube / Vimeo]
        Font[setFont / setFontStandard<br/>bold, marker, sub/sup]
        Block[setHeading / setHr / setTable]
        Quote[setBlockquote / setBlockquoteStandard<br/>quotes, alerts]
        List[setList / setTabCode]
        Tag[setHashtag]
        Restore[Restore placeholders and escapes]
        Escape --> Pre --> Code --> Media --> Link --> Font --> Block --> Quote --> List --> Tag --> Restore
    end
    UUID[replaceWithUUID<br/>elementUUIDMap] -.-> Pipeline
    Standard{standard is true} -.->|skip extended transforms| Pipeline
```

## Module: Runtime Resources

```mermaid
graph LR
    subgraph Data["src/data.js"]
        Inject[Insert into head on load]
        Dark[isDarkMode<br/>one-time matchMedia read]
    end
    Inject --> Fonts[Material Symbols]
    Inject --> MermaidLib[Mermaid 11.4.1]
    Inject --> Prettify[code-prettify]
    Inject --> CSS[NanoMD.css]
    Dark --> Mode[style.mode auto]
```

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant E as MDEditor
    participant V as MDViewer
    participant T as transToHTML
    participant R as PR / mermaid
    U->>E: Type (keyup)
    E->>E: unsave(), write history
    E->>V: init()
    V->>V: Reset timer, wait sync.delay
    V->>E: Read each row's innerText
    V->>T: transToHTML(text, hashtag)
    T-->>V: HTML string
    V->>V: replaceChildren(), bind copy buttons
    loop Every 50ms
        V->>R: Check whether PR exists
    end
    V->>R: PR.prettyPrint(), mermaid.run()
```

## State Machine

```mermaid
stateDiagram-v2
    [*] --> Synced: Construct
    Synced --> Unsynced: Input (data-saved=0)
    Unsynced --> PendingRender: viewer.init() (data-saved=1)
    PendingRender --> Unsynced: Input within the delay
    PendingRender --> Synced: Timer fires and renders
```

***

©️ 2024 [邱敬幃 Pardn Chiu](https://www.linkedin.com/in/pardnchiu)
