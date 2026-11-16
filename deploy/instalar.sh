#!/usr/bin/env bash
# =============================================================
# Prepara a VM da Oracle (Ubuntu 22.04/24.04) para servir os
# sites de demonstração com HTTPS automático (Caddy).
#
# Uso (dentro da pasta do repositório, na VM):
#   sudo bash deploy/instalar.sh
#       → sem domínio: usa o IP público + sslip.io
#         ex.: https://129-153-10-20.sslip.io/odonto/
#   sudo bash deploy/instalar.sh demo.seudominio.com
#       → com domínio: https://demo.seudominio.com/odonto/
#   sudo MODO=subdominios bash deploy/instalar.sh demo.seudominio.com
#       → um subdomínio por site: https://odonto.demo.seudominio.com
#
# Pode rodar de novo quando quiser: o script é idempotente.
# =============================================================
set -euo pipefail

[ "$(id -u)" -eq 0 ] || { echo "Rode com sudo: sudo bash deploy/instalar.sh"; exit 1; }

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOMINIO="${1:-}"
MODO="${MODO:-pastas}"          # pastas | subdominios
EMAIL="${EMAIL:-}"              # opcional: e-mail para avisos do Let's Encrypt

case "$MODO" in pastas|subdominios) ;; *) echo "MODO deve ser 'pastas' ou 'subdominios'"; exit 1;; esac

export DEBIAN_FRONTEND=noninteractive

echo "==> Instalando ferramentas básicas"
apt-get update -y
apt-get install -y curl gnupg debian-keyring debian-archive-keyring apt-transport-https git

if [ -z "$DOMINIO" ]; then
  IP="$(curl -fsS https://api.ipify.org)"
  DOMINIO="$(echo "$IP" | tr . -).sslip.io"
  echo "==> Sem domínio informado. Usando $DOMINIO (aponta para $IP)"
fi

echo "==> Instalando o Caddy (servidor web com HTTPS automático)"
if ! command -v caddy >/dev/null 2>&1; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor --yes -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi

echo "==> Liberando as portas 80 e 443 no firewall interno da VM"
# As imagens Ubuntu da Oracle vêm com regras de iptables que bloqueiam tudo além do SSH.
echo iptables-persistent iptables-persistent/autosave_v4 boolean true | debconf-set-selections
echo iptables-persistent iptables-persistent/autosave_v6 boolean true | debconf-set-selections
apt-get install -y iptables-persistent
for porta in 80 443; do
  iptables -C INPUT -p tcp --dport "$porta" -m state --state NEW -j ACCEPT 2>/dev/null \
    || iptables -I INPUT -p tcp --dport "$porta" -m state --state NEW -j ACCEPT
done
netfilter-persistent save

echo "==> Salvando a configuração em /etc/demos.conf"
cat > /etc/demos.conf <<EOF
# Configuração dos sites de demonstração (gerado por instalar.sh)
DOMINIO="$DOMINIO"
MODO="$MODO"
EMAIL="$EMAIL"
EOF

bash "$DIR/publicar.sh"
