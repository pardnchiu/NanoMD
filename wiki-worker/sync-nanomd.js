const https = require("https");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const PACKAGE = "@pardnchiu/nanomd";
const NANOMD_DIR = path.join(__dirname, "nanomd");

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "wiki-sync" } }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        return resolve(get(new URL(res.headers.location, url).href));
      }
      res.setEncoding("utf8");
      let body = "";
      res.on("data", c => body += c);
      res.on("end", () => {
        if (res.statusCode >= 400) return reject(new Error(`[Upstream] ${url}: HTTP ${res.statusCode}`));
        resolve(body);
      });
      res.on("error", reject);
    }).on("error", err => reject(new Error(`[Unavailable] ${url}: ${err.message}`)));
  });
}

async function main() {
  let version = process.argv[2];
  if (!version) {
    const latest = JSON.parse(await get(`https://registry.npmjs.org/${PACKAGE}/latest`));
    version = latest.version;
  }
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`[Invalid] version: "${version}" is not x.y.z`);
  }

  const cssUrl = `https://cdn.jsdelivr.net/npm/${PACKAGE}@${version}/dist/parser.css`;
  const css = await get(cssUrl);
  if (!css.includes(".nanomd")) {
    throw new Error(`[Upstream] ${cssUrl}: response has no .nanomd rules`);
  }

  execFileSync("npm", ["install", `${PACKAGE}@${version}`, "--save-exact"], { cwd: __dirname, stdio: "inherit" });

  fs.mkdirSync(NANOMD_DIR, { recursive: true });
  fs.writeFileSync(path.join(NANOMD_DIR, "parser.css"), css);
  fs.writeFileSync(path.join(NANOMD_DIR, "version.json"), JSON.stringify({ version }, null, 2) + "\n");
  console.log(`OK: ${PACKAGE}@${version} (nanomd/parser.css, nanomd/version.json)`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
