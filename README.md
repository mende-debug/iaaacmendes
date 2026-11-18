# Sites de demonstração para clientes

Modelos de sites prontos para mostrar a clientes, com **dados fictícios** e marcados como "Site de demonstração". Nenhum deles aparece no Google: todos têm `noindex` e o servidor envia `X-Robots-Tag: noindex`.

| # | Pasta | Nicho | Destaques |
|---|---|---|---|
| 1 | `sites/odonto` | Clínica odontológica | Tratamentos, equipe com CRO, agendamento pelo WhatsApp |
| 2 | `sites/barbearia` | Barbearia | Poste animado, tabela de preços, clube de assinatura |
| 3 | `sites/academia` | Academia | Grade de aulas por dia, planos, calculadora de IMC |
| 4 | `sites/restaurante` | Restaurante / hamburgueria | Cardápio por abas, sacola de pedido, reservas, eventos |
| 5 | `sites/cafeteria` | Cafeteria / padaria | Cardápio em lousa, sacola de pedido, encomendas |
| 6 | `sites/advogado` | Landing page de advogado | Foco em contato, segue o Provimento 205/2021 da OAB |
| 7 | `sites/advocacia` | Escritório de advocacia | Áreas, sócios, artigos, segue o Provimento 205/2021 da OAB |
| 8 | `sites/balcao47` | Cardápio digital (QR code de mesa) | Balcão 47: abas que acompanham a rolagem, busca, selos "Mais pedido" e "Serve N" |

<p>
<img src="docs/capturas/1-odonto.jpg" width="49%"> <img src="docs/capturas/2-barbearia.jpg" width="49%">
<img src="docs/capturas/3-academia.jpg" width="49%"> <img src="docs/capturas/4-restaurante.jpg" width="49%">
<img src="docs/capturas/5-cafeteria.jpg" width="49%"> <img src="docs/capturas/6-advogado.jpg" width="49%">
<img src="docs/capturas/7-advocacia.jpg" width="49%">
</p>

Cada site é **HTML, CSS e JavaScript puros**, sem build e sem dependências: abra o `index.html` no navegador e funciona.

## Como adaptar um site para um cliente

1. Abra `js/app.js` do modelo e edite o bloco `CONFIG` no topo: nome, WhatsApp (só dígitos, com DDI e DDD, ex.: `5511999998888`), endereço, horários. No restaurante e na cafeteria, o **cardápio inteiro** também fica no `CONFIG`.
2. Ajuste os textos do `index.html`, se precisar.
3. Troque os espaços de foto (blocos coloridos com "Foto do…") pelas fotos do cliente.
4. Cores e fontes ficam nas variáveis do início de `css/styles.css` (`:root { ... }`).

---

## Publicado na Cloudflare (grátis)

Cada site tem o próprio link, com o nome do estabelecimento:

| Site | Link |
|---|---|
| Aurora Odontologia | https://aurora-odontologia.demo-clientes.workers.dev |
| Dom Navalha Barbearia | https://dom-navalha-barbearia.demo-clientes.workers.dev |
| Forja Academia | https://forja-academia.demo-clientes.workers.dev |
| Casa Brasa | https://casa-brasa.demo-clientes.workers.dev |
| Grão & Prosa | https://grao-e-prosa.demo-clientes.workers.dev |
| Dr. Rafael Teixeira | https://rafael-teixeira-advogado.demo-clientes.workers.dev |
| Almeida & Torres Advogados | https://almeida-torres-advogados.demo-clientes.workers.dev |
| Balcão 47 (cardápio) | https://balcao47-cardapio.demo-clientes.workers.dev |

**Publicar ou atualizar esses links:** rode `node deploy/workers/publicar.mjs`, ou `node deploy/workers/publicar.mjs odonto` para um site só. O script precisa das variáveis `CLOUDFLARE_API_TOKEN` (permissão *Workers Scripts: Edit*) e `CLOUDFLARE_ACCOUNT_ID`. Os nomes dos links ficam em `deploy/workers/sites.json`.

**Índice com todos os sites juntos:** https://iaaacmendes.demo-clientes.workers.dev/ (cada site numa pasta: `/odonto/`, `/barbearia/` etc.).

**Onde ver os links no painel:** Cloudflare → **Workers & Pages** → clique no projeto → botão **Visit**, ou **Settings → Domains & Routes → workers.dev**.

A Cloudflare está ligada a este repositório. **Cada envio (`git push`) para a branch `main` republica tudo sozinho, em 1 a 2 minutos.** O arquivo `wrangler.jsonc` roda `deploy/montar-pages.sh`, que monta a pasta `dist` com os sites, a página-índice, a página 404, o `robots.txt` e o cabeçalho `X-Robots-Tag: noindex`.

**Demo para um cliente novo:** copie a pasta de um modelo com o nome do cliente (ex.: `sites/clinica-sorriso`), edite o `CONFIG` em `js/app.js` e envie para o GitHub. Ela fica em `…workers.dev/clinica-sorriso/` e aparece no índice automaticamente.

**Domínio próprio:** no painel da Cloudflare, abra o projeto → **Settings → Domains & Routes → Add → Custom domain**. O domínio precisa estar gerenciado pela Cloudflare (o cadastro é grátis).

---

## Alternativa: publicar numa VPS ou na Oracle Cloud (Always Free)

Os scripts abaixo funcionam em qualquer servidor Ubuntu: Oracle, Hetzner, Hostinger, DigitalOcean etc.

