import { globSync } from 'fast-glob';
import fs from 'node:fs/promises';
import { basename } from 'node:path';
import { defineConfig, presetIcons, presetUno, transformerDirectives } from 'unocss';

const iconPaths = globSync('./icons/*.svg');

const collectionName = 'bolt';

const customIconCollection = iconPaths.reduce(
  (acc, iconPath) => {
    const [iconName] = basename(iconPath).split('.');

    acc[collectionName] ??= {};
    acc[collectionName][iconName] = async () => fs.readFile(iconPath, 'utf8');

    return acc;
  },
  {} as Record<string, Record<string, () => Promise<string>>>,
);

/*
 * Paleta oficial Leads Per Hour (identidade 2026).
 *
 * - `noite`  — neutros frios derivados do Azul Noite (#1D262D); substituem o antigo `gray`.
 * - `accent` — Laranja Chama (#F2552C); acento raro, uma ação primária por vista.
 * - `cool`   — Lago Refletido / Verde água; os frios da marca (informação, Oráculo).
 *
 * As rampas `gray`, `purple`, `violet` e `indigo` continuam existindo porque o
 * bolt.diy as usa em centenas de lugares — aqui elas apontam para as cores da
 * marca, de modo que nenhum roxo ou cinza neutro sobreviva na interface.
 */
const BRAND = {
  chama: '#F2552C',
  rubi: '#D8321A',
  noite: '#1D262D',
  lago: '#203E49',
  agua: '#115E66',
  obsidiana: '#131313',
};

const NOITE_RAMP = {
  50: '#F7F9F9',
  100: '#EEF1F2',
  200: '#DDE3E5',
  300: '#C2CCD0',
  400: '#9AA7AD',
  500: '#6D7A81',
  600: '#4D5960',
  700: '#2A353D',
  800: '#1D262D',
  900: '#141B1F',
  950: '#0F1417',
};

/* Laranja Chama → Rubi. */
const CHAMA_RAMP = {
  50: '#FFF3F0',
  100: '#FFE4DD',
  200: '#FFC7BA',
  300: '#FCA28D',
  400: '#F57756',
  500: '#F2552C',
  600: '#DA4D28',
  700: '#D8321A',
  800: '#AB2814',
  900: '#7D1F10',
  950: '#451009',
};

/* Verde água → Lago Refletido: o contraponto frio do acento. */
const COOL_RAMP = {
  50: '#EEF7F7',
  100: '#D7ECEC',
  200: '#AED8DA',
  300: '#7CBCC0',
  400: '#4A9BA6',
  500: '#2A8A91',
  600: '#17727A',
  700: '#115E66',
  800: '#124B52',
  900: '#203E49',
  950: '#0F2A31',
};

/* Verde de sucesso (--ok da marca). */
const OK_RAMP = {
  50: '#EEFBF4',
  100: '#D4F5E3',
  200: '#A9EBC7',
  300: '#75DCA6',
  400: '#4FD18D',
  500: '#2FBF71',
  600: '#23A05D',
  700: '#1B7F4A',
  800: '#16613A',
  900: '#12492D',
  950: '#082A19',
};

/* Âmbar de alerta (--warn da marca). */
const WARN_RAMP = {
  50: '#FEF8EC',
  100: '#FCEDCE',
  200: '#FADB9D',
  300: '#F8C66A',
  400: '#F6B444',
  500: '#F5A623',
  600: '#D4870F',
  700: '#A8690A',
  800: '#7E4F0C',
  900: '#5C3A0B',
  950: '#331F05',
};

