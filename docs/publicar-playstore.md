# Publicar o Movra na Google Play Store

O app é uma **PWA**. A Play Store não aceita URL nem PWA diretamente — o caminho
é empacotar a PWA como **TWA** (Trusted Web Activity) com o **Bubblewrap**, o que
gera um `.aab` (Android App Bundle) para enviar ao Play Console.

Este documento é o passo a passo. O que já está pronto no código está marcado ✅;
o que depende de ação sua está marcado 🔧.

---

## 0. Pré-requisitos (uma vez)

- 🔧 **Conta Google Play Console** — US$ 25, pagamento único.
- 🔧 **Node 18+** e **JDK 17** instalados (o Bubblewrap usa o `keytool` do JDK).
- 🔧 **App implantado num domínio HTTPS fixo** (ex.: Vercel: `movra.app` ou
  `movra.vercel.app`). `localhost`/ngrok **não** servem — o TWA valida o
  domínio real.

---

## 1. Preencher a identidade legal 🔧

A política de privacidade precisa do responsável real (LGPD art. 9º; a Play recusa
apps de saúde sem isso). Os valores vêm de variáveis de ambiente — **não** ficam
no código (evita commitar CPF/CNPJ no repositório público).

Defina em **`.env.local`** (dev) e no **painel da Vercel** (produção):

```
NEXT_PUBLIC_LEGAL_CONTROLLER="João Robson ..."     # razão social ou nome completo
NEXT_PUBLIC_LEGAL_DOCUMENT="000.000.000-00"          # CPF ou CNPJ
NEXT_PUBLIC_LEGAL_CONTACT_EMAIL="privacidade@..."    # e-mail p/ direitos LGPD
NEXT_PUBLIC_LEGAL_UPDATED="29 de julho de 2026"
```

Enquanto não preencher, as páginas `/privacidade` e `/termos` mostram um aviso de
"documento incompleto" — e é aí que o Google recusa.

## 2. Gerar os ícones (inclui maskable) ✅ / 🔧

Os ícones — incluindo os **maskable** (Android recorta em círculo) — são gerados
a partir de `movra.png`:

```bash
node scripts/gen-icons.mjs
```

Já rodado; só rode de novo se trocar a logo.

## 3. Deploy do site 🔧

Faça o deploy no domínio HTTPS fixo com todas as variáveis de ambiente definidas
(Supabase, VAPID, `NEXT_PUBLIC_LEGAL_*`). Confirme que abrem publicamente:

- `https://SEU-DOMINIO/manifest.webmanifest`
- `https://SEU-DOMINIO/privacidade`
- `https://SEU-DOMINIO/excluir-conta`
- `https://SEU-DOMINIO/.well-known/assetlinks.json` → deve responder `[]` por
  enquanto (ainda sem fingerprint).

## 4. Empacotar com o Bubblewrap 🔧

```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://SEU-DOMINIO/manifest.webmanifest
```

No assistente:

- **Application ID / package name**: algo como `br.com.movra.app` (guarde —
  é o `TWA_PACKAGE_NAME`).
- **Display mode**: `standalone` (o manifest já pede isso).
- **Signing key**: deixe o Bubblewrap gerar (`android.keystore`). **Guarde a
  keystore e a senha em local seguro** — perdê-la impede atualizar o app depois.
- Ao final, gere o pacote:

```bash
bubblewrap build
```

Isso produz o `app-release-bundle.aab` (envio à loja) e um `.apk` de teste.

## 5. Vincular o app ao site (assetlinks) 🔧

Pegue o **SHA-256** da sua chave de assinatura:

```bash
bubblewrap fingerprint   # ou: keytool -list -v -keystore android.keystore
```

Defina no ambiente de produção (Vercel) e faça **redeploy**:

```
TWA_PACKAGE_NAME=br.com.movra.app
TWA_SHA256_FINGERPRINT=AA:BB:CC:...   # cole o fingerprint
```

O endpoint `/.well-known/assetlinks.json` passa a devolver o vínculo real. ✅ (a
rota já existe — só depende dessas variáveis).

> ⚠️ Se você ativar o **Play App Signing** (recomendado pelo Google), o Google
> assina o app com **outra** chave. Nesse caso, pegue o SHA-256 em
> *Play Console → Configuração → Integridade do app* e inclua **os dois**
> fingerprints (upload + Google), separados por vírgula, em
> `TWA_SHA256_FINGERPRINT`.

## 6. Criar o app no Play Console 🔧

Em *Criar app* e nas seções obrigatórias:

- **Política de Privacidade**: `https://SEU-DOMINIO/privacidade`.
- **Exclusão de conta** (*Segurança dos dados → exclusão*): informe
  `https://SEU-DOMINIO/excluir-conta`. ✅ (a página já existe, é pública e explica
  os dois caminhos + o que é apagado).
- **Formulário "Segurança dos dados"** — declare de acordo com o app:
  - Coleta dados **pessoais** (nome, e-mail, telefone) e **de saúde/fitness**
    (limitações físicas, medidas, treinos). Marque **"Informações de saúde"**.
  - Uso: **funcionalidade do app** e **gerenciamento de conta**. **Não** para
    publicidade, **não** vendido/compartilhado com terceiros (só a Supabase como
    operadora de infraestrutura).
  - Criptografia em trânsito: **sim**. Há como pedir exclusão: **sim**.
- **Classificação de conteúdo** (questionário IARC): app de saúde/fitness, sem
  conteúdo sensível.
- **Público-alvo**: 16+ (o app já exige 16 anos). Não direcionado a crianças.
- **Categoria**: Saúde e fitness.

## 7. Teste fechado obrigatório (o gate que pega todo mundo) 🔧

Contas de desenvolvedor **pessoais** criadas recentemente precisam rodar um
**teste fechado com 12 testadores por 14 dias** antes de liberar a produção.
Crie a trilha de teste fechado, suba o `.aab`, convide 12 contas Google e aguarde
o período. (Contas de organização podem estar isentas.)

## 8. Notificações (lembretes) 🔧 — opcional

O Web Push funciona dentro do TWA no Android, mas **os lembretes só disparam** se
a infraestrutura de push estiver publicada (VAPID + Edge Function + agendamento).
Veja `docs/lembretes-push.md`. Sem isso, o app publica e roda normalmente — só o
lembrete fica inativo.

---

## Resumo do que já está no código ✅

- Manifest completo (`standalone`, `scope`, `id`, `categories`, ícones **any** +
  **maskable**).
- Ícones maskable gerados por `scripts/gen-icons.mjs`.
- Página pública **`/excluir-conta`** (exigência do Google).
- Endpoint **`/.well-known/assetlinks.json`** dirigido por env.
- Identidade legal via env (`NEXT_PUBLIC_LEGAL_*`), sem CPF/CNPJ no repositório.
- Exportar dados + excluir conta **dentro** do app (LGPD art. 18).
- Aviso de saúde nos Termos; consentimento de dados sensíveis no cadastro.

## Falta (ação sua, fora do código) 🔧

1. Preencher `NEXT_PUBLIC_LEGAL_*` com dados reais.
2. Deploy num domínio HTTPS fixo.
3. Conta no Play Console (US$ 25).
4. `bubblewrap init/build` → `.aab` + fingerprint → env `TWA_*` → redeploy.
5. Preencher Segurança dos dados, classificação e público no Console.
6. Teste fechado (12 testadores / 14 dias).
