/*
 * Extração da identidade visual de um site.
 *
 * O extrator original devolvia só texto corrido — e removia `<header>`, `<nav>`,
 * `<footer>` e `<style>` antes de extrair, ou seja, jogava fora exatamente onde
 * moram a logo e as cores. Quem pedia "um site como o lincros.com" recebia o
 * assunto do site e nenhuma pista da marca, e o modelo inventava a aparência.
 *
 * Aqui vamos atrás do que define a marca: a logo, a paleta, as fontes e as
 * imagens de destaque — para o modelo partir da identidade real, não de um
 * chute.
 */

export interface SiteColor {
  value: string;

  /** Quantas vezes a cor aparece no CSS. Serve de peso, não de verdade. */
  count: number;

  /** Nome da custom property que a declarou, quando veio de uma. */
  token?: string;
}

export interface SiteIdentity {
  logos: string[];
  favicon?: string;
  themeColor?: string;
  brandColors: SiteColor[];
  neutralColors: SiteColor[];
  fonts: string[];
  images: string[];
  siteName?: string;
}

/** Resolve href/src relativos contra a página, descartando o que não der. */
function absolutize(url: string, base: string): string | undefined {
  try {
    const resolved = new URL(url, base);

    if (resolved.protocol !== 'http:' && resolved.protocol !== 'https:') {
      return undefined;
    }

    return resolved.href;
  } catch {
    return undefined;
  }
}

function attr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return m ? m[1].trim() : undefined;
}

