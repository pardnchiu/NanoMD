import { PARSE_OPTIONS } from "./index";
import type { Dependency } from "./types";

const deps = globalThis as unknown as Dependency;

let mermaidReady = false;

let mermaidCount = 0;

let copyHandler: ((success: boolean, pre: HTMLElement) => void) | null = null;

const copyTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

export function OnCopyClick(handler: (success: boolean, pre: HTMLElement) => void): void {
  copyHandler = handler;
}

export function Refresh(container?: ParentNode): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  const root = container ?? document;
  if (!(root as Node).isConnected) {
    console.error("[Invalid] container: not attached to the document");
    return Promise.resolve();
  }
  bindCopy(root);
  bindFile(root);
  renderChart(root);
  renderLatex(root);
  deps.PR?.prettyPrint();
  return renderMermaid(root);
}

function bindFile(root: ParentNode): void {
  for (const e of root.querySelectorAll<HTMLAnchorElement>("a.md-file-link")) {
    e.onclick = async (event) => {
      event.preventDefault();
      if (!PARSE_OPTIONS.fileEndpoint) {
        return;
      }
      const url = PARSE_OPTIONS.fileEndpoint.replaceAll("{filepath}", encodeURIComponent(e.dataset.path ?? ""));
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error(`[Upstream] ${url}: HTTP ${res.status}`);
        }
      } catch (err) {
        console.error(`[Unavailable] ${url}: ${err instanceof Error ? err.message : err}`);
      }
    };
  }
}

function bindCopy(root: ParentNode): void {
  for (const e of root.querySelectorAll<HTMLButtonElement>("pre.prettyprint button.copy")) {
    e.onclick = async () => {
      const pre = e.parentElement!;
      const text = [...pre.querySelectorAll("li")].map((li) => li.textContent).join("\n");
      let success = true;
      try {
        await navigator.clipboard.writeText(text);
      } catch (err) {
        console.error(`[Denied] clipboard: ${err instanceof Error ? err.message : err}`);
        success = false;
      }
      clearTimeout(copyTimers.get(pre));
      pre.classList.remove("success", "error");
      pre.classList.add(success ? "success" : "error");
      copyTimers.set(pre, setTimeout(() => pre.classList.remove("success", "error"), 1000));
      copyHandler?.(success, pre);
    };
  }
}

function renderChart(root: ParentNode): void {
  const Chart = deps.Chart;
  if (!Chart) {
    return;
  }

  for (const e of Object.values(Chart.instances)) {
    if (e.canvas.isConnected) {
      continue;
    }
    e.destroy();
  }

  for (const e of root.querySelectorAll<HTMLCanvasElement>(".md-chart canvas")) {
    try {
      new Chart(e, JSON.parse(e.dataset.chart ?? ""));
      e.parentElement?.setAttribute("data-rendered", "");
    } catch {
      replaceWithCode(e.parentElement, "pre");
    }
  }
}

function renderLatex(root: ParentNode): void {
  const katex = deps.katex;
  if (!katex) {
    return;
  }
  for (const e of root.querySelectorAll<HTMLElement>(".md-math")) {
    try {
      katex.render(e.textContent ?? "", e, { displayMode: true, throwOnError: true });
      e.parentElement?.setAttribute("data-rendered", "");
    } catch {
      replaceWithCode(e.parentElement, "pre.prettyprint");
    }
  }
  for (const e of root.querySelectorAll<HTMLElement>(".md-math-inline")) {
    try {
      katex.render(e.textContent ?? "", e, { displayMode: false, throwOnError: true });
    } catch {
      e.replaceWith(`$${e.textContent}$`);
    }
  }
}

async function renderMermaid(root: ParentNode): Promise<void> {
  const mermaid = deps.mermaid;
  if (!mermaid) {
    return;
  }
  if (!mermaidReady) {
    mermaid.initialize({
      startOnLoad: false,
      theme: matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default",
    });
    mermaidReady = true;
  }
  for (const pre of root.querySelectorAll<HTMLElement>(".md-mermaid:not([data-rendered]) > pre.mermaid")) {
    const text = pre.textContent ?? "";
    if (!(await mermaid.parse(text, { suppressErrors: true }))) {
      replaceWithCode(pre.parentElement, "pre.prettyprint");
      continue;
    }
    try {
      const { svg, bindFunctions } = await mermaid.render(`nanomd-mermaid-${++mermaidCount}`, text);
      pre.innerHTML = svg;
      bindFunctions?.(pre);
      pre.parentElement?.setAttribute("data-rendered", "");
    } catch {
      replaceWithCode(pre.parentElement, "pre.prettyprint");
    }
  }
}

function replaceWithCode(wrapper: HTMLElement | null, selector: string): void {
  const code = wrapper?.querySelector(selector);
  if (wrapper && code) {
    wrapper.replaceWith(code);
  }
}
