const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const { Parse } = require("@pardnchiu/nanomd");

const TEMPLATE_VERSION = "7.2.0"; // wiki-generate template version; see scripts/templates/CHANGELOG.md

// === Site config — filled in by wiki-generate when this template is copied into a project ===
const SITE_NAME = "pardnchiu/NanoMD";
const DOMAIN = "https://nanomd.pardn.io";
const REPO = "pardnchiu/NanoMD"; // owner/repo
const AUTHOR_NAME = "邱敬幃 Pardn Chiu";
const AUTHOR_URL = "https://pardn.io/";
const AUTHOR_HANDLE = "pardnchiu";
const GTAG_ID = ""; // empty string disables analytics

const DEMO_SCRIPT = "https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@{version}/dist/parser.js".replace("{version}", () => require("../package.json").version);
const DEMO_SCRIPT_ATTRS = {
};
const DEMO_LOG_IGNORE = [
];
const ZH_LANG = "zh-Hant-TW";

const SEO_PATH = path.join(__dirname, "seo.json");
let SEO = null;
if (fs.existsSync(SEO_PATH)) {
  try {
    SEO = JSON.parse(fs.readFileSync(SEO_PATH, "utf-8"));
  } catch (e) {
    console.error(`[Invalid] seo.json: ${e.message}`);
    process.exit(1);
  }
} else {
  console.warn("[Not found] seo.json: run /seo-optimize; building content-only pages without meta, JSON-LD, sitemap, robots.txt or llms.txt");
}
const HAS_SEO = SEO !== null;
const S = SEO || {};
const PERSON_ID = S.person?.id || "";
const PERSON_NAME = S.person?.name || AUTHOR_NAME;
const PERSON_ALT_NAMES = S.person?.alt_names || [];
const SAME_AS = S.person?.same_as || [];
const ORG_NAME = S.organization?.name || "";
const ORG_NAME_ZH = S.organization?.name_zh || "";
const ORG_SAME_AS = S.organization?.same_as || [];
const ORG_ID = S.organization?.id || "";
const ORG_URL = S.organization?.url || "";
const TAGLINE = S.tagline || "";
const OG_IMAGE = S.og_image || "";
const FAVICON = S.favicon || "";
const HOME_TITLE = S.home_title?.en || REPO;
const HOME_TITLE_ZH = S.home_title?.zh || REPO;
const PROGRAMMING_LANGUAGE = S.programming_language || "";
const LICENSE_URL = S.license_url || "";
const AI_TRAIN = S.ai_usage?.train || "";
const AI_INPUT = S.ai_usage?.input || "";
const AI_SEARCH = S.ai_usage?.search || "";
const X_DEFAULT = S.x_default || "";
const BRAND_KEYWORDS = S.brand_keywords || [];
const DESCRIPTIONS = S.descriptions?.en || {};
const DESCRIPTIONS_ZH = S.descriptions?.zh || {};
const KEYWORDS = S.keywords?.en || {};
const KEYWORDS_ZH = S.keywords?.zh || {};

const NANOMD_DIR = path.join(__dirname, "nanomd");
for (const f of ["version.json", "parser.css"]) {
  if (!fs.existsSync(path.join(NANOMD_DIR, f))) {
    console.error(`[Not found] nanomd/${f}: run node sync-nanomd.js`);
    process.exit(1);
  }
}
const NANOMD_VERSION = JSON.parse(fs.readFileSync(path.join(NANOMD_DIR, "version.json"), "utf-8")).version;
const NANOMD_CSS = fs.readFileSync(path.join(NANOMD_DIR, "parser.css"), "utf-8").trim();
const NANOMD_INSTALLED = JSON.parse(fs.readFileSync(path.join(path.dirname(require.resolve("@pardnchiu/nanomd")), "../package.json"), "utf-8")).version;
if (NANOMD_INSTALLED !== NANOMD_VERSION) {
  console.error(`[Conflict] @pardnchiu/nanomd: installed ${NANOMD_INSTALLED}, nanomd/version.json ${NANOMD_VERSION}; run node sync-nanomd.js ${NANOMD_VERSION}`);
  process.exit(1);
}
const NANOMD_SCRIPT = `https://cdn.jsdelivr.net/npm/@pardnchiu/nanomd@${NANOMD_VERSION}/dist/parser.js`;

const PAGES_DIR = path.join(__dirname, "public/docs/pages");
const OUT_DIR = path.join(__dirname, "public");
const ZH_DIR = path.join(__dirname, "public/zh");
const TAGS_DIR = path.join(__dirname, "public/docs/tags"); // release notes synced by sync-tags.js
const RELEASED_DIR = path.join(OUT_DIR, "released");
const SYMBOLS_PATH = path.join(__dirname, "public/docs/symbols.json");
const DATES_PATH = path.join(__dirname, "public/docs/dates.json");
const REDIRECTS_PATH = path.join(__dirname, "redirects.json");
const REMOVED_PATH = path.join(__dirname, "removed.json");

// newest first; missing parts count as 0 so "v1.2" sorts against "v1.2.0"
function semverSort(a, b) {
  const pa = a.replace(/^v/, "").split(".").map(Number);
  const pb = b.replace(/^v/, "").split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pb[i] || 0) - (pa[i] || 0);
  }
  return 0;
}

function loadTags() {
  if (!fs.existsSync(TAGS_DIR)) return { tags: [], dates: {} };
  const tags = fs.readdirSync(TAGS_DIR)
    .filter(f => f.endsWith(".md"))
    .map(f => f.replace(/\.md$/, ""))
    .sort(semverSort);
  const manifestPath = path.join(TAGS_DIR, "manifest.json");
  const dates = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, "utf-8")) : {};
  return { tags, dates };
}

