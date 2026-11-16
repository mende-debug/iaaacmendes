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
  ".json": "application/json", ".svg": "image/svg+xml", ".webmanifest": "application/manifest+json", ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml" };
// Arquivos binários vão em base64 dentro do Worker
const BINARIOS = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif",
  ".ico": "image/x-icon", ".avif": "image/avif", ".woff2": "font/woff2", ".pdf": "application/pdf" };
const IGNORAR = new Set([".md"]); // arquivos de anotação que não fazem parte do site

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

// indexar = true: site real, pode aparecer no Google. false: demonstração (noindex).
function codigoDoWorker(pasta, indexar = false) {
  const mapa = {};
  for (const arq of arquivos(pasta)) {
    const ext = extname(arq).toLowerCase();
    const rel = relative(pasta, arq).split("\\").join("/");
    if (IGNORAR.has(ext) || rel.split("/").some((p) => p.startsWith("."))) continue;
    if (TIPOS[ext]) mapa["/" + rel] = [TIPOS[ext], readFileSync(arq, "utf8"), 0];
    else if (BINARIOS[ext]) mapa["/" + rel] = [BINARIOS[ext], readFileSync(arq).toString("base64"), 1];
    else console.warn(`  (ignorado: ${rel} — tipo não suportado)`);
  }
  const cabecalhos = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" };
  if (!indexar) cabecalhos["X-Robots-Tag"] = "noindex, nofollow";
  const robots = indexar ? "User-agent: *\\nAllow: /\\n" : "User-agent: *\\nDisallow: /\\n";
  return `// Gerado por deploy/workers/publicar.mjs — não edite à mão.
const ARQUIVOS = ${JSON.stringify(mapa)};
const CABECALHOS = ${JSON.stringify(cabecalhos)};
const DECODIFICADOS = new Map();
function corpoDe(caminho, [, dados, binario]) {
  if (!binario) return dados;
  if (!DECODIFICADOS.has(caminho)) DECODIFICADOS.set(caminho, Uint8Array.from(atob(dados), (c) => c.charCodeAt(0)));
  return DECODIFICADOS.get(caminho);
}
export default {
  async fetch(req) {
    const url = new URL(req.url);
    let caminho = decodeURIComponent(url.pathname);
    if (caminho.endsWith("/")) caminho += "index.html";
    if (caminho === "/robots.txt" && !ARQUIVOS[caminho]) return new Response("${robots}", { headers: { "content-type": "text/plain", ...CABECALHOS } });
    const item = ARQUIVOS[caminho];
    if (!item && ARQUIVOS[caminho + "/index.html"]) return Response.redirect(url.origin + caminho + "/", 301);
    if (!item) return new Response("Página não encontrada", { status: 404, headers: { "content-type": "text/plain; charset=utf-8", ...CABECALHOS } });
    const cache = item[0].startsWith("text/html") ? "no-cache" : "public, max-age=86400";
    return new Response(corpoDe(caminho, item), { headers: { "content-type": item[0], "cache-control": cache, ...CABECALHOS } });
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

// Uso 1: node publicar.mjs [pasta-ou-nome]          → sites de sites.json
// Uso 2: node publicar.mjs --pasta CAMINHO --nome NOME [--indexar]
//        → publica qualquer pasta (ex.: um site de cliente real)
const args = process.argv.slice(2);
const opcao = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
let alvos;
if (opcao("--pasta")) {
  if (!opcao("--nome") || !/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(opcao("--nome"))) { console.error("Informe --nome com letras minúsculas, números e hífen."); process.exit(1); }
  alvos = [{ caminho: opcao("--pasta"), nome: opcao("--nome"), indexar: args.includes("--indexar") }];
} else {
  const { sites } = JSON.parse(readFileSync(join(AQUI, "sites.json"), "utf8"));
  alvos = sites.filter((s) => !args[0] || s.pasta === args[0] || s.nome === args[0])
    .map((s) => ({ caminho: join(REPO, "sites", s.pasta), nome: s.nome, indexar: !!s.indexar }));
}
let subdominio = null;
try { subdominio = (await api("/subdomain", { method: "GET" })).subdomain; } catch { /* sem permissão para ler: tudo bem */ }

for (const { caminho, nome, indexar } of alvos) {
  process.stdout.write(`→ ${nome} (${relative(process.cwd(), caminho) || caminho}) ... `);
  const codigo = codigoDoWorker(caminho, indexar);
  const form = new FormData();
  form.append("metadata", new Blob([JSON.stringify({ main_module: "worker.js", compatibility_date: "2025-01-01" })], { type: "application/json" }), "metadata.json");
  form.append("worker.js", new Blob([codigo], { type: "application/javascript+module" }), "worker.js");
  await api(`/scripts/${nome}`, { method: "PUT", body: form });
  await api(`/scripts/${nome}/subdomain`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ enabled: true, previews_enabled: false }) });
  console.log("ok" + (subdominio ? `  https://${nome}.${subdominio}.workers.dev/` : ""));
}
