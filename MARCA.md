# Identidade Leads Per Hour neste projeto

Este é o [bolt.diy](https://github.com/stackblitz-labs/bolt.diy) com a identidade
oficial da Leads Per Hour (versão 2026) aplicada. Este documento existe para que
um `git pull` do upstream não desfaça a marca sem que se perceba.

## Onde a marca vive

| Arquivo | O que carrega |
| --- | --- |
| `uno.config.ts` | Paleta. Todas as rampas de cor do Tailwind/Uno apontam para as cores da marca. Fontes `sans` (Inter) e `display` (Switzer). |
| `app/styles/variables.scss` | Tokens `--bolt-elements-*` nos dois temas, além das variáveis `--lph-*` (cores, gradientes, fontes). |
| `app/styles/index.scss` | Tipografia base, atmosfera de fundo e as assinaturas: `.lph-rule-brand`, `.lph-slash-label`, `.lph-num`, `.lph-live-bolt`. |
| `app/components/ui/LphLogo.tsx` | Lockup oficial (símbolo SVG + wordmark em texto). |
| `app/components/header/Header.tsx` | Topo com o lockup e a régua espectral. |
| `public/fonts/` | Switzer e Inter servidas localmente + `lph-fonts.css`. |
| `public/lph-*.svg`, `favicon.ico`, `apple-touch-icon.png`, `social_preview_index.jpg` | Ativos de marca. |

## As regras que a paleta impõe

O upstream espalha as famílias padrão do Tailwind (`purple-500`, `blue-500`,
`gray-900`…) por centenas de arquivos. Em vez de reescrever todos, `uno.config.ts`
redireciona cada família para a cor de marca equivalente:

- `gray`, `slate`, `zinc`, `neutral`, `stone` → rampa **Azul Noite**
- `accent` → **Laranja Chama** (`#F2552C`)
- `purple`, `violet`, `indigo`, `fuchsia`, `blue`, `sky`, `cyan`, `teal` → **Lago
  Refletido / Verde água**, os frios da marca
- `pink`, `rose` → família quente (Chama/Rubi)
- `red` → **Rubi** (`#D8321A`) · `green`, `emerald`, `lime` → verde de sucesso ·
  `orange`, `amber`, `yellow` → âmbar de alerta

Consequência prática: **o Laranja Chama fica raro de propósito**. Ele aparece na
ação primária, no estado ativo e nas assinaturas — não em ícone secundário. Se
você precisa de um destaque que não é a ação principal da tela, use os frios.

## Assinaturas

Toda tela deve ter pelo menos duas:

1. **A barra `/`** — `.lph-slash-label`, vem de "PER **/** HOUR".
2. **A régua espectral** — `.lph-rule-brand`, **uma vez por vista** (hoje no fio
   inferior do topo, quando o chat começou).
3. **Números em Switzer** — `.lph-num` ou `font-display`.
4. **O raio vivo** — `.lph-live-bolt` como indicador de atividade.

## Tradução pt-BR

A interface inteira está em português do Brasil — configurações, workbench, chat,
deploy, sidebar e os toasts dos hooks. São ~1800 strings.

- **Glossário**: [GLOSSARIO-PT-BR.md](GLOSSARIO-PT-BR.md). É a régua: termo que
  está lá tem uma forma só. Consulte antes de traduzir qualquer string nova.
- **Verificador**: `python3 scripts/checa-traducao.py` varre o app e reporta
  strings visíveis ainda em inglês, termos com mais de uma tradução, e
  identificadores que possam ter sido traduzidos por engano. Rode depois de
  qualquer merge do upstream.

### O que fica em inglês de propósito

- **Prompts de sistema da LLM** (`app/lib/common/prompts/`, e a mensagem de
  setup em `app/utils/folderImport.ts` e `GitUrlImport.client.tsx`). São
  instruções para o modelo, não interface — traduzi-las degrada a geração.
- **Strings comparadas em código.** `app/lib/security.ts`, `app/routes/api.chat.ts`
  e `Chat.client.tsx` classificam erros com `message.includes('API key')` e
  `includes('rate limit')`. O texto casado vem da API do provedor, então tem
  de continuar em inglês. O usuário nunca vê essas strings cruas: o
  `LLMApiAlert` mostra título e explicação em pt-BR e deixa a mensagem
  original só como "Detalhes do erro".
- **Nomes de modelos de terceiros** (`Qwen3-Coder 480B (Best for Coding)` etc.)
  e os nomes próprios listados no glossário.
- **Comentários de código**, que seguem o idioma do arquivo vizinho (inglês).

### Ao traduzir algo novo

O erro que quebra a aplicação é traduzir um identificador — uma chave de objeto,
um valor comparado com `===`, um `id`, uma `key` de React. Traduza o valor,
nunca a chave; e antes de mexer numa string, procure se ela é comparada em
algum lugar.

## Correções sobre o upstream

Além da marca e da tradução, estes defeitos do bolt.diy foram corrigidos aqui.
Um merge do upstream pode trazê-los de volta.

### A tela ficava presa na home ao enviar a primeira mensagem

`runAnimation` em [Chat.client.tsx](app/components/chat/Chat.client.tsx) só marcava
`chatStarted` **depois** que a animação de saída do `#intro` resolvesse. Como logo
em seguida vêm `setFakeLoading`, a seleção de template e o streaming, o componente
re-renderizava no meio, o framer perdia o alvo e a promessa nunca resolvia — o
`#intro` parava em `opacity: 0.77`. O modelo respondia normalmente, mas o usuário
via a home com "Gerando a resposta" solto no meio, sem a própria mensagem e sem
workbench, como se tivesse travado. Agora há um limite de 400ms: a animação segue
sendo o caminho normal e deixa de ser o único.

### O site de referência não trazia logo nem cores

`api.web-search` removia `<header>`, `<nav>`, `<footer>` e `<style>` **antes** de
extrair o texto — jogava fora exatamente onde moram a marca e a paleta. Quem pedia
"um site como o X" recebia o assunto e nada da identidade, e o modelo inventava a
aparência. Agora [site-identity.ts](app/utils/site-identity.ts) busca a logo, o
favicon, o `theme-color`, a paleta (inclusive das folhas externas, ignorando os
tokens internos de framework) e as fontes, e manda tudo no prompt com instrução
explícita de usar os valores reais.

### O stream travado não avisava ninguém

O `StreamRecoveryManager` nunca era iniciado (`startMonitoring` não era chamado) e,
ao esgotar as tentativas, apenas apagava o próprio relógio. A interface ficava em
"Gerando a resposta" para sempre. Agora ele começa junto da requisição, tolera 90s
entre partes (45s derrubava geração legítima) e avisa o cliente ao desistir.

### Os modelos Claude 5 não funcionavam

O AI SDK v4 injeta `temperature: 0` em toda chamada em que ninguém definiu o
parâmetro, e `claude-sonnet-5` / `claude-opus-5` respondem
"`temperature` is deprecated for this model" — a requisição inteira morria. O
provider Anthropic remove o parâmetro por middleware antes da requisição.

## Ao atualizar o upstream

Depois de um merge, confira:

```bash
grep -rnE "#(9C7DFF|8A5FFF|7645E8|f97316|ff6b00)" app/ public/
```

Nenhum resultado esperado. Rode também `python3 scripts/checa-traducao.py`. Se aparecerem famílias de cor novas (`taupe-500`,
por exemplo), adicione o alias correspondente em `uno.config.ts` — senão a cor
genérica do Tailwind volta a aparecer na tela.

A régua espectral e o lockup são os pontos que um merge costuma sobrescrever:
`Header.tsx` foi reescrito por completo em relação ao upstream.

## Fontes

Servidas de `public/fonts/`, não por CDN. O Studio roda com COEP
`require-corp` (exigência do WebContainer), o que bloqueia recursos de
terceiros — o Fontshare não carrega. Não troque por `<link>` externo.

Régua completa da identidade: skill `id-leadsperhour`.

## Decisões de UX

A caixa de prompt do Studio foi refeita com base em medição, não em gosto: o
estudo em [`estudos/caixa-de-prompt.html`](estudos/caixa-de-prompt.html) registra
cada achado com o arquivo, a linha e o valor medido no navegador antes e depois.

Vale ler antes de mexer em `ChatBox`, `BaseChat` ou no `Workbench` — várias das
armadilhas de lá não são visíveis no código (a largura dimensionada para outra
tela, o `outline-none` que anula o foco da marca, o `useChat` que devolve um
array novo a cada render).