// group tags by minor version: v0.28.3 -> "v0.28"
function groupByMinor(tags) {
  const groups = new Map();
  for (const t of tags) {
    const p = t.replace(/^v/, "").split(".");
    const key = `v${p[0]}.${p[1]}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  }
  return groups;
}

const { tags: TAGS, dates: TAG_DATES } = loadTags();

function localDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const BUILD_DATE = localDate(new Date());
const DATES = fs.existsSync(DATES_PATH) ? JSON.parse(fs.readFileSync(DATES_PATH, "utf-8")) : {};
function stampDates(key, md) {
  const hash = crypto.createHash("sha256").update(md).digest("hex");
  const prev = DATES[key];
  if (!prev) DATES[key] = { hash, published: BUILD_DATE, modified: BUILD_DATE };
  else if (prev.hash !== hash) DATES[key] = { ...prev, hash, modified: BUILD_DATE };
  return DATES[key];
}
const LATEST_VERSION = TAGS[0] || "";

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (e) {
    console.error(`[Invalid] ${path.basename(file)}: ${e.message}`);
    process.exit(1);
  }
}
const REDIRECTS = readJson(REDIRECTS_PATH, {});
const REMOVED = new Set(readJson(REMOVED_PATH, []));

// === Page navigation — filled in by wiki-generate from the derived page set ===
// { section: "Section Label", items: [{ slug: "getting-started", label: "Getting Started" }] }
const NAV = [
  { section: "Overview", items: [{ slug: "home", label: "Home" }, { slug: "getting-started", label: "Getting Started" }, { slug: "v1-deprecated", label: "v1 Deprecation" }, { slug: "vs-marked", label: "Markdown to HTML: NanoMD vs marked" }] },
  { section: "Concepts", items: [{ slug: "architecture", label: "Architecture" }, { slug: "parsing-pipeline", label: "Parsing Pipeline" }, { slug: "ast", label: "AST Nodes" }] },
  { section: "Syntax", items: [{ slug: "syntax-blocks", label: "Blocks" }, { slug: "syntax-inline", label: "Inline Formatting" }, { slug: "syntax-code", label: "Code and Diagrams" }, { slug: "syntax-links-media", label: "Links and Media" }, { slug: "syntax-lists-tables", label: "Lists and Tables" }, { slug: "syntax-footnotes", label: "Footnotes" }] },
  { section: "Rendering", items: [{ slug: "html-output", label: "HTML Output" }, { slug: "runtime-dependencies", label: "Dependencies and Refresh" }, { slug: "file-links", label: "File Links" }, { slug: "hashtag-links", label: "Hashtag Links" }, { slug: "theming", label: "Theming" }, { slug: "security", label: "Security" }] },
  { section: "Reference", items: [{ slug: "parser-api", label: "API Reference" }] },
  { section: "Chrome Extension", items: [{ slug: "chrome-extension", label: "Markdown Viewer for Chrome" }, { slug: "chrome-extension-privacy", label: "Privacy Policy" }] },
];

// English section label -> Traditional Chinese section label
const NAV_ZH_SECTION = {
  "Overview": "概覽",
  "Concepts": "概念",
  "Syntax": "語法",
  "Rendering": "渲染",
  "Reference": "參考",
  "Chrome Extension": "Chrome 擴充功能",
};

// slug -> Traditional Chinese nav label
const NAV_ZH_LABEL = {
  "home": "首頁",
  "getting-started": "快速開始",
  "v1-deprecated": "v1 停用說明",
  "vs-marked": "Markdown 輸出比較：NanoMD 與 marked",
  "architecture": "架構",
  "parsing-pipeline": "解析流程",
  "ast": "AST 節點",
  "syntax-blocks": "區塊語法",
  "syntax-inline": "行內格式",
  "syntax-code": "程式碼與圖表",
  "syntax-links-media": "連結與媒體",
  "syntax-lists-tables": "清單與表格",
  "syntax-footnotes": "註腳",
  "html-output": "HTML 輸出",
  "runtime-dependencies": "依賴與渲染",
  "file-links": "檔案連結",
  "hashtag-links": "Hashtag 連結",
  "theming": "樣式主題",
  "security": "安全性",
  "parser-api": "API 參考",
  "chrome-extension": "Chrome Markdown 擴充功能",
  "chrome-extension-privacy": "隱私權政策",
};

function slugify(text) {
  // keep CJK ranges so Chinese headings produce usable anchor ids (empty ids break the TOC)
  return text.toLowerCase()
    .replace(/[^\w\s一-鿿㐀-䶿豈-﫿-]/g, "")
    .replace(/\s+/g, "-").replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildSidebar(activeSlug, lang = "en") {
  const isZh = lang === "zh";
  const base = isZh ? "/zh" : "";
  let html = "";
  for (const group of NAV) {
    const section = isZh ? (NAV_ZH_SECTION[group.section] || group.section) : group.section;
    html += `<div class="nav-divider"></div>\n`;
    html += `<div class="nav-section">${section}</div>\n`;
    for (const item of group.items) {
      const cls = item.slug === activeSlug ? " active" : "";
      const href = item.slug === "home" ? `${base}/` : `${base}/${item.slug}`;
      const label = isZh ? (NAV_ZH_LABEL[item.slug] || item.label) : item.label;
      html += `<a class="nav-item${cls}" href="${href}">${label}</a>\n`;
    }
  }
  if (TAGS.length) {
    html += `<div class="nav-divider"></div>\n`;
    html += `<a class="nav-item" href="/released/">${isZh ? "版本紀錄" : "Released"}</a>\n`;
  }
  return html.replace(/^<div class="nav-divider"><\/div>\n/, "");
}

// release pages are EN-only; sidebar lists every tag grouped by minor version
function buildVersionSidebar(activeTag, tags, dates) {
  let html = '<a class="nav-item" href="/">Documentation</a>\n';
  html += `<div class="nav-divider"></div>\n`;
  for (const [minor, versions] of groupByMinor(tags)) {
    html += `<div class="nav-section">${minor}</div>\n`;
    for (const v of versions) {
      const cls = v === activeTag ? " active" : "";
      const date = dates[v] ? `<span class="nav-date">${dates[v]}</span>` : "";
      html += `<a class="nav-item${cls}" href="/released/${v}">${v}${date}</a>\n`;
    }
  }
  return html;
}

function buildTOC(html, lang = "en") {
  const tocTitle = lang === "zh" ? "本頁內容" : "On this page";
  const headings = [];
  const regex = /<h([23])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h\1>/g;
  let m;
  while ((m = regex.exec(html)) !== null) {
    headings.push({ depth: parseInt(m[1]), id: m[2], text: m[3].replace(/<[^>]+>/g, "") });
  }
  if (!headings.length) return `<div class="toc-title">${tocTitle}</div>`;
  let toc = `<div class="toc-title">${tocTitle}</div>\n`;
  for (const h of headings) {
    const cls = h.depth === 3 ? " depth-3" : "";
    toc += `<a class="toc-link${cls}" href="#${h.id}">${h.text}</a>\n`;
  }
  return toc;
}

function addHeadingIds(html) {
  return html.replace(/<h([1-4])( class="[^"]*")?>(.*?)<\/h\1>/g, (match, level, cls = "", text) => {
    const id = slugify(text.replace(/<[^>]+>/g, ""));
    return `<h${level}${cls} id="${id}">${text}</h${level}>`;
  });
}

function renderMarkdown(md) {
  const ast = Parse(md);
  const html = ast.map((node, i) => {
    const block = ast.slice(i, i + 1).html();
    return node.type === "heading" ? block.replace(/^<span class="md-h(\d)">([\s\S]*)<\/span>$/, '<h$1 class="md-h$1">$2</h$1>') : block;
  }).join("");
  return html.replace(/(<a href="(?:#|\/(?!\/))[^"]*"[^>]*?) target="_blank" rel="noopener"/g, "$1");
}

function stripH1(raw) {
  const lines = raw.split("\n");
  let fence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(`{3,}|~{3,})/.test(lines[i])) fence = !fence;
    else if (!fence && /^# /.test(lines[i])) {
      lines.splice(i, 1);
      return lines.join("\n");
    }
  }
  return raw;
}

