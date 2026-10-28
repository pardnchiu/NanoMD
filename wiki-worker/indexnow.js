const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const https = require("https");

const PUBLIC_DIR = path.join(__dirname, "public");
const SENT_PATH = path.join(__dirname, ".indexnow-sent.json");
const ENDPOINT = "https://api.indexnow.org/indexnow";
const BATCH = 10000;

function findOrCreateKey() {
  const existing = fs.readdirSync(PUBLIC_DIR).find(f => /^[a-f0-9]{32}\.txt$/.test(f));
  if (existing) return existing.replace(/\.txt$/, "");
  const key = crypto.randomBytes(16).toString("hex");
  fs.writeFileSync(path.join(PUBLIC_DIR, `${key}.txt`), key);
  console.log(`IndexNow: created key file public/${key}.txt`);
  return key;
}

function sitemapEntries() {
  const xml = fs.readFileSync(path.join(PUBLIC_DIR, "sitemap.xml"), "utf-8");
  const entries = [];
  for (const m of xml.matchAll(/<url><loc>([^<]+)<\/loc>.*?<lastmod>([^<]+)<\/lastmod><\/url>/g)) {
    entries.push({ url: m[1], lastmod: m[2] });
  }
  return entries;
}

function post(body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(data) },
      timeout: 30000,
    }, res => {
      let raw = "";
      res.on("data", chunk => { if (raw.length < 8192) raw += chunk; });
      res.on("end", () => resolve({ status: res.statusCode, body: raw.slice(0, 8192) }));
    });
    req.on("timeout", () => req.destroy(new Error("IndexNow request timed out")));
    req.on("error", reject);
    req.end(data);
  });
}

async function main() {
  const key = findOrCreateKey();
  if (process.argv.includes("--ensure-key")) return;
  const entries = sitemapEntries();
  if (!entries.length) {
    console.log("IndexNow: sitemap has no URLs");
    return;
  }
  const host = new URL(entries[0].url).host;
  const sent = fs.existsSync(SENT_PATH) ? JSON.parse(fs.readFileSync(SENT_PATH, "utf-8")) : {};
  const changed = entries.filter(e => sent[e.url] !== e.lastmod);
  if (!changed.length) {
    console.log("IndexNow: no changed URLs");
    return;
  }
  for (let i = 0; i < changed.length; i += BATCH) {
    const batch = changed.slice(i, i + BATCH);
    const res = await post({ host, key, keyLocation: `https://${host}/${key}.txt`, urlList: batch.map(e => e.url) });
    if (res.status !== 200 && res.status !== 202) {
      throw new Error(`IndexNow HTTP ${res.status}: ${res.body.trim()}`);
    }
    for (const e of batch) sent[e.url] = e.lastmod;
    fs.writeFileSync(SENT_PATH, JSON.stringify(sent, null, 2) + "\n");
    console.log(`IndexNow: HTTP ${res.status}, submitted ${batch.length} URLs`);
  }
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
