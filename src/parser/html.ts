import { PARSE_OPTIONS } from "./index";
import { LeadingWhitespace, StripIndent } from "./list";
import { CODE_TYPES, REGEX_HTML_EVENT, REGEX_HTML_SCRIPT, REGEX_HTML_URL, REGEX_MD_BR, REGEX_MD_SCHEME_SELF, REGEX_MD_VIDEO_MOV, REGEX_VIMEO, REGEX_YOUTUBE } from "./regex";
import { AST } from "./types";
import type { BlockNode, InlineNode, ListItem, TableRow } from "./types";

// * split to 2 fn, Parse().json() => record<>, Parse().hmtl() => string
AST.prototype.html = function (this: AST): string {
  return this.map(render).join("");
};

AST.prototype.json = function (this: AST): BlockNode[] {
  return JSON.parse(JSON.stringify(this));
};

function render(node: BlockNode): string {
  switch (node.type) {
    case "text":
      return `<span class="md-line">${renderInlines(node.children)}</span>`;
    case "hr":
      return "<hr>";
    case "break":
      return "<br>";
    case "heading":
      if (PARSE_OPTIONS.parseHeading) {
        return `<h${node.level} class="md-h${node.level}">${renderInlines(node.children)}</h${node.level}>`;
      }
      return `<span class="md-h${node.level}">${renderInlines(node.children)}</span>`;
    case "blockquote":
      return renderBlockquote(node);
    case "codeBlock":
      return renderCodeBlock(node.value, node.lang ?? "");
    case "html":
      return node.value.replace(REGEX_HTML_SCRIPT, "").replace(REGEX_HTML_EVENT, "").replace(REGEX_HTML_URL, "").replace(REGEX_MD_BR, `<br class="md-br">`);
    case "table":
      return renderTable(node);
    case "list":
      return renderList(node);
    case "footnotes":
      return renderFootnote(node);
    default:
      return "";
  }
}

function renderInlines(nodes: InlineNode[]): string {
  return nodes.map(renderInline).join("");
}

function renderBlockquote(node: Extract<BlockNode, { type: "blockquote" }>): string {
  const children = node.children.map(render).join("\n");
  if (!node.tag) {
    return `<blockquote class="md-quote">${children}</blockquote>`;
  }
  const title = node.tag[0].toUpperCase() + node.tag.slice(1);
  return `<blockquote class="md-quote md-alert md-alert-${node.tag}"><span class="md-alert-title">${title}</span>${children}</blockquote>`;
}

function renderCodeBlock(value: string, lang: string): string {
  const code = codeBlockHTML(value, lang);
  if (lang === "mermaid") {
    return `<div class="md-mermaid"><pre class="mermaid">${escapeHTML(value)}</pre>${code}</div>`;
  }
  if (lang === "math") {
    return `<div class="md-latex"><div class="md-math">${escapeHTML(value)}</div>${code}</div>`;
  }
  if (lang === "chartjs") {
    let config: unknown;
    try {
      config = JSON.parse(value);
    } catch {
      return code;
    }
    const isRecord = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v);
    if (!isRecord(config) || typeof config.type !== "string" || !isRecord(config.data)) {
      return code;
    }
    const chart = escapeAttr(JSON.stringify({ type: config.type, data: config.data }));
    return `<div class="md-chart"><canvas data-chart="${chart}"></canvas>${code}</div>`;
  }
  return code;
}

function codeBlockHTML(value: string, lang: string): string {
  const rows = value.split("\n");
  const indent = Math.floor(LeadingWhitespace(rows[0]).width / PARSE_OPTIONS.indent) * PARSE_OPTIONS.indent;
  const items = rows.map((row) => `<li>${escapeHTML(StripIndent(row, indent))}</li>`).join("");
  const name = lang ? ` name="${escapeAttr(lang)}"` : "";
  const langClass = CODE_TYPES.includes(lang) ? ` class="language-${lang}"` : "";
  return `<pre class="prettyprint"${name}><code${langClass}${name}><ol>${items}</ol></code><button class="copy"></button></pre>`;
}

function renderTable(node: Extract<BlockNode, { type: "table" }>): string {
  const [head, ...rows] = node.children;
  const renderRow = (row: TableRow): string => {
    const tag = row.header ? "th" : "td";
    const cells = row.children.map((cell, k) => {
      const align = node.align[k];
      return `<${tag}${align ? ` style="text-align:${align}"` : ""}>${renderInlines(cell.children)}</${tag}>`;
    });
    return `<tr>${cells.join("")}</tr>`;
  };
  return `<div class="md-table-wrap"><table class="md-table"><thead>${renderRow(head)}</thead><tbody>${rows.map(renderRow).join("")}</tbody></table></div>`;
}

