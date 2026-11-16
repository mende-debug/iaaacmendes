#!/usr/bin/env bash
# =============================================================
# Copia os sites do repositório para /var/www/demos, gera a
# página-índice e a configuração do Caddy, e recarrega o servidor.
#
# Uso: sudo bash deploy/publicar.sh
# Rode sempre que atualizar o repositório (git pull) ou criar
# uma demo nova. Demos criadas com nova-demo.sh são mantidas.
# =============================================================
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONF="${CONF:-/etc/demos.conf}"
WWW="${WWW:-/var/www/demos}"
CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"

[ -f "$CONF" ] || { echo "Não encontrei $CONF. Rode antes: sudo bash deploy/instalar.sh"; exit 1; }
# shellcheck disable=SC1090
source "$CONF"
: "${DOMINIO:?DOMINIO não definido em $CONF}"
MODO="${MODO:-pastas}"

mkdir -p "$WWW"

echo "==> Copiando os modelos de sites"
for dir in "$REPO"/sites/*/; do
  slug="$(basename "$dir")"
  # copia para uma pasta nova e troca de uma vez (o site nunca fica pela metade)
  rm -rf "$WWW/.$slug.novo"
  cp -r "${dir%/}" "$WWW/.$slug.novo"
  rm -rf "$WWW/$slug"
  mv "$WWW/.$slug.novo" "$WWW/$slug"
done

# Lista de sites publicados (pastas com index.html)
sites=()
for dir in "$WWW"/*/; do
  [ -f "$dir/index.html" ] && sites+=("$(basename "$dir")")
done

url_de() {
  if [ "$MODO" = "subdominios" ]; then echo "https://$1.$DOMINIO/"; else echo "https://$DOMINIO/$1/"; fi
}

echo "==> Gerando a página-índice"
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
</style></head><body><main><h1>Sites de demonstração</h1><p>Página privada de apoio. Não indexada nos buscadores.</p><ul>
HTML
  for s in "${sites[@]}"; do
    titulo="$(grep -o -m1 '<title>[^<]*</title>' "$WWW/$s/index.html" | sed -e 's/<[^>]*>//g' -e 's/&amp;/\&/g' || true)"
    printf '<li><a href="%s"><span>%s</span><small>%s</small></a></li>\n' "$(url_de "$s")" "${titulo:-$s}" "$s"
  done
  echo '</ul></main></body></html>'
} > "$WWW/index.html"

echo "==> Gerando a configuração do Caddy ($CADDYFILE)"
bloco() { # $1 = endereço, $2 = pasta raiz
  cat <<EOF
$1 {
	root * $2
	encode zstd gzip
	file_server
	header {
		X-Robots-Tag "noindex, nofollow"
		X-Content-Type-Options "nosniff"
		Referrer-Policy "strict-origin-when-cross-origin"
		-Server
	}
	@html path *.html */
	header @html Cache-Control "no-cache"
	@assets path *.css *.js *.svg *.png *.jpg *.jpeg *.webp *.woff2
	header @assets Cache-Control "public, max-age=604800"
}

EOF
}
{
  echo "# Gerado por deploy/publicar.sh — não edite à mão, rode o script de novo."
  if [ -n "${EMAIL:-}" ]; then printf '{\n\temail %s\n}\n\n' "$EMAIL"; fi
  bloco "$DOMINIO" "$WWW"
  if [ "$MODO" = "subdominios" ]; then
    for s in "${sites[@]}"; do bloco "$s.$DOMINIO" "$WWW/$s"; done
  fi
} > "$CADDYFILE"

if command -v caddy >/dev/null 2>&1 && [ -z "${SEM_RECARREGAR:-}" ]; then
  caddy fmt --overwrite "$CADDYFILE" >/dev/null 2>&1 || true
  caddy validate --config "$CADDYFILE" --adapter caddyfile
  systemctl reload caddy || systemctl restart caddy
fi

echo
echo "Pronto! Sites publicados:"
echo "  Índice: https://$DOMINIO/"
for s in "${sites[@]}"; do echo "  $(url_de "$s")"; done
echo
echo "Na primeira vez, o certificado HTTPS pode levar alguns segundos para ser emitido."
