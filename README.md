<img src="https://nanomd.pardn.io/static/image/logo.png" width=80>

# NanoMD: Lightweight Markdown Editor

> [!NOTE]
> (Formerly known as PDMarkdownKit, renamed to NanoMD starting from version `1.8.0`)

> A modern Markdown editor built with pure JavaScript, focusing on performance and user experience. Leveraging virtual DOM technology to provide smooth real-time preview and editing experience.

![tag](https://img.shields.io/badge/tag-JavaScript%20Library-bb4444) 
![size](https://img.shields.io/github/size/pardnchiu/NanoMD/dist%2FNanoMD.js)<br>
[![npm](https://img.shields.io/npm/v/@pardnchiu/nanomd)](https://www.npmjs.com/package/@pardnchiu/nanomd)
[![download](https://img.shields.io/npm/dm/@pardnchiu/nanomd)](https://www.npmjs.com/package/@pardnchiu/nanomd)
[![jsdeliver](https://img.shields.io/jsdelivr/npm/hm/@pardnchiu/nanomd)](https://www.jsdelivr.com/package/npm/@pardnchiu/nanomd)<br>
[![](https://img.shields.io/badge/查閱-中文版本-ffffff)](https://github.com/pardnchiu/NanoMD/blob/main/README.zh.md)

## Features

### High-Performance Editing
- Smart virtual DOM updates for optimal performance
- Real-time split-screen preview with WYSIWYG experience
- Intelligent scroll synchronization
- Optimized for large documents with zero lag

### Advanced Markdown Support
- Complete standard syntax support
- Extended features:
    - Code formatting and syntax highlighting
    - Real-time math formula rendering
    - Automatic table formatting
    - Checkable task lists
    - Quick block quotes

### Media Integration
- Automatic YouTube and Vimeo video embedding with previews
- Smart image handling:
    - Automatic thumbnail generation
    - Flexible size control
    - Multiple alignment options
- Responsive media support

### Technical Advantages
- Pure JavaScript implementation, no external dependencies
- Efficient virtual DOM implementation
- Modular architecture design
- Complete ES Module support

## Documentation

- Website: [nanomd.pardn.io](https://nanomd.pardn.io)
- Documentation: [nanomd.pardn.io/doc.html](https://nanomd.pardn.io/doc.html)
- Demo: [nanomd.pardn.io/live.html](https://nanomd.pardn.io/live.html)

## Installation

### Install via npm
```bash
npm i @pardnchiu/nanomd
```

### Include via CDN

#### Include the `NanoMD` library
```html
<!-- Version 1.8.0 and above -->
<script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@[VERSION]/dist/NanoMD.js"></script>

<!-- Version 1.6.0-1.7.1 -->
<script src="https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.js"></script>
```

#### Module version
```javascript
// Version 1.8.0 and above
import { MDEditor, MDViewer } from "https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@[VERSION]/dist/NanoMD.esm.js";

// Version 1.6.0-1.7.1
import { editor, viewer } from "https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.module.js";

// Version 1.5.2 and below
import { editor, viewer } from "https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.js";
```

## How to use

### Initialize `editor` and `viewer`
```Javascript
// Version 1.8.0 and above
// Unified: MDEditor, MDViewer

// Version 1.7.1 and below
// IIFE: PDMarkdownEditor, PDMarkdownViewer
// ESM: editor, viewer

const domEditor = new MDEditor({
    id: "",                                 // Element to replace
    defaultContent: "",                     // Default content to display initially
    hotKey: 1,                              // Enable hotkeys, default: 1
    preventRefresh: 0,                      // Prevent page refresh, default: 0
    tabPin: 0,                              // 1 | 0 | true | false
    wrap: 1,                                // 1 | 0 | true | false
    style: {
        mode: "",                           // auto | light | dark, default: auto
        fill: 1,                            // Adjust size to parent element, default: 1
        fontFamily: "",                     // Default: 'Noto Sans TC', sans-serif
        showRow: 0,                         // Show line numbers, default: 1
        placeholder: {
            text: "Content",                // Default: Type here ...
            color: "#ff000080"              // Default: #0000ff1a
        },
        focus: {
            backgroundColor: "#ff00001a",   // Default: #0000ffff
            color: "#ff0000"                // Default: #bfbfbf
        }
    }
});

const domViewer = new MDViewer({
    id: "",                 // Element to replace
    emptyContent: "",       // Default content when editor is empty
    style: {
        mode: "",           // auto | light | dark, default: auto
        fill: "",           // Adjust size to parent element, default: 1 | true
        fontFamily: "",     // Default: 'Noto Sans TC', sans-serif
    },
    sync: {
        editor: domEditor,  // Associated editor
        delay: 50,          // Update delay in ms, default: 300
        scrollSync: 1,      // Synchronize scrolling with editor, default: 0 | false
    },
    hashtag: {
        path: "?keyword=",  // Path for hashtags, converting # to links
        target: "_blank"    // Target for hashtag links, default: _blank
    }
});

// If no element is specified, the player must be manually added to the DOM
(...).appendChild(domEditor.body);
(...).appendChild(domViewer.body);

``` 

## License

Similar to MIT License but provides obfuscated code only:
- Same as MIT: Free to use, modify and redistribute, including commercial use 
- Main difference: Provides obfuscated code by default, source code available for purchase
- License terms: Must retain original copyright notice (same as MIT)

For detailed terms and conditions, please see the [Software Usage Agreement](https://github.com/pardnchiu/NanoMD/blob/main/LICENSE).


## Creator

<img src="https://avatars.githubusercontent.com/u/25631760" align="left" width="96" height="96" style="margin-right: 0.5rem;">

<h4 style="padding-top: 0">邱敬幃 Pardn Chiu</h4>

<a href="mailto:dev@pardn.io" target="_blank">
    <img src="https://pardn.io/image/email.svg" width="48" height="48">
</a> <a href="https://linkedin.com/in/pardnchiu" target="_blank">
    <img src="https://pardn.io/image/linkedin.svg" width="48" height="48">
</a>

***

©️ 2023 [邱敬幃 Pardn Chiu](https://pardn.io)

