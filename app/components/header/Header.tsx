import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { toggleSidebar } from '~/lib/stores/sidebar';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { LphLogo } from '~/components/ui/LphLogo';

export function Header() {
  const chat = useStore(chatStore);

  return (
    <header className="relative flex items-center px-4 h-[var(--header-height)]">
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary">
        {/*
         * Era um ícone decorativo com cara de botão. Agora abre e fecha os chats de verdade.
         * `bg-transparent` explícito: sem ele o Chrome pinta o ButtonFace do sistema,
         * um cinza sólido no tema escuro — a "caixa cinza" atrás do glifo.
         */}
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-8 h-8 -ml-1.5 rounded-md bg-transparent text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive transition-colors"
          aria-label="Abrir ou fechar os chats"
          title="Chats"
        >
          <span className="i-ph:sidebar-simple text-xl" />
        </button>

        {/*
         * Só o símbolo: o wordmark repetia o que o topo inteiro já diz, e disputava
         * espaço com a barra lateral, que passa por baixo dele quando abre.
         */}
        <a href="/" className="flex items-center" aria-label="Leads Per Hour — início">
          <LphLogo symbolOnly />
        </a>

        {/* A barra "/" vem de PER / HOUR: é o marcador de contexto da marca. */}
        <span className="hidden sm:inline lph-slash-label">Studio</span>
      </div>
      {chat.started && ( // Display ChatDescription and HeaderActionButtons only when the chat has started.
        <>
          <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>
          <ClientOnly>
            {() => (
              <div className="">
                <HeaderActionButtons chatStarted={chat.started} />
              </div>
            )}
          </ClientOnly>
        </>
      )}
      {/*
       * Régua espectral — assinatura cromática da marca, uma única vez por vista.
       * Fica no fio inferior do topo; nunca uma borda laranja chapada.
       */}
      <div
        className={classNames('absolute bottom-0 left-0 right-0 lph-rule-brand transition-opacity duration-300', {
          'opacity-0': !chat.started,
          'opacity-100': chat.started,
        })}
      />
    </header>
  );
}