function renderDemos(html, lang = "en") {
  if (!DEMO_SCRIPT) return html;
  const label = lang === "zh" ? "即時預覽" : "Live preview";
  const pkg = DEMO_SCRIPT.match(/\/npm\/((?:@[^/]+\/)?[^/]+)/)?.[1] || "";
  return html.replace(/<pre class="prettyprint" name="demo"><code name="demo">([\s\S]*?)<\/code><button class="copy"><\/button><\/pre>/g,
    `<div class="demo"><pre class="prettyprint" name="html"><code class="language-html" name="html">$1</code><button class="copy"></button></pre><div class="demo-bar">${label}${pkg ? ` · ${pkg}` : ""}</div><iframe title="${label}"></iframe></div>`);
}

function ensureH1(html, text) {
  if (html.includes("<h1")) return html;
  return `<h1 class="md-h1" id="${slugify(text)}">${text}</h1>\n${html}`;
}

function markdownHref(slug, isZh) {
  if (slug === "released") return "/released/index.md";
  if (slug.startsWith("released/")) return `/${slug}.md`;
  const base = isZh ? "/zh" : "";
  return slug === "home" ? `${base}/index.md` : `${base}/${slug}.md`;
}

function profileLabel(url) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const known = { "github.com": "GitHub", "linkedin.com": "LinkedIn", "x.com": "X", "twitter.com": "X" };
  return known[host] || host;
}

const trimSlash = url => url.replace(/\/+$/, "");
const BYLINE_LINKS = SAME_AS
  .filter(u => trimSlash(u) !== trimSlash(AUTHOR_URL) && trimSlash(u) !== `https://github.com/${AUTHOR_HANDLE}`)
  .map(u => ` · <a href="${u}" target="_blank" rel="noopener">${profileLabel(u)}</a>`)
  .join("");

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function titleTooLong(title) {
  const cjk = (title.match(/[\u3000-\u303f\u3400-\u9fff\uf900-\ufaff\uff00-\uffef]/g) || []).length;
  return title.length + cjk > 60;
}

