## 即將棄用（將在 2.0.0 版本中移除）

- UMD 版本 `PDMarkdownEditor`: 以 `MDEditor` 取代
- UMD 本 `PDMarkdownViewer`: 以 `MDViewer` 取代
- ES Module 版本 `editor`: 以 `MDEditor` 取代
- ES Module 版本 `viewer`: 以 `MDViewer` 取代

###  參數

- MDEditor
    - `mode`: 以 `style.mode` 取代
    - `fillMode`: 以 `style.fill` 取代
    - `fontFamily`: 以 `style.fontFamily` 取代
    - `showRow`: 以 `style.showRow` 取代
    - `focusBackgroundColor`: 以 `focus.backgroundColor` 取代
    - `focusTextColor`: 以 `focus.color` 取代
    - `placeholder`: 以 `placeholder.text` 取代
    - `placeholderColor`: 以 `placeholder.color` 取代
- MDViewer
    - `mode`: 以 `style.mode` 取代
    - `fillMode`: 以 `style.fill` 取代
    - `fontFamily`: 以 `style.fontFamily` 取代
    - `delay`: 以 `sync.delay` 取代
    - `scrollSync`: 以 `sync.scroll` 取代
    - `tagPath`: 以 `hashtag.path` 取代
    - `tagTarget`: 以 `hashtag.target` 取代

### 函式

- MDEditor
    - `goForward()`: 以 `redo()` 取代
    - `goBack()`: 以 `undo()` 取代
    - `addHeading(event)`: 以 `heading(event)` 取代
    - `addBold(event)`: 以 `bold(event)` 取代
    - `addItalic(event)`: 以 `italic(event)` 取代
    - `addStrikethrough()`: 以 `strikethrough()` 取代
    - `addUnderline(event)`: 以 `underline(event)` 取代
    - `addMarker(event)`: 以 `marker(event)` 取代
    - `addSup(event)`: 以 `sup(event)` 取代
    - `addSub(event)`: 以 `sub(event)` 取代
    - `addCode(event)`: 以 `code(event)` 取代
    - `addBlockquote()`: 以 `blockquote()` 取代
    - `addUl()`: 以 `ul()` 取代
    - `addOl()`: 以 `ol()` 取代
    - `addLink()`: 以 `link()` 取代
    - `addImage()`: 以 `image()` 取代
    - `downloadMd()`: 以  `download('MD')` 取代
    - `downloadHtml()`: 以  `download('HMTL')` 取代
    - `getTxt()`: 以 `text` 取代
