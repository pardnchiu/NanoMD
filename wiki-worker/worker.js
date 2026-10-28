import redirects from "./redirects.json";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const key = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
    const target = redirects[key];
    if (target) return Response.redirect(new URL(target, url).toString(), 301);
    const response = await env.ASSETS.fetch(request);
    if (response.status === 307 || response.status === 308) {
      return new Response(null, { status: 301, headers: { Location: response.headers.get("Location") } });
    }
    if (response.status !== 404) return response;
    const page = await env.ASSETS.fetch(new URL(url.pathname.startsWith("/zh/") ? "/zh/404" : "/404", url));
    if (!page.ok) return response;
    return new Response(page.body, { status: 404, headers: page.headers });
  },
};