function renderPage(slug, title, description, keywords, sidebar, content, toc, lang = "en", dates = null) {
  const isZh = lang === "zh";
  const isReleased = slug === "released" || slug.startsWith("released/");
  const base = isZh ? `${DOMAIN}/zh` : DOMAIN;
  const canonical = slug === "home" ? `${base}/` : slug === "released" ? `${base}/released/` : `${base}/${slug}`;
  const keywordList = keywords.split(",").map(k => k.trim()).filter(Boolean);
  const fullKeywords = [...keywordList, ...BRAND_KEYWORDS.filter(k => !keywordList.includes(k))].join(", ");
  let fullTitle;
  if (slug === "home") {
    fullTitle = isZh ? HOME_TITLE_ZH : HOME_TITLE;
  } else {
    fullTitle = isZh
      ? `${title}｜${SITE_NAME} 文件`
      : `${title} - ${SITE_NAME} Docs`;
    if (titleTooLong(fullTitle)) {
      fullTitle = isZh ? `${title}｜${SITE_NAME}` : `${title} - ${SITE_NAME}`;
    }
  }

  // language toggle target (counterpart page); released has no zh copy → fall back to zh docs home
  let altHref;
  if (isZh) altHref = slug === "home" ? "/" : `/${slug}`;
  else if (isReleased) altHref = "/zh/";
  else altHref = slug === "home" ? "/zh/" : `/zh/${slug}`;

  const enUrl = slug === "home" ? `${DOMAIN}/` : `${DOMAIN}/${slug}`;
  const zhUrl = slug === "home" ? `${DOMAIN}/zh/` : `${DOMAIN}/zh/${slug}`;
  const altLinks = isReleased ? "" :
    `<link rel="alternate" hreflang="en" href="${enUrl}" />
    <link rel="alternate" hreflang="${ZH_LANG}" href="${zhUrl}" />
    ${X_DEFAULT ? `<link rel="alternate" hreflang="x-default" href="${X_DEFAULT === "zh" ? zhUrl : enUrl}" />
    ` : ""}`;

  const inLanguage = isZh ? ZH_LANG : "en";
  const person = {
    "@type": "Person",
    "@id": PERSON_ID,
    "name": PERSON_NAME,
    ...(PERSON_ALT_NAMES.length ? { "alternateName": PERSON_ALT_NAMES } : {}),
    "url": AUTHOR_URL,
    ...(SAME_AS.length ? { "sameAs": SAME_AS } : {}),
  };
  const orgName = isZh && ORG_NAME_ZH ? ORG_NAME_ZH : ORG_NAME;
  const orgAltName = orgName === ORG_NAME ? ORG_NAME_ZH : ORG_NAME;
  const org = ORG_NAME
    ? {
      "@type": "Organization",
      "@id": ORG_ID,
      "name": orgName,
      ...(orgAltName ? { "alternateName": orgAltName } : {}),
      "url": ORG_URL,
      "founder": { "@id": PERSON_ID },
      ...(ORG_SAME_AS.length ? { "sameAs": ORG_SAME_AS } : {}),
    }
    : null;
  const publisher = { "@id": org ? ORG_ID : PERSON_ID };
  const website = {
    "@type": "WebSite",
    "@id": `${DOMAIN}/#website`,
    "name": SITE_NAME,
    "url": `${DOMAIN}/`,
    "inLanguage": ["en", ZH_LANG],
    "publisher": publisher,
  };
  const nodeOf = dateProps => slug === "home"
    ? {
      "@type": "SoftwareSourceCode",
      "@id": `${canonical}#software`,
      "name": SITE_NAME,
      "description": description,
      "url": canonical,
      "inLanguage": inLanguage,
      "codeRepository": `https://github.com/${REPO}`,
      ...(PROGRAMMING_LANGUAGE ? { "programmingLanguage": PROGRAMMING_LANGUAGE } : {}),
      ...(LICENSE_URL ? { "license": LICENSE_URL } : {}),
      ...(LATEST_VERSION ? { "version": LATEST_VERSION } : {}),
      ...dateProps,
      "author": { "@id": PERSON_ID },
      "publisher": publisher,
    }
    : {
      "@type": "TechArticle",
      "headline": fullTitle,
      "description": description,
      "url": canonical,
      "inLanguage": inLanguage,
      "isPartOf": { "@id": website["@id"] },
      ...dateProps,
      "author": { "@id": PERSON_ID },
      "publisher": publisher,
    };
  const graphOf = dateProps => org ? [person, org, website, nodeOf(dateProps)] : [person, website, nodeOf(dateProps)];
  if (typeof dates === "function") dates = dates(JSON.stringify([fullTitle, description, fullKeywords, canonical, altLinks, graphOf({})]));
  const graph = graphOf(dates ? { "datePublished": dates.published, "dateModified": dates.modified } : {});
  const jsonLd = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });

  const orgSegment = ORG_NAME ? ` · ${orgName}` : "";
  const dateLabel = slug.startsWith("released/") ? "Released" : (isZh ? "最後更新" : "Last updated");
  const dateLine = dates ? `<p class="page-date">${dateLabel} <time datetime="${dates.modified}">${dates.modified}</time></p>` : "";
  const body = dateLine ? content.replace("</h1>", `</h1>\n${dateLine}`) : content;
  const taglineSegment = TAGLINE ? ` · ${TAGLINE}` : "";
  const handleLink = `<a href="https://github.com/${AUTHOR_HANDLE}" target="_blank" rel="noopener">${AUTHOR_HANDLE}</a>`;
  const agentLinks = !HAS_SEO || slug === "404" ? "" : ` · <a href="/llms.txt">llms.txt</a> · <a href="${markdownHref(slug, isZh)}" type="text/markdown">${isZh ? "本頁 Markdown" : "Markdown"}</a>`;
  const byline = isZh
    ? `<footer class="byline">${SITE_NAME} 由<a href="${AUTHOR_URL}" rel="author">${AUTHOR_NAME}</a>（${handleLink}）開發${orgSegment}${taglineSegment}${BYLINE_LINKS}${agentLinks}</footer>`
    : `<footer class="byline">${SITE_NAME} is built by <a href="${AUTHOR_URL}" rel="author">${AUTHOR_NAME}</a> (${handleLink})${orgSegment}${taglineSegment}${BYLINE_LINKS}${agentLinks}</footer>`;

  const ogImage = OG_IMAGE
    ? `
    <meta property="og:image" content="${OG_IMAGE}" />`
    : "";
  const twitterImage = OG_IMAGE
    ? `
    <meta name="twitter:image" content="${OG_IMAGE}" />`
    : "";

  const analytics = GTAG_ID
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${GTAG_ID}"></script>
    <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${GTAG_ID}");</script>
    `
    : "";

  const titleHtml = escapeHtml(fullTitle);
  const descriptionHtml = escapeHtml(description);
  const keywordsHtml = escapeHtml(fullKeywords);

  return `<!doctype html>
