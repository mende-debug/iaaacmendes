#!/usr/bin/env bash
# =============================================================
# Monta a pasta para publicar no Cloudflare Pages (ou Netlify):
# todos os sites + página-índice + cabeçalhos "noindex".
#
# Uso: bash deploy/montar-pages.sh [pasta-de-saida]   (padrão: dist)
# Publicar: npx wrangler pages deploy dist --project-name demos-clientes
# =============================================================
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="${1:-$REPO/dist}"

rm -rf "$OUT"; mkdir -p "$OUT"
cp -r "$REPO"/sites/* "$OUT"/

# Nenhuma página indexada nos buscadores + cabeçalhos de segurança
cat > "$OUT/_headers" <<'EOF'
/*
  X-Robots-Tag: noindex, nofollow
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
EOF
printf 'User-agent: *\nDisallow: /\n' > "$OUT/robots.txt"

# Página-índice
{
  cat <<'HTML'
<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Sites de demonstração</title>
<style>
:root{color-scheme:light dark}body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;background:#f5f5f4;color:#1c1917}
main{max-width:760px;margin:0 auto;padding:48px 20px}h1{font-size:28px;margin:0 0 6px}p{color:#57534e;margin:0 0 28px}
ul{list-style:none;padding:0;margin:0;display:grid;gap:10px}a{display:flex;justify-content:space-between;gap:12px;padding:16px 18px;border-radius:12px;background:#fff;border:1px solid #e7e5e4;color:inherit;text-decoration:none}
a:hover{border-color:#a8a29e}small{color:#78716c}
@media (prefers-color-scheme:dark){body{background:#1c1917;color:#f5f5f4}p,small{color:#a8a29e}a{background:#292524;border-color:#44403c}}
</style></head><body><main><h1>Sites de demonstração</h1><p>Página de apoio. Não indexada nos buscadores.</p><ul>
HTML
  for dir in "$OUT"/*/; do
    s="$(basename "$dir")"; [ -f "$dir/index.html" ] || continue
    titulo="$(grep -o -m1 '<title>[^<]*</title>' "$dir/index.html" | sed -e 's/<[^>]*>//g' -e 's/&amp;/\&/g' || true)"
    printf '<li><a href="/%s/"><span>%s</span><small>%s</small></a></li>\n' "$s" "${titulo:-$s}" "$s"
  done
  echo '</ul></main></body></html>'
} > "$OUT/index.html"

echo "Pasta pronta em $OUT"
