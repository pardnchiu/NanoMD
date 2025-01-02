## Deprecated (Will be removed in version 2.0.0)

- UMD version `PDMarkdownEditor`: replaced by `MDEditor`
- UMD version `PDMarkdownViewer`: replaced by `MDViewer`
- ES Module version `editor`: replaced by `MDEditor`
- ES Module version `viewer`: replaced by `MDViewer`

### parameters

- MDEditor
    - `mode`: replaced by `style.mode`
    - `fillMode`: replaced by `style.fill`
    - `fontFamily`: replaced by `style.fontFamily`
    - `showRow`: replaced by `style.showRow`
    - `focusBackgroundColor`: replaced by `focus.backgroundColor`
    - `focusTextColor`: replaced by `focus.color`
    - `placeholder`: replaced by `placeholder.text`
    - `placeholderColor`: replaced by `placeholder.color`
- MDViewer
    - `mode`: replaced by `style.mode`
    - `fillMode`: replaced by `style.fill`
    - `fontFamily`: replaced by `style.fontFamily`
    - `delay`: replaced by `sync.delay`
    - `scrollSync`: replaced by `sync.scroll`
    - `tagPath`: replaced by `hashtag.path`
    - `tagTarget`: replaced by `hashtag.target`

### function

- MDEditor
    - `goForward()`: replaced by `redo()`
    - `goBack()`: replaced by `undo()`
    - `addHeading(event)`: replaced by `heading(event)`
    - `addBold(event)`: replaced by `bold(event)`
    - `addItalic(event)`: replaced by `italic(event)`
    - `addStrikethrough()`: replaced by `strikethrough()`
    - `addUnderline(event)`: replaced by `underline(event)`
    - `addMarker(event)`: replaced by `marker(event)`
    - `addSup(event)`: replaced by `sup(event)`
    - `addSub(event)`: replaced by `sub(event)`
    - `addCode(event)`: replaced by `code(event)`
    - `addBlockquote()`: replaced by `blockquote()`
    - `addUl()`: replaced by `ul()`
    - `addOl()`: replaced by `ol()`
    - `addLink()`: replaced by `link()`
    - `addImage()`: replaced by `image()`
    - `downloadMd()`: replaced by  `download('MD')`
    - `downloadHtml()`: replaced by  `download('HMTL')`
    - `getTxt()`: replaced by `text`