const BASE_COLORS = {
  white: '#FFFFFF',
  ...BRAND,
  gray: NOITE_RAMP,
  noiteScale: NOITE_RAMP,
  accent: CHAMA_RAMP,
  chamaScale: CHAMA_RAMP,
  cool: COOL_RAMP,

  /*
   * Aliases herdados do bolt.diy. O upstream espalha as famílias padrão do
   * Tailwind pela interface inteira; aqui cada uma aponta para a cor de marca
   * equivalente, de modo que nenhuma cor genérica sobreviva na tela.
   */

  // Roxos e azuis → frios da marca (Lago Refletido / Verde água).
  purple: COOL_RAMP,
  violet: COOL_RAMP,
  indigo: COOL_RAMP,
  fuchsia: COOL_RAMP,
  blue: COOL_RAMP,
  sky: COOL_RAMP,
  cyan: COOL_RAMP,
  teal: COOL_RAMP,

  // Neutros → rampa Azul Noite.
  slate: NOITE_RAMP,
  zinc: NOITE_RAMP,
  neutral: NOITE_RAMP,
  stone: NOITE_RAMP,

  green: OK_RAMP,
  emerald: OK_RAMP,
  lime: OK_RAMP,

  /* Âmbar de alerta (--warn da marca). */
  orange: WARN_RAMP,
  amber: WARN_RAMP,
  yellow: WARN_RAMP,

  /* Rosas → família quente da marca (Chama/Rubi). */
  pink: CHAMA_RAMP,
  rose: CHAMA_RAMP,

  /* Rubi: destrutivo e erro. */
  red: {
    50: '#FEF3F1',
    100: '#FDE3DE',
    200: '#FBC5BB',
    300: '#F79C8B',
    400: '#EF6A52',
    500: '#D8321A',
    600: '#C22D15',
    700: '#A12511',
    800: '#7E1E0E',
    900: '#5E170B',
    950: '#360D06',
  },
};

const COLOR_PRIMITIVES = {
  ...BASE_COLORS,
  alpha: {
    white: generateAlphaPalette(BASE_COLORS.white),
    gray: generateAlphaPalette(BASE_COLORS.gray[900]),
    noite: generateAlphaPalette(BRAND.noite),
    cool: generateAlphaPalette(BASE_COLORS.cool[500]),
    red: generateAlphaPalette(BASE_COLORS.red[500]),
    accent: generateAlphaPalette(BASE_COLORS.accent[500]),
  },
};