<html lang="${inLanguage}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${titleHtml}</title>
    ${slug === "404" ? `<meta name="robots" content="noindex" />
    ` : HAS_SEO ? `<meta name="robots" content="${slug.startsWith("released/") ? "noindex, follow" : "index, follow"}" />
    <meta name="title" content="${titleHtml}" />
    <meta name="description" content="${descriptionHtml}" />
    ${keywordsHtml ? `<meta name="keywords" content="${keywordsHtml}" />
    ` : ""}<meta name="author" content="${AUTHOR_NAME}" />
    <link rel="author" href="${AUTHOR_URL}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="alternate" type="text/markdown" href="${DOMAIN}${markdownHref(slug, isZh)}" />
    <link rel="describedby" href="${DOMAIN}/llms.txt" />
    ${FAVICON ? `<link rel="icon" href="${FAVICON}" />
    ` : ""}    ${altLinks}<meta property="og:title" content="${titleHtml}" />
    <meta property="og:description" content="${descriptionHtml}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:type" content="${slug === "home" ? "website" : "article"}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:locale" content="${isZh ? "zh_TW" : "en_US"}" />${ogImage}
    <meta name="twitter:card" content="${OG_IMAGE ? "summary_large_image" : "summary"}" />
    <meta name="twitter:title" content="${titleHtml}" />
    <meta name="twitter:description" content="${descriptionHtml}" />${twitterImage}
    <script type="application/ld+json">${jsonLd}</script>
    ` : ""}${analytics}<link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" referrerpolicy="no-referrer" />
    <link rel="stylesheet" href="/docs.css" />
    <style>${NANOMD_CSS}</style>
    ${DEMO_SCRIPT ? `<script src="${DEMO_SCRIPT}"${Object.entries(DEMO_SCRIPT_ATTRS).map(([k, v]) => ` ${k}="${v}"`).join("")}${DEMO_LOG_IGNORE.length ? ` data-demo-ignore='${JSON.stringify(DEMO_LOG_IGNORE).replace(/&/g, "&amp;").replace(/'/g, "&#39;")}'` : ""}${DEMO_SCRIPT === NANOMD_SCRIPT ? ' data-nanomd-css="off"' : ""} data-demo defer></script>
    ` : ""}${NANOMD_SCRIPT !== DEMO_SCRIPT ? `<script src="${NANOMD_SCRIPT}" data-nanomd-css="off" defer></script>
    ` : ""}  </head>
  <body>
    <header class="header">
      <button class="mobile-menu-btn" onclick="document.querySelector('.sidebar').classList.toggle('open');revealNav()" aria-label="Menu"><i class="fa-solid fa-bars"></i></button>
      <a href="${isZh ? "/zh/" : "/"}" class="header-logo">${REPO}</a>
      ${LATEST_VERSION ? `<a class="header-version" href="/released/${LATEST_VERSION}">${LATEST_VERSION}</a>` : ""}
      <div class="header-links">
        <a href="${isZh ? "/zh/" : "/"}">${isZh ? "首頁" : "Home"}</a>
        <a href="https://github.com/${REPO}" target="_blank" rel="noopener">GitHub</a>
      </div>
    </header>
    <div class="layout">
      <nav class="sidebar">${sidebar}</nav>
      <main class="content"><div class="nanomd" data-mode="light">${body}</div>${byline}</main>
      <aside class="toc">${toc}</aside>
    </div>
    <script>
      function revealNav(){
        var s=document.querySelector('.sidebar'),a=s&&s.querySelector('.nav-item.active');
        if(!a||!s.clientHeight)return;
        s.scrollTop=a.offsetTop-(s.clientHeight-a.offsetHeight)/2;
      }
      revealNav();
      document.querySelectorAll('.sidebar .nav-item').forEach(function(el){
        el.addEventListener('click',function(){document.querySelector('.sidebar').classList.remove('open')})
      });
      var tocObs=new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if(e.isIntersecting){
            document.querySelectorAll('.toc-link').forEach(function(l){
              l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id)
            })
          }
        })
      },{rootMargin:'-80px 0px -70% 0px'});
      document.querySelectorAll('.content h2,.content h3').forEach(function(h){tocObs.observe(h)});
    </script>
    ${content.includes('class="demo"') ? `<script src="/demo.js" defer></script>` : ""}
    <script>addEventListener("DOMContentLoaded",function(){MDParser.Init({enable:${JSON.stringify({ highlight: content.includes('class="prettyprint"'), mermaid: content.includes('class="md-mermaid"'), latex: /class="md-math(-inline)?"/.test(content), chartjs: content.includes('class="md-chart"') })}}).then(function(){return MDParser.Refresh(document.querySelector(".content>.nanomd"))}).catch(function(e){console.error(e.message)})})</script>
    ${isReleased ? "" : `<a href="${altHref}" class="lang-fab" aria-label="${isZh ? "Switch to English" : "Switch to Chinese"}" hreflang="${isZh ? "en" : ZH_LANG}"><i class="fa-solid fa-language"></i><span>${isZh ? "EN" : "中文"}</span></a>`}
  </body>
</html>`;
}