function meta(html: string, key: string, keyAttr: 'property' | 'name' = 'property'): string | undefined {
  const rx = new RegExp(`<meta[^>]*${keyAttr}=["']${key}["'][^>]*>`, 'i');
  const tag = html.match(rx)?.[0];

  if (tag) {
    return attr(tag, 'content');
  }

  // Alguns sites invertem a ordem dos atributos.
  const rxAlt = new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*${keyAttr}=["']${key}["']`, 'i');

  return html.match(rxAlt)?.[1]?.trim();
}

/* ---------- logos e imagens ---------- */

function extractLogos(html: string, base: string): { logos: string[]; favicon?: string } {
  const logos: string[] = [];
  let favicon: string | undefined;

  // <img> cujo src, alt, class ou id mencione logo/brand — a fonte mais confiável.
  for (const tag of html.match(/<img[^>]*>/gi) ?? []) {
    const src = attr(tag, 'src') || attr(tag, 'data-src');

    if (!src) {
      continue;
    }

    const pista = `${src} ${attr(tag, 'alt') ?? ''} ${attr(tag, 'class') ?? ''} ${attr(tag, 'id') ?? ''}`;

    if (/logo|brand|marca/i.test(pista)) {
      const abs = absolutize(src, base);

      if (abs && !logos.includes(abs)) {
        logos.push(abs);
      }
    }
  }

  // <svg> com logo no id/class não tem URL para citar, mas vale saber que existe.
  for (const tag of html.match(/<link[^>]*rel=["'][^"']*icon[^"']*["'][^>]*>/gi) ?? []) {
    const href = attr(tag, 'href');
    const abs = href ? absolutize(href, base) : undefined;

    if (!abs) {
      continue;
    }

    const rel = attr(tag, 'rel') ?? '';

    // apple-touch-icon costuma ser o símbolo em boa resolução.
    if (/apple-touch/i.test(rel)) {
      logos.unshift(abs);
    } else if (!favicon) {
      favicon = abs;
    }
  }

  /*
   * `og:logo` é a logo mesmo; `og:image` costuma ser a capa social (um print
   * da home, uma foto). Só entra como logo se nada melhor tiver aparecido.
   */
  const ogLogo = meta(html, 'og:logo');
  const ogImage = meta(html, 'og:image');

  for (const candidato of [ogLogo, logos.length === 0 ? ogImage : undefined]) {
    if (!candidato) {
      continue;
    }

    const abs = absolutize(candidato, base);

    if (abs && !logos.includes(abs)) {
      logos.push(abs);
    }
  }

  return { logos: logos.slice(0, 5), favicon };
}

function extractImages(html: string, base: string, logos: string[]): string[] {
  const imagens: string[] = [];

  for (const tag of html.match(/<img[^>]*>/gi) ?? []) {
    const src = attr(tag, 'src') || attr(tag, 'data-src');

    if (!src || /\.svg($|\?)/i.test(src)) {
      continue;
    }

    // Pixels de rastreamento e imagens de 1px não são conteúdo.
    if (/facebook\.com\/tr|google-analytics|googletagmanager|doubleclick|\/pixel|analytics|\.gif($|\?)/i.test(src)) {
      continue;
    }

    const largura = Number(attr(tag, 'width') ?? '0');
    const altura = Number(attr(tag, 'height') ?? '0');

    if ((largura > 0 && largura <= 2) || (altura > 0 && altura <= 2)) {
      continue;
    }

    const abs = absolutize(src, base);

    if (abs && !logos.includes(abs) && !imagens.includes(abs)) {
      imagens.push(abs);
    }
  }

  return imagens.slice(0, 8);
}

/* ---------- cores ---------- */

const HEX = /#(?:[0-9a-f]{3}|[0-9a-f]{6})\b/gi;
const RGB = /rgba?\(\s*\d+\s*[,\s]\s*\d+\s*[,\s]\s*\d+[^)]*\)/gi;

function hexToRgb(hex: string): [number, number, number] | undefined {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;

  if (full.length !== 6) {
    return undefined;
  }

  const n = parseInt(full, 16);

  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function parseRgb(value: string): [number, number, number] | undefined {
  const nums = value.match(/\d+(?:\.\d+)?/g);
  return nums && nums.length >= 3 ? [Number(nums[0]), Number(nums[1]), Number(nums[2])] : undefined;
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

/** Saturação HSL, 0–1. É o que separa a cor de marca do cinza de interface. */
function saturation([r, g, b]: [number, number, number]): number {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const l = (max + min) / 2;

  if (max === min) {
    return 0;
  }

  return l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
}

function normalizar(bruto: string): string | undefined {
  const rgb = bruto.startsWith('#') ? hexToRgb(bruto) : parseRgb(bruto);

  if (!rgb) {
    return undefined;
  }

  // Transparente puro não diz nada sobre a marca.
  if (/rgba/i.test(bruto) && /[,\s]\s*0\s*\)$/.test(bruto)) {
    return undefined;
  }

  return rgbToHex(rgb);
}

/**
 * Custom properties com cara de cor de marca. Um site que declara
 * `--color-primary: #0d47a1` está dizendo qual é a cor dele — vale mais que
 * qualquer contagem de frequência.
 */
function extractColorTokens(css: string): SiteColor[] {
  const tokens: SiteColor[] = [];
  const rx = /--([a-z0-9-]*(?:color|brand|primary|secondary|accent|theme)[a-z0-9-]*)\s*:\s*([^;}]+)[;}]/gi;
  let m: RegExpExecArray | null;

  while ((m = rx.exec(css)) !== null) {
    const nome = m[1];

    /*
     * Tailwind e afins despejam centenas de `--tw-*` e uma paleta inteira
     * (`--color-black`, `--color-gray-500`) no `:root`. Isso é o default do
     * framework, não a marca do site — e afogaria as cores que importam.
     */
    if (/^tw-/i.test(nome) || /^color-(black|white|transparent|current|inherit)$/i.test(nome)) {
      continue;
    }

    if (
      /^color-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d+$/i.test(
        nome,
      )
    ) {
      continue;
    }

    const valor = m[2].trim();
    const cor = valor.match(HEX)?.[0] ?? valor.match(RGB)?.[0];

    if (!cor) {
      continue;
    }

    const hex = normalizar(cor);

    if (!hex || tokens.some((t) => t.value === hex)) {
      continue;
    }

    // Um token que resolve para branco ou preto puro não identifica ninguém.
    const rgb = hexToRgb(hex);
    const brilho = rgb ? (rgb[0] + rgb[1] + rgb[2]) / 3 : 128;

    if (brilho > 246 || brilho < 9) {
      continue;
    }

    tokens.push({ value: hex, count: 0, token: `--${nome}` });
  }

  return tokens.slice(0, 12);
}

function extractColors(css: string): { brand: SiteColor[]; neutral: SiteColor[] } {
  const contagem = new Map<string, number>();

  for (const bruto of [...(css.match(HEX) ?? []), ...(css.match(RGB) ?? [])]) {
    const hex = normalizar(bruto);

    if (hex) {
      contagem.set(hex, (contagem.get(hex) ?? 0) + 1);
    }
  }

  const tokens = extractColorTokens(css);
  const brand: SiteColor[] = [];
  const neutral: SiteColor[] = [];

  // Tokens declarados entram primeiro: são intenção, não estatística.
  for (const t of tokens) {
    brand.push({ ...t, count: contagem.get(t.value) ?? 0 });
  }

  const ordenadas = [...contagem.entries()].sort((a, b) => b[1] - a[1]);

  for (const [hex, count] of ordenadas) {
    if (brand.some((c) => c.value === hex)) {
      continue;
    }

    const rgb = hexToRgb(hex);

    if (!rgb) {
      continue;
    }

    const sat = saturation(rgb);
    const [r, g, b] = rgb;
    const brilho = (r + g + b) / 3;

    // Branco e preto quase puros são estrutura, não identidade.
    const extremo = brilho > 246 || brilho < 9;

    if (sat >= 0.18 && !extremo) {
      if (brand.length < 10) {
        brand.push({ value: hex, count });
      }
    } else if (neutral.length < 6) {
      neutral.push({ value: hex, count });
    }
  }

  return { brand: brand.slice(0, 10), neutral };
}

/* ---------- fontes ---------- */

function extractFonts(html: string, css: string): string[] {
  const fontes: string[] = [];

  const registrar = (nome: string) => {
    const limpo = nome.replace(/["']/g, '').trim();

    /*
     * Pilhas de fonte trazem muito lixo: `var(--font-body)`, `ui-sans-serif`,
     * genéricas do CSS. Nada disso é o nome de uma fonte que dê para usar.
     */
    if (
      !limpo ||
      limpo.length > 40 ||
      limpo.includes('(') ||
      limpo.includes(')') ||
      /^(inherit|initial|unset|revert|none|auto)$/i.test(limpo) ||
      /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|emoji|math|fangsong)$/i.test(limpo) ||
      /^ui-[\w-]+$/i.test(limpo) ||
      /^-(apple|webkit|moz|ms)-/i.test(limpo) ||
      /^(blinkmacsystemfont|segoe ui|helvetica neue|apple color emoji|noto color emoji|arial|helvetica|times|courier)$/i.test(
        limpo,
      )
    ) {
      return;
    }

    if (!fontes.some((f) => f.toLowerCase() === limpo.toLowerCase())) {
      fontes.push(limpo);
    }
  };

  // Google Fonts declara a família na própria URL.
  for (const tag of html.match(/<link[^>]*fonts\.googleapis\.com[^>]*>/gi) ?? []) {
    const href = attr(tag, 'href') ?? '';

    for (const fam of href.matchAll(/family=([^&:;]+)/gi)) {
      registrar(decodeURIComponent(fam[1]).replace(/\+/g, ' '));
    }
  }

  for (const m of css.matchAll(/font-family\s*:\s*([^;}]+)[;}]/gi)) {
    // Só a primeira da pilha interessa: as outras são fallback.
    registrar(m[1].split(',')[0]);
  }

  for (const m of css.matchAll(/@font-face[^}]*font-family\s*:\s*([^;}]+)[;}]/gi)) {
    registrar(m[1].split(',')[0]);
  }

  return fontes.slice(0, 8);
}

