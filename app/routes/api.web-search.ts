import { json } from '@remix-run/cloudflare';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { isAllowedUrl } from '~/utils/url';
import { buildSiteIdentity, extractInlineCss, extractStylesheetUrls, formatSiteIdentity } from '~/utils/site-identity';

const MAX_CONTENT_LENGTH = 8000;

// Por folha de estilo. O suficiente para a paleta sem estourar o contexto.
const MAX_CSS_LENGTH = 200_000;

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '';
}

function extractMetaDescription(html: string): string {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i);

  if (match) {
    return match[1].trim();
  }

  // Try reverse attribute order
  const altMatch = html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);

  return altMatch ? altMatch[1].trim() : '';
}

function extractTextContent(html: string): string {
  /*
   * `header`, `nav` e `footer` ficam: é neles que aparecem o nome da marca, o
   * menu e as chamadas do rodapé. Removê-los custava justamente a estrutura que
   * alguém quer reproduzir ao pedir "um site como o X".
   */
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { url } = (await request.json()) as { url?: string };

    if (!url || typeof url !== 'string') {
      return json({ error: 'URL is required' }, { status: 400 });
    }

    if (!isAllowedUrl(url)) {
      return json({ error: 'URL is not allowed. Only public HTTP/HTTPS URLs are accepted.' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return json({ error: `Failed to fetch URL: ${response.status} ${response.statusText}` }, { status: 502 });
    }

    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return json({ error: 'URL must point to an HTML or text page' }, { status: 400 });
    }

    const html = await response.text();
    const title = extractTitle(html);
    const description = extractMetaDescription(html);
    const content = extractTextContent(html);

    /*
     * A paleta quase nunca está inline: mora nas folhas externas. Buscamos
     * algumas em paralelo, com timeout curto — se falharem, seguimos só com o
     * CSS inline em vez de derrubar a extração inteira.
     */
    let css = extractInlineCss(html);

    const folhas = extractStylesheetUrls(html, url).filter(isAllowedUrl);

    if (folhas.length) {
      const baixadas = await Promise.allSettled(
        folhas.map(async (href) => {
          const r = await fetch(href, { headers: FETCH_HEADERS, signal: AbortSignal.timeout(6_000) });

          if (!r.ok) {
            throw new Error(String(r.status));
          }

          return (await r.text()).slice(0, MAX_CSS_LENGTH);
        }),
      );

      for (const resultado of baixadas) {
        if (resultado.status === 'fulfilled') {
          css += '\n' + resultado.value;
        }
      }
    }

    const identity = buildSiteIdentity(html, css, url);

    return json({
      success: true,
      data: {
        title,
        description,
        content: content.length > MAX_CONTENT_LENGTH ? content.slice(0, MAX_CONTENT_LENGTH) + '...' : content,
        sourceUrl: url,
        identity,
        identitySummary: formatSiteIdentity(identity),
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      return json({ error: 'Request timed out after 10 seconds' }, { status: 504 });
    }

    console.error('Web search error:', error);

    return json({ error: error instanceof Error ? error.message : 'Não foi possível acessar a URL' }, { status: 500 });
  }
}
