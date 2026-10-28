# NanoMD Chrome Extension Privacy Policy

Effective date: 2026-10-21

This policy covers the NanoMD extension for Chrome (Chrome Web Store ID `pdklinlfmpobpakengplkhbbneaamijd`), published by Pardn Chiu.

## Summary

NanoMD renders local Markdown files inside the browser. It does not collect, store, sell or transmit any personal or user data.

## Data the Extension Accesses

| Data | Purpose | Leaves the device |
|---|---|---|
| Content of local `.md` / `.markdown` files opened through `file://` | Rendered to HTML on the page | No |
| File you choose in the save dialog after pressing `Cmd/Ctrl + S` | Written back with the edited content | No |

The extension runs only on `file:///*.md` and `file:///*.markdown` pages. It has no background service, requests no extension permissions, and uses no cookies, `localStorage`, `chrome.storage`, analytics or tracking.

## Network Requests

Mermaid, KaTeX, Chart.js and code-prettify are bundled inside the extension and load from the extension package, not from a server.

The extension sends no requests on its own. When a Markdown file you open contains remote images, videos or YouTube / Vimeo embeds, the browser loads those resources from the addresses written in that file, the same as any web page; those services are governed by their own privacy policies.

## Data Sharing

No data is shared with, sold to, or transferred to third parties. No data is used for advertising, creditworthiness or any purpose unrelated to rendering the file you open.

## Changes

Updates to this policy are published on this page with a new effective date.

## Contact

Questions about this policy: open an issue at [github.com/pardnchiu/NanoMD](https://github.com/pardnchiu/NanoMD/issues) or email [dev@pardn.io](mailto:dev@pardn.io).
