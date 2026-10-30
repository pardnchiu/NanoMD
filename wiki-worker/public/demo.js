(() => {
  const tag = document.querySelector("script[data-demo]");
  const CDN = tag.src;
  const attrs = [...tag.attributes]
    .filter((a) => !["src", "type", "data-demo", "data-demo-ignore", "data-nanomd-css", "defer"].includes(a.name))
    .map((a) => ` ${a.name}="${a.value.replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`)
    .join("");

  const ignore = JSON.stringify(JSON.parse(tag.dataset.demoIgnore || "[]")).replace(/</g, "\\u003c");
  const boot =
    `const queue=[];const ignore=${ignore};` +
    `const write=t=>{const log=document.getElementById("demo-log");if(!log){queue.push(t);return}log.hidden=false;log.textContent+=t+"\\n"};` +
    `const print=(...a)=>{if(typeof a[0]==="string"&&(a[0].startsWith("%c")||ignore.some(p=>a[0].startsWith(p))))return;write(a.map(v=>typeof v==="string"?v:JSON.stringify(v)).join(" "))};` +
    `addEventListener("DOMContentLoaded",()=>queue.splice(0).forEach(write));` +
    `console.log=print;console.error=print;addEventListener("error",e=>print(e.message));addEventListener("unhandledrejection",e=>print(String(e.reason)));`;

  for (const e of document.querySelectorAll(".demo")) {
    const code = [...e.querySelectorAll("code li")].map((l) => l.textContent).join("\n").replace(/<script[^>]*src="[^"]*cdn\.jsdelivr\.net[^"]*"[^>]*><\/script>\s*/g, "");
    const frame = e.querySelector("iframe");
    frame.addEventListener("load", () => {
      const win = frame.contentWindow;
      const doc = win.document;
      new win.ResizeObserver(() => win.requestAnimationFrame(() => {
        const visible = [...doc.body.children].some((c) => {
          if (c.id === "demo-log" || c.tagName === "SCRIPT") return false;
          const rect = c.getBoundingClientRect();
          return rect.width > 0 || rect.height > 0;
        });
        doc.body.classList.toggle("demo-empty", !visible);
        frame.style.height = `${Math.ceil(doc.body.getBoundingClientRect().height)}px`;
      })).observe(doc.body);
    });
    frame.srcdoc =
      `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<style>html,body{margin:0;background:#fff;overflow:hidden}body{padding:1rem;font:15px/1.6 system-ui,sans-serif;color:#0f172a}` +
      `#demo-log{margin:1rem -1rem -1rem;padding:8px 12px;border-top:1px solid #e2e8f0;background:#f8fafc;color:#334155;font:12px/1.5 "JetBrains Mono",monospace;white-space:pre-wrap}body.demo-empty{padding:0}body.demo-empty #demo-log{margin:0}</style>` +
      `<script src="${CDN}"${attrs} crossorigin></script><script>${boot}</script></head>` +
      `<body>${code}<pre id="demo-log" hidden></pre></body></html>`;
  }
})();