function releaseDescription(md, tag) {
  const fallback = `${SITE_NAME} ${tag} release notes — changelog, new features, and fixes.`;
  const match = md.match(/^## Summary\s*\n+([^\n#][^\n]*)/m);
  if (!match) return fallback;
  const text = `${SITE_NAME} ${tag}: ${match[1].replace(/["`]/g, "").trim()}`;
  if (text.length <= 155) return text;
  const cut = text.slice(0, 155);
  const sentence = cut.lastIndexOf(". ");
  if (sentence > 60) return cut.slice(0, sentence + 1);
  return `${cut.slice(0, cut.lastIndexOf(" "))}...`;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(ZH_DIR, { recursive: true });

const allSlugs = NAV.flatMap(g => g.items.map(i => i.slug));
let built = 0;
let builtZh = 0;
const zhSlugs = [];
const pageMd = {};
const fullEn = [];
const fullZh = [];

for (const slug of allSlugs) {
  const mdPath = path.join(PAGES_DIR, `${slug}.md`);
  if (!fs.existsSync(mdPath)) {
    console.warn(`SKIP: ${slug}.md not found`);
    continue;
  }

  const md = fs.readFileSync(mdPath, "utf-8");
  let html = renderDemos(addHeadingIds(renderMarkdown(md)));
  if (slug === "home") html = ensureH1(html, REPO);

  const label = NAV.flatMap(g => g.items).find(i => i.slug === slug)?.label || slug;
  const desc = DESCRIPTIONS[slug] || "";
  const kw = KEYWORDS[slug] || "";
  const sidebar = buildSidebar(slug, "en");
  const toc = buildTOC(html);
  const page = renderPage(slug, label, desc, kw, sidebar, html, toc, "en", seo => stampDates(`en:${slug}`, md + seo));

  const outPath = slug === "home"
    ? path.join(OUT_DIR, "index.html")
    : path.join(OUT_DIR, `${slug}.html`);

  fs.writeFileSync(outPath, page);
  fs.writeFileSync(path.join(OUT_DIR, markdownHref(slug, false)), md);
  pageMd[slug] = md;
  fullEn.push(`---\n\nSource: ${DOMAIN}${markdownHref(slug, false)}\n\n${md.trim()}\n`);
  built++;
  console.log(`OK: ${outPath}`);

  // zh variant — generated only when a translated source exists
  const zhMdPath = path.join(PAGES_DIR, `${slug}.zh.md`);
  if (fs.existsSync(zhMdPath)) {
    let zhHtml = renderDemos(addHeadingIds(renderMarkdown(fs.readFileSync(zhMdPath, "utf-8"))), "zh");
    if (slug === "home") zhHtml = ensureH1(zhHtml, REPO);
    const zhLabel = NAV_ZH_LABEL[slug] || label;
    const zhDesc = DESCRIPTIONS_ZH[slug] || desc;
    const zhSidebar = buildSidebar(slug, "zh");
    const zhToc = buildTOC(zhHtml, "zh");
    const zhMd = fs.readFileSync(zhMdPath, "utf-8");
    pageMd[`${slug}.zh`] = zhMd;
    const zhPage = renderPage(slug, zhLabel, zhDesc, KEYWORDS_ZH[slug] || "", zhSidebar, zhHtml, zhToc, "zh", seo => stampDates(`zh:${slug}`, zhMd + seo));
    const zhOut = slug === "home"
      ? path.join(ZH_DIR, "index.html")
      : path.join(ZH_DIR, `${slug}.html`);
    fs.writeFileSync(zhOut, zhPage);
    fs.writeFileSync(path.join(OUT_DIR, markdownHref(slug, true)), zhMd);
    fullZh.push(`---\n\nSource: ${DOMAIN}${markdownHref(slug, true)}\n\n${zhMd.trim()}\n`);
    builtZh++;
    zhSlugs.push(slug);
    console.log(`OK: ${zhOut}`);
  }
}

// === release pages (public/docs/tags/*.md -> /released/<tag>) ===
const releaseTags = [];

if (TAGS.length) {
  fs.mkdirSync(RELEASED_DIR, { recursive: true });

  for (const tag of TAGS) {
    const raw = fs.readFileSync(path.join(TAGS_DIR, `${tag}.md`), "utf-8");
    const heading = `# ${tag} Release Notes`;
    const md = `${heading}\n\n${stripH1(raw)}`;
    const html = addHeadingIds(renderMarkdown(md));
    const sidebar = buildVersionSidebar(tag, TAGS, TAG_DATES);
    const toc = buildTOC(html);
    const desc = releaseDescription(md, tag);
    const kw = `${SITE_NAME.toLowerCase()}, release notes, changelog, ${tag}`;
    const releaseDates = TAG_DATES[tag] ? { published: TAG_DATES[tag], modified: TAG_DATES[tag] } : null;
    const page = renderPage(`released/${tag}`, `${tag} Release Notes`, desc, kw, sidebar, html, toc, "en", releaseDates);
    fs.writeFileSync(path.join(RELEASED_DIR, `${tag}.html`), page);
    fs.writeFileSync(path.join(RELEASED_DIR, `${tag}.md`), md);
    releaseTags.push(tag);
  }

  let listHtml = `<h1 class="md-h1">Release Notes</h1>\n<span class="md-line">All ${SITE_NAME} releases.</span>\n`;
  for (const [minor, versions] of groupByMinor(TAGS)) {
    listHtml += `<h2 class="md-h2">${minor}</h2>\n<ul class="md-list">\n`;
    for (const v of versions) {
      const date = TAG_DATES[v] ? ` <span style="color:var(--muted);font-size:13px">${TAG_DATES[v]}</span>` : "";
      listHtml += `<li><a class="md-link" href="/released/${v}">${v}</a>${date}</li>\n`;
    }
    listHtml += `</ul>\n`;
  }
  listHtml = addHeadingIds(listHtml);
  const indexPage = renderPage(
    "released",
    "Release Notes",
    `All ${SITE_NAME} release notes — changelogs, features, and fixes by version.`,
    `${SITE_NAME.toLowerCase()}, releases, changelog, version history`,
    buildVersionSidebar("", TAGS, TAG_DATES),
    listHtml,
    buildTOC(listHtml),
    "en",
    { published: TAG_DATES[TAGS[TAGS.length - 1]], modified: TAG_DATES[TAGS[0]] },
  );
  fs.writeFileSync(path.join(RELEASED_DIR, "index.html"), indexPage);
  let listMd = `# Release Notes\n\nAll ${SITE_NAME} releases.\n`;
  for (const [minor, versions] of groupByMinor(TAGS)) {
    listMd += `\n## ${minor}\n\n`;
    for (const v of versions) listMd += `- [${v}](${DOMAIN}/released/${v}.md)${TAG_DATES[v] ? ` ${TAG_DATES[v]}` : ""}\n`;
  }
  fs.writeFileSync(path.join(RELEASED_DIR, "index.md"), listMd);
  console.log(`OK: ${releaseTags.length} release pages + index`);
}

