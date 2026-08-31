import { useEffect, useRef, useState } from 'react';
import { classNames } from '~/utils/classNames';

/*
 * Gaveta das configurações do projeto — paleta, ferramentas, conexões.
 *
 * Elas ficavam na mesma fileira das ações de escrita, todas com o mesmo peso: oito
 * ícones sem rótulo, sem agrupamento, e nenhum dizendo o que carregava. Aqui saem da
 * barra e ganham nome, que é o que se decide uma vez por projeto — não a cada mensagem.
 */

interface LinhaProps {
  label: string;
  children: React.ReactNode;
}

export function ChatActionRow({ label, children }: LinhaProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-bolt-elements-item-backgroundActive transition-colors"
      onClick={(event) => {
        /* No botão o próprio componente trata; no resto da linha, o clique é delegado. */
        if ((event.target as HTMLElement).closest('button')) {
          return;
        }

        ref.current?.querySelector('button')?.click();
      }}
    >
      {children}
      <span className="text-sm text-bolt-elements-textSecondary whitespace-nowrap">{label}</span>
    </div>
  );
}

interface ChatActionsMenuProps {
  children: React.ReactNode;
}

export function ChatActionsMenu({ children }: ChatActionsMenuProps) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) {
      return undefined;
    }

    const foraDaGaveta = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(false);
      }
    };

    const noEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAberto(false);
      }
    };

    document.addEventListener('mousedown', foraDaGaveta);
    document.addEventListener('keydown', noEscape);

    return () => {
      document.removeEventListener('mousedown', foraDaGaveta);
      document.removeEventListener('keydown', noEscape);
    };
  }, [aberto]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-expanded={aberto}
        aria-label="Configurações do projeto"
        title="Paleta, ferramentas e conexões"
        className={classNames(
          'flex items-center justify-center w-7 h-7 rounded-md bg-transparent transition-colors',
          aberto
            ? 'text-bolt-elements-textPrimary bg-bolt-elements-item-backgroundActive'
            : 'text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive',
        )}
      >
        <span className="i-ph:sliders-horizontal text-xl" />
      </button>
      {aberto && (
        <div
          className={classNames(
            'absolute bottom-full left-0 mb-2 z-10 min-w-[220px] p-1',
            'rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 shadow-lg',
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
