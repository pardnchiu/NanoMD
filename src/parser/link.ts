import {
  REGEX_MD_FILE_PATH_TRAILING,
  REGEX_MD_BR,
  REGEX_MD_ESCAPE,
  REGEX_MD_FOOTNOTE_REF,
  REGEX_MD_IMAGE_SIZE_PERCENT,
  REGEX_MD_LINK,
  REGEX_MD_LINK_DEF,
  REGEX_MD_LINK_PLACEHOLDER,
  REGEX_MD_MATH_INLINE,
  REGEX_MD_URL_TRAILING,
  REGEX_MD_VIDEO,
  REGEX_VIMEO,
  REGEX_YOUTUBE,
} from "./regex";
import type { InlineNode, Footnote, LinkTag, ListItem, BlockNode, TableCell, TableRow } from "./types";

type LinkNode = Extract<InlineNode, { type: "link" }>;

interface Link {
  alt?: string;
  src?: string;
  imgTitle?: string;
  size?: string;
  width?: string;
  height?: string;
  label?: string;
  href?: string;
  linkTitle?: string;
  refLabel?: string;
  ref?: string;
  path?: string;
  url?: string;
  hashtag?: string;
}

const linkMap = new Map<string, { href: string; title?: string }>();

export function ParseLink(text: string): { mask: string; links: InlineNode[] } {
  const links: InlineNode[] = [];
  // * mask links for later style parse, keep link's style be correct like ~~http://abc.de~~
  const mask = text
    .replace(/\u0000/g, "")
    .replace(REGEX_MD_MATH_INLINE, (_, value: string) => {
      links.push({ type: "math", value });
      return `\u0000${links.length - 1}\u0000`;
    })
    .replace(REGEX_MD_ESCAPE, (_, char: string) => {
      links.push({ type: "text", value: char });
      return `\u0000${links.length - 1}\u0000`;
    })
    .replace(REGEX_MD_BR, () => {
      links.push({ type: "br" });
      return `\u0000${links.length - 1}\u0000`;
    })
    .replace(REGEX_MD_FOOTNOTE_REF, (_, id: string) => {
      links.push({ type: "footnoteRef", id, index: 0 });
      return `\u0000${links.length - 1}\u0000`;
    })
    .replace(REGEX_MD_LINK, (...args) => {
      const { node, trail } = parseMeta(args[args.length - 1] as Link);
      links.push(node);
      return `\u0000${links.length - 1}\u0000${trail}`;
    });
  return { mask, links };
}

function parseMeta(meta: Link): { node: InlineNode; trail: string } {
  if (meta.src !== undefined) {
    const node: LinkNode = {
      type: "link",
      href: meta.src,
      tag: REGEX_MD_VIDEO.test(meta.src) ? "video" : "image",
      children: [{ type: "text", value: meta.alt ?? "" }],
    };

    if (meta.imgTitle) {
      node.title = meta.imgTitle;
    }

    if (meta.size) {
      node.width = REGEX_MD_IMAGE_SIZE_PERCENT.test(meta.size) ? meta.size : `${meta.size}px`;
      node.height = node.width;
    }

    if (meta.width) {
      node.width = REGEX_MD_IMAGE_SIZE_PERCENT.test(meta.width) ? meta.width : `${meta.width}px`;
    }

    if (meta.height) {
      node.height = REGEX_MD_IMAGE_SIZE_PERCENT.test(meta.height) ? meta.height : `${meta.height}px`;
    }
    return { node, trail: "" };
  }

  if (meta.ref !== undefined && meta.refLabel !== undefined) {
    return { node: { type: "linkRef", label: meta.refLabel, ref: meta.ref }, trail: "" };
  }

  // * note: [](http://abc.de) fall back to bare link parse, not bug
  if (meta.href !== undefined && meta.label !== undefined) {
    return {
      node: linkNode(meta.href, [{ type: "text", value: meta.label }], meta.linkTitle),
      trail: "",
    };
  }

  if (meta.path !== undefined) {
    const trail = meta.path.match(REGEX_MD_FILE_PATH_TRAILING)?.[0] ?? "";
    const filePath = meta.path.slice(0, meta.path.length - trail.length);
    return {
      node: { type: "link", href: filePath, tag: "file", children: [{ type: "text", value: filePath }] },
      trail,
    };
  }

  if (meta.hashtag !== undefined) {
    return {
      node: { type: "link", href: meta.hashtag.slice(1), tag: "hashtag", children: [{ type: "text", value: meta.hashtag }] },
      trail: "",
    };
  }

  const url = meta.url ?? "";
  const trail = url.match(REGEX_MD_URL_TRAILING)?.[0] ?? "";
  const bareURL = url.slice(0, url.length - trail.length);
  return { node: linkNode(bareURL, [{ type: "text", value: bareURL }]), trail };
}

function linkNode(href: string, children: InlineNode[], title?: string): LinkNode {
  let tag: LinkTag | undefined;
  if (REGEX_YOUTUBE.test(href)) {
    tag = "youtube";
  } else if (REGEX_VIMEO.test(href)) {
    tag = "vimeo";
  }
  const node: LinkNode = tag ? { type: "link", href, tag, children } : { type: "link", href, children };
  if (title) {
    node.title = title;
  }
  return node;
}

export function RestoreLinks(text: string, links: InlineNode[]): InlineNode[] {
  const domMap: InlineNode[] = [];
  const parts = text.split(REGEX_MD_LINK_PLACEHOLDER);
  for (let k = 0; k < parts.length; k++) {
    if (k % 2 === 1) {
      domMap.push(links[Number(parts[k])]);
    } else if (parts[k]) {
      domMap.push({ type: "text", value: parts[k] });
    }
  }
  return domMap;
}

export function ParseLinkDefBlock(lines: string[], i: number): { next: number } | null {
  const match = lines[i].match(REGEX_MD_LINK_DEF);
  if (!match) {
    return null;
  }

  const key = match[1].toLowerCase();
  if (!linkMap.has(key)) {
    linkMap.set(key, { href: match[2], title: match[4] });
  }
  return { next: i + 1 };
}

export function RestoreLinkRefs(nodes: (BlockNode | InlineNode | TableRow | TableCell | ListItem | Footnote)[]): void {
  for (let k = 0; k < nodes.length; k++) {
    const node = nodes[k];
    if (node.type === "linkRef") {
      const definition = linkMap.get(node.ref.toLowerCase());
      nodes[k] = definition
        ? linkNode(definition.href, [{ type: "text", value: node.label }], definition.title)
        : { type: "text", value: `[${node.label}][${node.ref}]` };
    } else if ("children" in node) {
      RestoreLinkRefs(node.children);
    }
  }
}

export function ResetLinkRef(): void {
  linkMap.clear();
}
