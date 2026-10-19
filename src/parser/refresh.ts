import type { Dependency } from "./types";

const deps = globalThis as unknown as Dependency;

let mermaidReady = false;

let copyHandler: ((success: boolean, pre: HTMLElement) => void) | null = null;

export function OnCopyClick(handler: (success: boolean, pre: HTMLElement) => void): void {
  copyHandler = handler;
}

export function Refresh(container?: ParentNode): Promise<void> {
  if (typeof document === "undefined") {
    return Promise.resolve();
  }

  const root = container ?? document;
  bindCopy(root);
  renderChart(root);
  renderLatex(root);
  deps.PR?.prettyPrint();
  return renderMermaid(root);
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
  const nodes = await Promise.all(
    [...root.querySelectorAll<HTMLElement>("pre.mermaid")].map(async (pre) => {
      if (await mermaid.parse(pre.textContent ?? "", { suppressErrors: true })) {
        return pre;
      }
      replaceWithCode(pre.parentElement, "pre.prettyprint");
      return null;
    }),
  );
  const valid = nodes.filter((node): node is HTMLElement => node !== null);
  await mermaid.run({ nodes: valid, suppressErrors: true });
  for (const e of valid) {
    if (e.querySelector("svg")) {
      e.parentElement?.setAttribute("data-rendered", "");
    }
  }
}

function replaceWithCode(wrapper: HTMLElement | null, selector: string): void {
  const code = wrapper?.querySelector(selector);
  if (wrapper && code) {
    wrapper.replaceWith(code);
  }
}
