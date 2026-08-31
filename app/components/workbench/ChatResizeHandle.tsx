import { useCallback, useEffect, useRef, useState } from 'react';
import { classNames } from '~/utils/classNames';

/*
 * Divisória entre a coluna do chat e o workbench.
 *
 * O workbench é posicionado por `--workbench-left` / `--workbench-width`, e as duas
 * derivam de `--chat-min-width`. Arrastar aqui mexe só nessa raiz — o resto do layout
 * recalcula sozinho, sem reestruturar o flex nem a animação de entrada do painel.
 */

const STORAGE_KEY = 'bolt.chatWidth';
const DEFAULT_WIDTH = 560;
const MIN_CHAT = 420;
const MIN_WORKBENCH = 480;
const STEP = 16;

function clampWidth(width: number) {
  const max = Math.max(MIN_CHAT, window.innerWidth - MIN_WORKBENCH);
  return Math.min(Math.max(Math.round(width), MIN_CHAT), max);
}

function applyWidth(width: number) {
  document.documentElement.style.setProperty('--chat-min-width', `${width}px`);
}

function readWidth() {
  const current = getComputedStyle(document.documentElement).getPropertyValue('--chat-min-width');
  return parseFloat(current) || DEFAULT_WIDTH;
}

interface ChatResizeHandleProps {
  visible: boolean;
}

export function ChatResizeHandle({ visible }: ChatResizeHandleProps) {
  const [dragging, setDragging] = useState(false);
  const widthRef = useRef(DEFAULT_WIDTH);

  // Restaura a largura escolhida antes, e a mantém dentro da janela atual.
  useEffect(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    const width = clampWidth(saved || DEFAULT_WIDTH);
    widthRef.current = width;
    applyWidth(width);

    const onResize = () => {
      const next = clampWidth(widthRef.current);

      if (next !== widthRef.current) {
        widthRef.current = next;
        applyWidth(next);
      }
    };

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  const commit = useCallback((width: number) => {
    const next = clampWidth(width);
    widthRef.current = next;
    applyWidth(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();

      /* O arrasto é seguido pelos listeners na janela; a captura é só um reforço. */
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // ponteiro já liberado pelo navegador — segue pelos listeners
      }

      const startX = event.clientX;
      const startWidth = readWidth();
      setDragging(true);

      /*
       * O cursor precisa ficar em col-resize e a seleção desligada durante o arrasto,
       * senão o ponteiro pisca ao passar sobre o texto das mensagens.
       */
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      /* Enquanto se arrasta, nada anima: o painel tem que seguir o cursor, não persegui-lo. */
      document.documentElement.dataset.resizing = 'true';

      const onMove = (moveEvent: PointerEvent) => {
        const next = clampWidth(startWidth + (moveEvent.clientX - startX));
        widthRef.current = next;
        applyWidth(next);
      };

      const onUp = () => {
        setDragging(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        delete document.documentElement.dataset.resizing;
        commit(widthRef.current);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [commit],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        commit(readWidth() - STEP);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        commit(readWidth() + STEP);
      } else if (event.key === 'Home') {
        event.preventDefault();
        commit(DEFAULT_WIDTH);
      }
    },
    [commit],
  );

  if (!visible) {
    return null;
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Largura da conversa — arraste, ou use as setas"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onDoubleClick={() => commit(DEFAULT_WIDTH)}
      title="Arraste para ajustar. Duplo clique volta ao padrão."
      className={classNames(
        'group fixed w-4 -ml-2 z-chat-resize cursor-col-resize',

        /*
         * O vão entre as duas colunas: o painel do workbench começa em
         * `--workbench-left` mas recua 1rem de padding, então a divisa que se enxerga
         * fica meio rem adiante. E a altura acompanha o painel, que não encosta
         * no topo nem no rodapé da janela.
         */
        'left-[calc(var(--workbench-left)+0.5rem)] top-[calc(var(--header-height)+1.2rem)] bottom-6',
        'transition-[left] duration-200 bolt-ease-cubic-bezier',
      )}
    >
      {/* O alvo tem 16px para o mouse encontrar; o que se vê é uma hairline que engrossa no hover. */}
      <div
        className={classNames(
          'absolute inset-y-0 left-1/2 -translate-x-1/2 transition-all duration-150',
          dragging
            ? 'w-0.5 bg-accent-500'
            : 'w-px bg-bolt-elements-borderColor group-hover:w-0.5 group-hover:bg-accent-500',
        )}
      />
    </div>
  );
}