/* ---------- montagem ---------- */

export function extractInlineCss(html: string): string {
  return (html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) ?? []).join('\n');
}

/** Folhas de estilo externas, para irmos buscar as cores que não estão inline. */
export function extractStylesheetUrls(html: string, base: string, limite = 3): string[] {
  const urls: string[] = [];

  for (const tag of html.match(/<link[^>]*>/gi) ?? []) {
    const rel = attr(tag, 'rel') ?? '';

    if (!/stylesheet/i.test(rel)) {
      continue;
    }

    const href = attr(tag, 'href');
    const abs = href ? absolutize(href, base) : undefined;

    if (abs && !/fonts\.googleapis\.com/i.test(abs) && !urls.includes(abs)) {
      urls.push(abs);
    }

    if (urls.length >= limite) {
      break;
    }
  }

  return urls;
}

export function buildSiteIdentity(html: string, css: string, base: string): SiteIdentity {
  const { logos, favicon } = extractLogos(html, base);
  const { brand, neutral } = extractColors(css);

  return {
    logos,
    favicon,
    themeColor: normalizar(meta(html, 'theme-color', 'name') ?? '') ?? undefined,
    brandColors: brand,
    neutralColors: neutral,
    fonts: extractFonts(html, css),
    images: extractImages(html, base, logos),
    siteName: meta(html, 'og:site_name'),
  };
}

/** Resumo em texto para ir junto do conteúdo no prompt. */
export function formatSiteIdentity(id: SiteIdentity): string {
  const linhas: string[] = [];

  if (id.siteName) {
    linhas.push(`Nome do site: ${id.siteName}`);
  }

  if (id.logos.length) {
    linhas.push(`Logo: ${id.logos.join(' , ')}`);
  }

  if (id.favicon) {
    linhas.push(`Favicon: ${id.favicon}`);
  }

  if (id.themeColor) {
    linhas.push(`Cor do tema (meta theme-color): ${id.themeColor}`);
  }

  if (id.brandColors.length) {
    const cores = id.brandColors.map((c) => (c.token ? `${c.value} (${c.token})` : c.value));
    linhas.push(`Cores da marca, da mais provável para a menos: ${cores.join(', ')}`);
  }

  if (id.neutralColors.length) {
    linhas.push(`Neutros e superfícies: ${id.neutralColors.map((c) => c.value).join(', ')}`);
  }

  if (id.fonts.length) {
    linhas.push(`Fontes: ${id.fonts.join(', ')}`);
  }

  if (id.images.length) {
    linhas.push(`Imagens da página: ${id.images.slice(0, 6).join(' , ')}`);
  }

  return linhas.join('\n');
}
