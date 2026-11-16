#!/usr/bin/env node
// =============================================================
// Publica cada site como um Worker separado na Cloudflare, com o
// nome do estabelecimento: https://<nome>.<subdominio>.workers.dev
//
// Os arquivos do site (HTML, CSS, JS) vão embutidos no próprio
// Worker, então basta a API normal da Cloudflare (sem wrangler).
//
// Uso:
//   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... node deploy/workers/publicar.mjs
//   (opcional) node deploy/workers/publicar.mjs odonto   → publica só um site
//
// O token precisa da permissão: Account → Workers Scripts → Edit.
// =============================================================
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
const REPO = join(AQUI, "..", "..");
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CONTA = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!TOKEN || !CONTA) { console.error("Defina CLOUDFLARE_API_TOKEN e CLOUDFLARE_ACCOUNT_ID."); process.exit(1); }

const API = `https://api.cloudflare.com/client/v4/accounts/${CONTA}/workers`;
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json", ".txt": "text/plain; charset=utf-8" };

function arquivos(pasta) {
  const lista = [];
  (function andar(d) {
    for (const nome of readdirSync(d)) {
      const p = join(d, nome);
      if (statSync(p).isDirectory()) andar(p); else lista.push(p);
    }
  })(pasta);
  return lista;
}

function codigoDoWorker(pasta) {
  const mapa = {};
  for (const arq of arquivos(pasta)) {
    const tipo = TIPOS[extname(arq).toLowerCase()];
    if (!tipo) { console.warn(`  (ignorado: ${relative(pasta, arq)} — tipo não suportado)`); continue; }
    mapa["/" + relative(pasta, arq).split("\\").join("/")] = [tipo, readFileSync(arq, "utf8")];
  }
  return `// Gerado por deploy/workers/publicar.mjs — não edite à mão.
const ARQUIVOS = ${JSON.stringify(mapa)};
const CABECALHOS = { "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" };
export default {
  async fetch(req) {
    const url = new URL(req.url);
    let caminho = decodeURIComponent(url.pathname);
    if (caminho.endsWith("/")) caminho += "index.html";
    if (caminho === "/robots.txt") return new Response("User-agent: *\\nDisallow: /\\n", { headers: { "content-type": "text/plain", ...CABECALHOS } });
    let item = ARQUIVOS[caminho];
    if (!item && ARQUIVOS[caminho + "/index.html"]) return Response.redirect(url.origin + caminho + "/", 301);
    if (!item) return new Response("Página não encontrada", { status: 404, headers: { "content-type": "text/plain; charset=utf-8", ...CABECALHOS } });
    const [tipo, corpo] = item;
    const cache = tipo.startsWith("text/html") ? "no-cache" : "public, max-age=3600";
    return new Response(corpo, { headers: { "content-type": tipo, "cache-control": cache, ...CABECALHOS } });
  },
};
`;
}

async function api(caminho, opcoes) {
  const r = await fetch(API + caminho, { ...opcoes, headers: { Authorization: `Bearer ${TOKEN}`, ...(opcoes.headers || {}) } });
  const j = await r.json().catch(() => ({}));
  if (!j.success) throw new Error(`${opcoes.method} ${caminho}: ${r.status} ${JSON.stringify(j.errors || j)}`);
  return j.result;
}

const { sites } = JSON.parse(readFileSync(join(AQUI, "sites.json"), "utf8"));
const filtro = process.argv[2];
let subdominio = null;
try { subdominio = (await api("/subdomain", { method: "GET" })).subdomain; } catch { /* sem permissão para ler: tudo bem */ }

for (const { pasta, nome } of sites.filter((s) => !filtro || s.pasta === filtro || s.nome === filtro)) {
  process.stdout.write(`→ ${nome} (sites/${pasta}) ... `);
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify({ main_module: "worker.js", compatibility_date: "2025-01-01" })], { type: "application/json" }), "metadata.json");
  form.append("worker.js", new Blob([codigoDoWorker(join(REPO, "sites", pasta))], { type: "application/javascript+module" }), "worker.js");
  await api(`/scripts/${nome}`, { method: "PUT", body: form });
  await api(`/scripts/${nome}/subdomain`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ enabled: true, previews_enabled: false }) });
  console.log("ok" + (subdominio ? `  https://${nome}.${subdominio}.workers.dev/` : ""));
}
