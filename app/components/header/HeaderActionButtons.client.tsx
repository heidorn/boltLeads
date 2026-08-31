import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { chatStore } from '~/lib/stores/chat';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { DeployButton } from '~/components/deploy/DeployButton';

interface HeaderActionButtonsProps {
  chatStarted: boolean;
}

export function HeaderActionButtons({ chatStarted }: HeaderActionButtonsProps) {
  const [activePreviewIndex] = useState(0);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];
  const showWorkbench = useStore(workbenchStore.showWorkbench);

  const shouldShowButtons = activePreview;

  return (
    <div className="flex items-center gap-2">
      {/*
       * Alternador do editor — o par do botão de chats, do outro lado do topo.
       * O X que ficava dentro do painel só sabia fechar: quem fechasse não tinha
       * como trazer o editor de volta.
       */}
      {chatStarted && (
        <button
          onClick={() => {
            const proximo = !showWorkbench;

            /* Esconder os dois ao mesmo tempo deixaria a tela vazia. */
            if (!proximo) {
              chatStore.setKey('showChat', true);
            }

            workbenchStore.showWorkbench.set(proximo);
          }}
          className={classNames(
            'flex items-center justify-center w-8 h-8 rounded-md bg-transparent transition-colors',
            showWorkbench
              ? 'text-bolt-elements-textPrimary bg-bolt-elements-item-backgroundActive'
              : 'text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-bolt-elements-item-backgroundActive',
          )}
          aria-pressed={showWorkbench}
          aria-label={showWorkbench ? 'Esconder o editor' : 'Mostrar o editor'}
          title={showWorkbench ? 'Esconder o editor' : 'Mostrar o editor'}
        >
          <span className="i-ph:sidebar-simple text-xl -scale-x-100" />
        </button>
      )}

      {/* Deploy Button */}
      {shouldShowButtons && <DeployButton />}

      {/* Debug Tools */}
      {shouldShowButtons && (
        <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden text-sm">
          <button
            onClick={() =>
              window.open('https://github.com/stackblitz-labs/bolt.diy/issues/new?template=bug_report.yml', '_blank')
            }
            className="rounded-l-md items-center justify-center [&:is(:disabled,.disabled)]:cursor-not-allowed [&:is(:disabled,.disabled)]:opacity-60 px-3 py-1.5 text-xs bg-accent-500 text-white hover:text-bolt-elements-item-contentAccent [&:not(:disabled,.disabled)]:hover:bg-bolt-elements-button-primary-backgroundHover outline-accent-500 flex gap-1.5"
            title="Reportar problema"
          >
            <div className="i-ph:bug" />
            <span>Reportar problema</span>
          </button>
          <div className="w-px bg-bolt-elements-borderColor" />
          <button
            onClick={async () => {
              try {
                const { downloadDebugLog } = await import('~/utils/debugLogger');
                await downloadDebugLog();
              } catch (error) {
                console.error('Failed to download debug log:', error);
              }
            }}
            className="rounded-r-md items-center justify-center [&:is(:disabled,.disabled)]:cursor-not-allowed [&:is(:disabled,.disabled)]:opacity-60 px-3 py-1.5 text-xs bg-accent-500 text-white hover:text-bolt-elements-item-contentAccent [&:not(:disabled,.disabled)]:hover:bg-bolt-elements-button-primary-backgroundHover outline-accent-500 flex gap-1.5"
            title="Baixar log de debug"
          >
            <div className="i-ph:download" />
            <span>Log de debug</span>
          </button>
        </div>
      )}
    </div>
  );
}