function projectIntro(md) {
  const lines = md.split("\n");
  let fence = false;
  let plain = "";
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^(`{3,}|~{3,})/.test(line)) fence = !fence;
    if (fence) continue;
    if (line.startsWith(">") && !(lines[i - 1] || "").trim().startsWith(">")) {
      const block = [];
      for (let j = i; j < lines.length && lines[j].trim().startsWith(">"); j++) block.push(lines[j].trim().replace(/^>\s?/, ""));
      if (!block[0].startsWith("[!") && block.join(" ").trim()) return block.join(" ").trim();
    }
    if (!plain && /^[\p{L}\p{N}*_]/u.test(line) && line.length > 30) plain = line;
  }
  return plain;
}

function buildNotFound(lang) {
  const isZh = lang === "zh";
  const base = isZh ? "/zh" : "";
  const intro = projectIntro(pageMd[isZh ? "home.zh" : "home"] || pageMd.home || "");
  let md = isZh
    ? `# 找不到頁面\n\n這個頁面不存在或已移除。\n\n## 關於 ${SITE_NAME}\n\n${intro}\n\n[前往首頁](${base}/) · [GitHub](https://github.com/${REPO})\n`
    : `# Page not found\n\nThis page does not exist or has been removed.\n\n## About ${SITE_NAME}\n\n${intro}\n\n[Go to the documentation home](${base}/) · [GitHub](https://github.com/${REPO})\n`;
  for (const group of NAV) {
    const items = group.items.filter(i => (isZh ? zhSlugs : allSlugs).includes(i.slug) && pageMd[i.slug]);
    if (!items.length) continue;
    md += `\n## ${isZh ? (NAV_ZH_SECTION[group.section] || group.section) : group.section}\n\n`;
    for (const i of items) md += `- [${isZh ? (NAV_ZH_LABEL[i.slug] || i.label) : i.label}](${i.slug === "home" ? `${base}/` : `${base}/${i.slug}`})\n`;
  }
  const html = addHeadingIds(renderMarkdown(md));
  const title = isZh ? "找不到頁面" : "Page not found";
  const page = renderPage("404", title, "", "", buildSidebar("", lang), html, buildTOC(html, lang), lang, null);
  const out = path.join(isZh ? ZH_DIR : OUT_DIR, "404.html");
  fs.writeFileSync(out, page);
  console.log(`OK: ${out}`);
}

buildNotFound("en");
if (zhSlugs.length) buildNotFound("zh");

const pathOf = key => {
  const [lang, slug] = key.split(":");
  const base = lang === "zh" ? "/zh" : "";
  return slug === "home" ? `${base}/` : `${base}/${slug}`;
};
const live = new Set([...allSlugs.filter(s => pageMd[s]).map(s => pathOf(`en:${s}`)), ...zhSlugs.map(s => pathOf(`zh:${s}`)), ...(releaseTags.length ? ["/released/", ...releaseTags.map(t => `/released/${t}`)] : [])]);
for (const [from, to] of Object.entries(REDIRECTS)) {
  if (live.has(from)) {
    console.error(`[Conflict] redirects.json: ${from} is a live page; remove the entry`);
    process.exit(1);
  }
  if (!live.has(to)) {
    console.error(`[Not found] redirects.json: ${from} -> ${to}: target is not a built page`);
    process.exit(1);
  }
}
const vanished = Object.keys(DATES).map(pathOf).filter(p => !live.has(p) && !REDIRECTS[p] && !REMOVED.has(p));
if (vanished.length) {
  console.error(`[Conflict] published pages missing without a decision: ${vanished.join(", ")}; restore the page, or after the user confirms add a 301 to redirects.json (split/rename) or the path to removed.json (serve 404)`);
  process.exit(1);
}

fs.writeFileSync(DATES_PATH, JSON.stringify(DATES, null, 2) + "\n");
if (!HAS_SEO) {
  console.log(`\nBuilt ${built} doc pages (${builtZh} zh), ${releaseTags.length} release pages without SEO output. Template ${TEMPLATE_VERSION}.`);
  process.exit(0);
}

// === sitemap.xml ===
const lastmodOf = key => DATES[key]?.modified || BUILD_DATE;
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
sitemap += `  <url><loc>${DOMAIN}/</loc><lastmod>${lastmodOf("en:home")}</lastmod></url>\n`;
for (const slug of allSlugs) {
  if (slug === "home") continue;
  if (!DATES[`en:${slug}`]) continue;
  const lastmod = lastmodOf(`en:${slug}`);
  sitemap += `  <url><loc>${DOMAIN}/${slug}</loc><lastmod>${lastmod}</lastmod></url>\n`;
}
if (zhSlugs.length) {
  sitemap += `  <url><loc>${DOMAIN}/zh/</loc><lastmod>${lastmodOf("zh:home")}</lastmod></url>\n`;
  for (const slug of zhSlugs) {
    if (slug === "home") continue;
    const lastmod = lastmodOf(`zh:${slug}`);
    sitemap += `  <url><loc>${DOMAIN}/zh/${slug}</loc><lastmod>${lastmod}</lastmod></url>\n`;
  }
}
if (releaseTags.length) {
  sitemap += `  <url><loc>${DOMAIN}/released/</loc><lastmod>${TAG_DATES[releaseTags[0]] || BUILD_DATE}</lastmod></url>\n`;
}
sitemap += `</urlset>\n`;
fs.writeFileSync(path.join(__dirname, "public/sitemap.xml"), sitemap);
console.log(`OK: sitemap.xml`);

// === robots.txt ===
const aiprefPairs = [["train-ai", AI_TRAIN], ["ai-use", AI_INPUT], ["search", AI_SEARCH]].filter(([, v]) => v === "y" || v === "n");
const signalPairs = [["search", AI_SEARCH], ["ai-input", AI_INPUT], ["ai-train", AI_TRAIN]].filter(([, v]) => v === "y" || v === "n");
const contentUsage = aiprefPairs.map(([k, v]) => `${k}=${v}`).join(", ");
const contentSignal = signalPairs.map(([k, v]) => `${k}=${v === "y" ? "yes" : "no"}`).join(", ");
const robots = `User-agent: *
Allow: /
${contentUsage ? `Content-Usage: ${contentUsage}\n` : ""}${contentSignal ? `Content-signal: ${contentSignal}\n` : ""}
Sitemap: ${DOMAIN}/sitemap.xml
`;
fs.writeFileSync(path.join(__dirname, "public/robots.txt"), robots);
console.log("OK: robots.txt");

const headers = `${contentUsage ? `/*\n  Content-Usage: ${contentUsage}\n\n` : ""}/*.md
  Content-Type: text/markdown; charset=utf-8

/*.txt
  Content-Type: text/plain; charset=utf-8
`;
fs.writeFileSync(path.join(__dirname, "public/_headers"), headers);
console.log("OK: _headers");

const fullHeader = (desc, note) => `# ${SITE_NAME}\n\n> ${desc}\n\n${note}\n\n`;
fs.writeFileSync(path.join(OUT_DIR, "llms-full.txt"), fullHeader(DESCRIPTIONS.home, "Every documentation page in navigation order; each section starts with its source URL.") + fullEn.join("\n"));
console.log("OK: llms-full.txt");
if (fullZh.length) {
  fs.writeFileSync(path.join(ZH_DIR, "llms-full.txt"), fullHeader(DESCRIPTIONS_ZH.home || DESCRIPTIONS.home, "依導覽順序收錄所有文件頁；每段開頭標示來源 URL。") + fullZh.join("\n"));
  console.log("OK: zh/llms-full.txt");
}

function symbolIndex() {
  if (!fs.existsSync(SYMBOLS_PATH)) return [];
  const symbols = JSON.parse(fs.readFileSync(SYMBOLS_PATH, "utf-8"));
  const navOrder = allSlugs.filter(s => pageMd[s] && s !== "home");
  const liveText = Object.fromEntries(navOrder.map(slug => [slug, pageMd[slug].split("\n").filter(l => !/Removed in|移除於/.test(l)).join("\n")]));
  const refSlugs = new Set(NAV.filter(g => g.section === "Reference").flatMap(g => g.items.map(i => i.slug)));
  const isRef = slug => slug.startsWith("api-reference") || refSlugs.has(slug);
  const groups = new Map();
  for (const sym of symbols) {
    const name = sym.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const word = new RegExp(`\`[^\`\n]*(?<![\\w$-])${name}(?![\\w$-])[^\`\n]*\``, "g");
    const hits = navOrder
      .map(slug => ({ slug, count: (liveText[slug].match(word) || []).length }))
      .filter(h => h.count > 0);
    if (!hits.length) continue;
    const best = list => list.sort((a, b) => b.count - a.count)[0];
    const ref = best(hits.filter(h => isRef(h.slug)));
    const concept = best(hits.filter(h => !isRef(h.slug)));
    const pages = [ref, concept].filter(Boolean).map(h => h.slug);
    const key = `${sym.name}|${pages.join(",")}`;
    if (!groups.has(key)) groups.set(key, { name: sym.name, packages: [], pages });
    groups.get(key).packages.push(sym.package);
  }
  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// === llms.txt ===
const pageUrl = (slug, zh) => `${DOMAIN}${markdownHref(slug, zh)}`;
let llms = `# ${SITE_NAME}\n\n> ${DESCRIPTIONS.home}\n\nMaintained by ${AUTHOR_NAME} (${AUTHOR_HANDLE})${ORG_NAME ? `, ${ORG_NAME}` : ""}${TAGLINE ? `, ${TAGLINE}` : ""}. Source: https://github.com/${REPO}\n\nFull text in one file: [English](${DOMAIN}/llms-full.txt)${fullZh.length ? ` · [中文](${DOMAIN}/zh/llms-full.txt)` : ""}\n`;
for (const group of NAV) {
  const items = group.items.filter(i => fs.existsSync(path.join(PAGES_DIR, `${i.slug}.md`)));
  if (!items.length) continue;
  llms += `\n## ${group.section}\n\n`;
  for (const item of items) {
    llms += `- [${item.label}](${pageUrl(item.slug, false)}): ${DESCRIPTIONS[item.slug] || item.label}\n`;
  }
}
const symbolGroups = symbolIndex();
if (symbolGroups.length) {
  const labelOf = slug => NAV.flatMap(g => g.items).find(i => i.slug === slug)?.label || slug;
  llms += `\n## Symbols\n\nExported symbol -> page that documents it.\n\n`;
  for (const g of symbolGroups) {
    const links = g.pages.map(slug => `[${labelOf(slug)}](${pageUrl(slug, false)})`).join(", ");
    llms += `- \`${g.name}\` (${[...new Set(g.packages)].join(", ")}): ${links}\n`;
  }
}
if (zhSlugs.length) {
  llms += `\n## 中文文件\n\n`;
  for (const slug of zhSlugs) {
    llms += `- [${NAV_ZH_LABEL[slug] || slug}](${pageUrl(slug, true)}): ${DESCRIPTIONS_ZH[slug] || ""}\n`;
  }
}
if (releaseTags.length) {
  llms += `\n## Optional\n\n- [Release Notes](${DOMAIN}/released/index.md): ${SITE_NAME} changelog by version\n`;
}
fs.writeFileSync(path.join(__dirname, "public/llms.txt"), llms);
console.log("OK: llms.txt");

console.log(`\nBuilt ${built} doc pages (${builtZh} zh), ${releaseTags.length} release pages. Template ${TEMPLATE_VERSION}.`);
