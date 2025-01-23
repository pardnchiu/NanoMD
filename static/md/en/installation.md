> Starting from version `1.8.0`, `PDMarkdownKit` has been renamed to `NanoMD`<br>
> The functionality remains the same, but with a more concise and memorable name.

## Installation

- Install via npm
    ```bash
    npm i @pardnchiu/nanomd
    ```

- Include via CDN
    - **UMD version**
        ```html
        <!-- Version 1.8.0 and above -->
        <script src="https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@[VERSION]/dist/NanoMD.js"></script>

        <!-- Version 1.6.0-1.7.1 -->
        <script src="https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.js"></script>
        ```
    - **ES Module version**
        ```javascript
        // Version 1.8.0 and above
        import { MDEditor, MDViewer, MDParser } from "https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@[VERSION]/dist/NanoMD.esm.js";

        // Version 1.6.0-1.7.1
        import { editor, viewer } from "https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.module.js";
        
        // Version 1.5.2 and below
        import { editor, viewer } from "https://cdn.jsdelivr.net/npm/pdmarkdownkit@[VERSION]/dist/PDMarkdownKit.js";
        ```

## Usage

- **Initialize `editor` and `viewer`**
    ```Javascript
    // Version 1.8.0 and above
    // Unified: MDEditor, MDViewer

    // Version 1.7.1 and below
    // IIFE: PDMarkdownEditor, PDMarkdownViewer
    // ESM: editor, viewer

   const domEditor = new MDEditor({
        id: "",                                 // Specify the target element to replace
        defaultContent: "",                     // Initial content to display
        hotKey: 1,                              // Enable keyboard shortcuts, default: 1 (enabled)
        preventRefresh: 0,                      // Prevent page refresh, default: 0 (disabled)
        tabPin: 0,                              // Pin Tab, default: 0 (disabled)
        wrap: 1,                                // Enable word wrapping, default: 1 (enabled)
        autosave: 1,                            // Auto-save feature, default: 1 (enabled)
        event: {
            save: result => {                   // Custom save event
                console.log(result);            // Output current Markdown content
            },
            upload: async result => {
                /**
                 * Custom Image Upload Function
                *
                * Purpose:
                * - This function allows developers to define custom image upload logic.
                * - After the upload is completed, it returns an object containing the image URL and alt text, 
                *   which is then used to insert the image into the editor.
                *
                * Usage:
                * - This function is invoked by the editor when an image needs to be uploaded.
                * - Developers can implement custom upload logic (e.g., using an API to upload the image to a server).
                *
                * Return Value:
                * - The function must return an object with the following fields:
                *   - `href`: The URL of the image to be inserted into the editor.
                *   - `alt`: The alternative text for the image (used when the image cannot be loaded).
                *
                * Example:
                * - The current implementation simulates a 1-second delay and returns an empty `href` and `alt`.
                * - You can replace this logic with actual upload functionality (e.g., using fetch or axios to send an HTTP request).
                */
                const link = await new Promise(resolve => {
                    setTimeout(() => resolve({
                        href: "",  // The image URL (replace with the actual upload response link)
                        alt: ""    // The alternative text for the image (replace with a description provided during upload)
                    }), 1000);  // Simulating a 1-second delay
                });
                return link;
            }
        },
        style: {
            mode: "",                           // Theme mode: auto | light | dark, default: auto
            fill: 1,                            // Adjust size based on parent element, default: 1 (enabled)
            fontFamily: "",                     // Font settings, default: 'Noto Sans TC', sans-serif
            placeholder: {
                text: "Content",                // Placeholder text, default: "Type here..."
                color: "#ff000080"              // Placeholder color, default: #0000ff1a
            },
            focus: {
                backgroundColor: "#ff00001a",   // Focus background color, default: #0000ffff
                color: "#ff0000"                // Focus text color, default: #bfbfbf
            }
        }
    });

    const domViewer = new MDViewer({
        id: "",                 // Default: PDMDViewer
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

    // Version 1.10.0 and above
    const domParser = new MDParser({
        standard: 1             // Support only standard syntax, default: 1 | true
    });

    console.log(domParser.parse("**Text to parse**"));
    ```
