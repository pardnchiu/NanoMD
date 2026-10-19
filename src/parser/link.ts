import {
  REGEX_MD_FILE_PATH_TRAILING,
  REGEX_MD_ESCAPE,
  REGEX_MD_FOOTNOTE_REF,
  REGEX_MD_IMAGE_SIZE_PERCENT,
  REGEX_MD_LINK,
  REGEX_MD_LINK_PLACEHOLDER,
  REGEX_MD_URL_TRAILING,
  REGEX_MD_VIDEO,
  REGEX_VIMEO,
  REGEX_YOUTUBE,
} from "./regex";
import type { ChildNode, LinkTag } from "./types";

type LinkNode = Extract<ChildNode, { type: "link" }>;

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
  path?: string;
  url?: string;
}

export function ParseLink(text: string): { mask: string; links: ChildNode[] } {
  const links: ChildNode[] = [];
  // * mask links for later style parse, keep link's style be correct like ~~http://abc.de~~
  const mask = text
    .replace(/\u0000/g, "")
    .replace(REGEX_MD_ESCAPE, (_, char: string) => {
      links.push({ type: "text", value: char });
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

function parseMeta(meta: Link): { node: ChildNode; trail: string } {
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

  const url = meta.url ?? "";
  const trail = url.match(REGEX_MD_URL_TRAILING)?.[0] ?? "";
  const bareURL = url.slice(0, url.length - trail.length);
  return { node: linkNode(bareURL, [{ type: "text", value: bareURL }]), trail };
}

function linkNode(href: string, children: ChildNode[], title?: string): LinkNode {
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

export function RestoreLinks(text: string, links: ChildNode[]): ChildNode[] {
  const domMap: ChildNode[] = [];
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
