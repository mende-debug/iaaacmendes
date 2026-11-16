#!/usr/bin/env bash
# =============================================================
# Cria uma demo para um cliente a partir de um dos modelos.
#
# Uso: sudo bash deploy/nova-demo.sh <modelo> <nome-da-demo>
#   ex.: sudo bash deploy/nova-demo.sh odonto clinica-sorriso
#        → https://SEU_ENDERECO/clinica-sorriso/
#
# Modelos: odonto, barbearia, academia, restaurante, cafeteria,
#          advogado, advocacia
# Depois de criar, edite o CONFIG em
#   /var/www/demos/<nome-da-demo>/js/app.js
# (nome, WhatsApp, endereço, cardápio...) e os textos do index.html.
#
# Para remover uma demo:
#   sudo rm -r /var/www/demos/<nome-da-demo> && sudo bash deploy/publicar.sh
# =============================================================
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WWW="${WWW:-/var/www/demos}"
modelo="${1:-}"; nome="${2:-}"

if [ -z "$modelo" ] || [ -z "$nome" ]; then
  echo "Uso: sudo bash deploy/nova-demo.sh <modelo> <nome-da-demo>"
  echo "Modelos disponíveis: $(ls "$REPO/sites" | tr '\n' ' ')"
  exit 1
fi
[ -d "$REPO/sites/$modelo" ] || { echo "Modelo '$modelo' não existe. Disponíveis: $(ls "$REPO/sites" | tr '\n' ' ')"; exit 1; }
[[ "$nome" =~ ^[a-z0-9]([a-z0-9-]{0,40}[a-z0-9])?$ ]] || { echo "Use só letras minúsculas, números e hífen (ex.: clinica-sorriso)."; exit 1; }
[ -d "$REPO/sites/$nome" ] && { echo "'$nome' é o nome de um modelo. Escolha outro nome."; exit 1; }
[ -e "$WWW/$nome" ] && { echo "Já existe uma demo chamada '$nome' em $WWW."; exit 1; }

mkdir -p "$WWW"
cp -r "$REPO/sites/$modelo" "$WWW/$nome"
echo "==> Demo '$nome' criada a partir do modelo '$modelo'."
echo "    Edite: $WWW/$nome/js/app.js (CONFIG) e $WWW/$nome/index.html"
bash "$REPO/deploy/publicar.sh"