O servidor usa o **Caddy**, que gera e renova o HTTPS sozinho. Uma VM grátis da Oracle aguenta centenas de sites como estes.

### 1. Criar a conta
1. Acesse **oracle.com/cloud/free** e clique em *Start for free*.
2. Escolha a **região** com cuidado: ela não pode ser trocada depois. *Brazil East (São Paulo)* ou *Brazil Southeast (Vinhedo)* ficam mais perto dos seus clientes.
3. O cartão é pedido só para verificação. Recursos *Always Free* não são cobrados.

### 2. Criar a VM
1. No painel: **Menu → Compute → Instances → Create instance**.
2. **Image:** *Canonical Ubuntu 24.04* (ou 22.04).
3. **Shape:** *Ampere → VM.Standard.A1.Flex*, com 1 OCPU e 6 GB já sobram para estes sites. Se aparecer *Out of capacity*, tente outro *Availability domain* ou use *VM.Standard.E2.1.Micro*, que também é grátis.
4. **Networking:** deixe criar a VCN nova, com **Assign a public IPv4 address** marcado.
5. **SSH keys:** clique em *Generate a key pair for me* e **baixe a chave privada**. Sem ela você não entra na VM.
6. Clique em *Create* e anote o **Public IP address** que aparece.

### 3. Liberar as portas 80 e 443 na rede da Oracle
1. Na página da instância: **Primary VNIC → Subnet → Security Lists → Default Security List**.
2. **Add Ingress Rules**, duas vezes:
   - Source CIDR `0.0.0.0/0`, IP Protocol `TCP`, Destination Port `80`
   - Source CIDR `0.0.0.0/0`, IP Protocol `TCP`, Destination Port `443`

O firewall *interno* da VM é liberado pelo script de instalação.

### 4. Entrar na VM
No seu computador (Mac/Linux, ou PowerShell no Windows), troque o nome do arquivo da chave e o IP:

```bash
chmod 600 ~/Downloads/ssh-key-*.key
ssh -i ~/Downloads/ssh-key-*.key ubuntu@SEU_IP
```

### 5. Baixar este repositório na VM
Como o repositório é privado, crie uma **chave de acesso só de leitura** (deploy key):

```bash
ssh-keygen -t ed25519 -N "" -f ~/.ssh/github_demos
cat ~/.ssh/github_demos.pub
```

Copie a linha exibida e cadastre no GitHub: **repositório → Settings → Deploy keys → Add deploy key** (deixe *Allow write access* desmarcado). Depois:

```bash
printf 'Host github.com\n  IdentityFile ~/.ssh/github_demos\n' >> ~/.ssh/config
git clone git@github.com:SEU_USUARIO/demos-clientes.git
cd demos-clientes
```

### 6. Instalar e publicar
**Sem domínio** (usa o IP com sslip.io, com HTTPS de verdade):

```bash
sudo bash deploy/instalar.sh
```

**Com domínio:** crie no seu provedor de DNS um registro **A** de `demo.seudominio.com` apontando para o IP da VM e rode:

```bash
sudo bash deploy/instalar.sh demo.seudominio.com
```

No fim, o script mostra os endereços, por exemplo:

```
https://129-153-10-20.sslip.io/            ← índice com todos os sites
https://129-153-10-20.sslip.io/odonto/
https://129-153-10-20.sslip.io/barbearia/
...
```

**Um subdomínio por site** (ex.: `odonto.demo.seudominio.com`): crie no DNS um registro **A** curinga `*.demo.seudominio.com` para o IP, e rode:

```bash
sudo MODO=subdominios bash deploy/instalar.sh demo.seudominio.com
```

### 7. Criar uma demo para um cliente

```bash
sudo bash deploy/nova-demo.sh odonto clinica-sorriso
sudo nano /var/www/demos/clinica-sorriso/js/app.js
```

O primeiro comando publica `https://SEU_ENDERECO/clinica-sorriso/`. O segundo abre o `CONFIG` para você trocar nome, WhatsApp e endereço. Salve e recarregue a página: não precisa reiniciar nada.

Para remover:

```bash
sudo rm -r /var/www/demos/clinica-sorriso && sudo bash deploy/publicar.sh
```

### 8. Atualizar os modelos depois de mudanças no GitHub

```bash
cd ~/demos-clientes && git pull && sudo bash deploy/publicar.sh
```

As demos de clientes criadas com `nova-demo.sh` são mantidas.

### Problemas comuns
- **O site não abre (tempo esgotado):** confira as regras de entrada 80 e 443 do passo 3.
- **Erro de certificado logo após instalar:** aguarde 1 minuto. O Caddy emite o certificado no primeiro acesso.
- **Ver os logs do servidor:**

  ```bash
  sudo journalctl -u caddy -n 50 --no-pager
  ```

- **A VM foi recuperada pela Oracle por ficar ociosa:** contas grátis podem ter VMs paradas recuperadas. Mantenha este repositório atualizado: recriar tudo leva poucos minutos com os passos acima.

## Estrutura

```
sites/<modelo>/index.html   página
sites/<modelo>/css/         estilos (cores e fontes em :root)
sites/<modelo>/js/app.js    CONFIG do cliente + interações
deploy/instalar.sh          prepara a VM (Caddy, firewall) e publica
deploy/publicar.sh          copia os sites e gera a configuração do Caddy
deploy/nova-demo.sh         cria uma cópia de um modelo para um cliente
docs/capturas/              miniaturas usadas neste README
```
