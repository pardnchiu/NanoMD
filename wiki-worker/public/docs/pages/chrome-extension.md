# NanoMD Chrome Extension

The [NanoMD extension](https://chromewebstore.google.com/detail/nanomd/pdklinlfmpobpakengplkhbbneaamijd) is a Markdown viewer for Chrome that renders local Markdown files with the same parser this site documents. Open a `.md` file and get an editor and a live Markdown preview side by side, with no code and no server.

<a href="https://chromewebstore.google.com/detail/nanomd/pdklinlfmpobpakengplkhbbneaamijd"><img src="/static/image/chrome_web_store.svg" alt="Available in the Chrome Web Store" height="48"></a>

## Install

1. Install NanoMD from the [Chrome Web Store](https://chromewebstore.google.com/detail/nanomd/pdklinlfmpobpakengplkhbbneaamijd).
2. Turn on file access (below).
3. Drag a `.md` or `.markdown` file into Chrome, or open its `file://` path.

## Turn On File Access

> [!IMPORTANT]
> Chrome keeps extensions off `file://` pages by default. Until **Allow access to file URLs** is on, NanoMD never runs and the file stays plain text.

1. Open `chrome://extensions`.
2. Click **Details** on NanoMD.
3. Turn on **Allow access to file URLs**.

Reload any Markdown tab that was already open.

## Editing and Preview

| Area | Behavior |
|---|---|
| Left | Source editor holding the file content |
| Right | Preview rendered with `MDParser.Parse().html()`; re-renders 200 ms after typing stops |
| Bottom | Footer linking to the NanoMD repository |

Every syntax on this site works in the preview, including [Mermaid, math and Chart.js blocks](/syntax-code). Mermaid, KaTeX, Chart.js and code-prettify are bundled in the extension and load from its package, so diagrams and formulas render offline.

## Saving

| Action | Result |
|---|---|
| Typing in the editor | `●` appears in front of the tab title |
| First `Cmd/Ctrl + S` | A save dialog suggests the current file name; the chosen file is written and `●` clears |
| Later `Cmd/Ctrl + S` in the same tab | Overwrites the same file without asking |
| Cancel the dialog | Nothing is written; the edits stay in the editor |

Chrome cannot write back to a `file://` page directly, so the first save always asks for the target; pick the original file to overwrite it. Closing or reloading the tab discards unsaved edits.

## Scope

- Runs only on `file:///*.md` and `file:///*.markdown`; Markdown served from a website is left as is.
- Requests no extension permissions and sends no requests of its own. Remote images, videos and YouTube / Vimeo embeds written in the file load like on any web page.

See the [privacy policy](/chrome-extension-privacy) for the full data handling.