export default defineConfig({
  safelist: [...Object.keys(customIconCollection[collectionName] || {}).map((x) => `i-bolt:${x}`)],
  shortcuts: {
    'bolt-ease-cubic-bezier': 'ease-[cubic-bezier(0.4,0,0.2,1)]',
    'transition-theme': 'transition-[background-color,border-color,color] duration-150 bolt-ease-cubic-bezier',
    kdb: 'bg-bolt-elements-code-background text-bolt-elements-code-text py-1 px-1.5 rounded-md',
    'max-w-chat': 'max-w-[var(--chat-max-width)]',
    'max-w-prompt': 'max-w-[var(--prompt-max-width)]',

    /* Assinaturas da marca */
    'lph-display': 'font-display tracking-[-0.02em]',
    'lph-num': 'font-display tabular-nums tracking-[-0.02em]',
    'lph-hair': 'border-b border-bolt-elements-borderColor',
  },
  rules: [
    /**
     * This shorthand doesn't exist in Tailwind and we overwrite it to avoid
     * any conflicts with minified CSS classes.
     */
    ['b', {}],
  ],
  theme: {
    fontFamily: {
      /* Inter na interface, Switzer em títulos e números — regra fixa da marca. */
      sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      display: ['Switzer', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
    },
    colors: {
      ...COLOR_PRIMITIVES,
      bolt: {
        elements: {
          borderColor: 'var(--bolt-elements-borderColor)',
          borderColorActive: 'var(--bolt-elements-borderColorActive)',
          background: {
            depth: {
              1: 'var(--bolt-elements-bg-depth-1)',
              2: 'var(--bolt-elements-bg-depth-2)',
              3: 'var(--bolt-elements-bg-depth-3)',
              4: 'var(--bolt-elements-bg-depth-4)',
            },
          },
          textPrimary: 'var(--bolt-elements-textPrimary)',
          textSecondary: 'var(--bolt-elements-textSecondary)',
          textTertiary: 'var(--bolt-elements-textTertiary)',
          code: {
            background: 'var(--bolt-elements-code-background)',
            text: 'var(--bolt-elements-code-text)',
          },
          button: {
            primary: {
              background: 'var(--bolt-elements-button-primary-background)',
              backgroundHover: 'var(--bolt-elements-button-primary-backgroundHover)',
              text: 'var(--bolt-elements-button-primary-text)',
            },
            secondary: {
              background: 'var(--bolt-elements-button-secondary-background)',
              backgroundHover: 'var(--bolt-elements-button-secondary-backgroundHover)',
              text: 'var(--bolt-elements-button-secondary-text)',
            },
            danger: {
              background: 'var(--bolt-elements-button-danger-background)',
              backgroundHover: 'var(--bolt-elements-button-danger-backgroundHover)',
              text: 'var(--bolt-elements-button-danger-text)',
            },
          },
          item: {
            contentDefault: 'var(--bolt-elements-item-contentDefault)',
            contentActive: 'var(--bolt-elements-item-contentActive)',
            contentAccent: 'var(--bolt-elements-item-contentAccent)',
            contentDanger: 'var(--bolt-elements-item-contentDanger)',
            backgroundDefault: 'var(--bolt-elements-item-backgroundDefault)',
            backgroundActive: 'var(--bolt-elements-item-backgroundActive)',
            backgroundAccent: 'var(--bolt-elements-item-backgroundAccent)',
            backgroundDanger: 'var(--bolt-elements-item-backgroundDanger)',
          },
          actions: {
            background: 'var(--bolt-elements-actions-background)',
            code: {
              background: 'var(--bolt-elements-actions-code-background)',
            },
          },
          artifacts: {
            background: 'var(--bolt-elements-artifacts-background)',
            backgroundHover: 'var(--bolt-elements-artifacts-backgroundHover)',
            borderColor: 'var(--bolt-elements-artifacts-borderColor)',
            inlineCode: {
              background: 'var(--bolt-elements-artifacts-inlineCode-background)',
              text: 'var(--bolt-elements-artifacts-inlineCode-text)',
            },
          },
          messages: {
            background: 'var(--bolt-elements-messages-background)',
            linkColor: 'var(--bolt-elements-messages-linkColor)',
            code: {
              background: 'var(--bolt-elements-messages-code-background)',
            },
            inlineCode: {
              background: 'var(--bolt-elements-messages-inlineCode-background)',
              text: 'var(--bolt-elements-messages-inlineCode-text)',
            },
          },
          icon: {
            success: 'var(--bolt-elements-icon-success)',
            error: 'var(--bolt-elements-icon-error)',
            primary: 'var(--bolt-elements-icon-primary)',
            secondary: 'var(--bolt-elements-icon-secondary)',
            tertiary: 'var(--bolt-elements-icon-tertiary)',
          },
          preview: {
            addressBar: {
              background: 'var(--bolt-elements-preview-addressBar-background)',
              backgroundHover: 'var(--bolt-elements-preview-addressBar-backgroundHover)',
              backgroundActive: 'var(--bolt-elements-preview-addressBar-backgroundActive)',
              text: 'var(--bolt-elements-preview-addressBar-text)',
              textActive: 'var(--bolt-elements-preview-addressBar-textActive)',
            },
          },
          terminals: {
            background: 'var(--bolt-elements-terminals-background)',
            buttonBackground: 'var(--bolt-elements-terminals-buttonBackground)',
          },
          dividerColor: 'var(--bolt-elements-dividerColor)',
          loader: {
            background: 'var(--bolt-elements-loader-background)',
            progress: 'var(--bolt-elements-loader-progress)',
          },
          prompt: {
            background: 'var(--bolt-elements-prompt-background)',
          },
          sidebar: {
            dropdownShadow: 'var(--bolt-elements-sidebar-dropdownShadow)',
            buttonBackgroundDefault: 'var(--bolt-elements-sidebar-buttonBackgroundDefault)',
            buttonBackgroundHover: 'var(--bolt-elements-sidebar-buttonBackgroundHover)',
            buttonText: 'var(--bolt-elements-sidebar-buttonText)',
          },
          cta: {
            background: 'var(--bolt-elements-cta-background)',
            text: 'var(--bolt-elements-cta-text)',
          },
        },
      },
    },
  },
  transformers: [transformerDirectives()],
  presets: [
    presetUno({
      dark: {
        light: '[data-theme="light"]',
        dark: '[data-theme="dark"]',
      },
    }),
    presetIcons({
      warn: true,
      collections: {
        ...customIconCollection,
      },
      unit: 'em',
    }),
  ],
});

/**
 * Generates an alpha palette for a given hex color.
 *
 * @param hex - The hex color code (without alpha) to generate the palette from.
 * @returns An object where keys are opacity percentages and values are hex colors with alpha.
 *
 * Example:
 *
 * ```
 * {
 *   '1': '#FFFFFF03',
 *   '2': '#FFFFFF05',
 *   '3': '#FFFFFF08',
 * }
 * ```
 */
function generateAlphaPalette(hex: string) {
  return [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].reduce(
    (acc, opacity) => {
      const alpha = Math.round((opacity / 100) * 255)
        .toString(16)
        .padStart(2, '0');

      acc[opacity] = `${hex}${alpha}`;

      return acc;
    },
    {} as Record<number, string>,
  );
}