function renderList(node: Extract<BlockNode, { type: "list" }>): string {
  const tag = node.ordered ? "ol" : "ul";
  return `<${tag} class="md-list">${node.children.map(renderListItem).join("")}</${tag}>`;
}

function renderListItem(item: ListItem): string {
  const children = item.children.map(render).join("\n");
  if (item.checked === undefined) {
    return `<li>${children}</li>`;
  }
  return `<li class="md-task"><input type="checkbox" disabled${item.checked ? " checked" : ""}>${children}</li>`;
}

function renderFootnote(node: Extract<BlockNode, { type: "footnotes" }>): string {
  const items = node.children.map((footnote) => `<li id="md-fn-${footnote.index}">${footnote.children.map(render).join("\n")}</li>`);
  return `<section class="md-footnotes"><ol>${items.join("")}</ol></section>`;
}

function renderInline(node: InlineNode): string {
  switch (node.type) {
    case "text":
      return escapeHTML(node.value);
    case "code":
      return `<code>${escapeHTML(node.value)}</code>`;
    case "math":
      return `<span class="md-math-inline">${escapeHTML(node.value)}</span>`;
    case "b":
      return `<span class="md-bold">${renderInlines(node.children)}</span>`;
    case "em":
    case "del":
    case "mark":
    case "sub":
    case "sup":
      return `<${node.type}>${renderInlines(node.children)}</${node.type}>`;
    case "br":
      return `<br class="md-br">`;
    case "footnoteRef":
      return `<sup class="md-footnote-ref"><a href="#md-fn-${node.index}">${node.index}</a></sup>`;
    case "link":
      return renderLink(node);
    default:
      return "";
  }
}

function renderLink(node: Extract<InlineNode, { type: "link" }>): string {
  const children = renderInlines(node.children);
  if (node.tag === "file") {
    if (!PARSE_OPTIONS.fileEndpoint) {
      return children;
    }
    return `<a class="md-link md-file-link" data-path="${escapeAttr(node.href)}">${children}</a>`;
  }
  if (node.tag === "hashtag") {
    if (!PARSE_OPTIONS.hashtagEndpoint) {
      return children;
    }
    const href = PARSE_OPTIONS.hashtagEndpoint.replaceAll("{tag}", encodeURIComponent(node.href));
    return `<a href="${escapeAttr(href)}" target="_blank" rel="noopener" class="md-link md-hashtag">${children}</a>`;
  }
  const title = node.title ? ` title="${escapeAttr(node.title)}"` : "";
  if (node.tag === "image" || node.tag === "video") {
    const style = [node.width && `width:${node.width}`, node.height && `height:${node.height}`].filter(Boolean);
    const styleAttr = style.length ? ` style="${escapeAttr(style.join(";"))}"` : "";
    if (node.tag === "video") {
      const type = REGEX_MD_VIDEO_MOV.test(node.href) ? "video/quicktime" : "video/mp4";
      return `<video class="md-img" controls${title}${styleAttr}><source src="${escapeAttr(node.href)}" type="${type}"></video>`;
    }
    const alt = node.children.map((child) => ("value" in child ? child.value : "")).join("");
    return `<img class="md-img" src="${escapeAttr(node.href)}" alt="${escapeAttr(alt)}"${title}${styleAttr}>`;
  }
  const target = REGEX_MD_SCHEME_SELF.test(node.href) ? "" : ` target="_blank" rel="noopener"`;
  const link = `<a href="${escapeAttr(node.href)}"${title}${target} class="md-link">${children}</a>`;
  if (node.tag === "youtube") {
    return `${link}<iframe class="md-embed" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="https://www.youtube.com/embed/${node.href.match(REGEX_YOUTUBE)![1]}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }
  if (node.tag === "vimeo") {
    return `${link}<iframe class="md-embed" loading="lazy" src="https://player.vimeo.com/video/${node.href.match(REGEX_VIMEO)![1]}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
  }
  return link;
}

function escapeHTML(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function escapeAttr(text: string): string {
  return escapeHTML(text).replace(/"/g, "&quot;");
}
