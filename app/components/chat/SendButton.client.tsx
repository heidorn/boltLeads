import { classNames } from '~/utils/classNames';

interface SendButtonProps {
  /** Há algo para enviar: texto digitado ou arquivo anexado. */
  canSend: boolean;
  isStreaming?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

/*
 * Fica ancorado no rodapé da caixa, sempre no mesmo lugar.
 * Antes era `absolute` no canto superior direito do campo e só existia quando havia
 * texto: a ação principal aparecia do nada, e longe de todas as outras.
 */
export const SendButton = ({ canSend, isStreaming, disabled, onClick }: SendButtonProps) => {
  const inactive = disabled || (!canSend && !isStreaming);

  return (
    <button
      type="button"
      className={classNames(
        'flex justify-center items-center shrink-0 w-[34px] h-[34px] rounded-md bg-accent-500 text-white transition-all duration-150',
        inactive ? 'opacity-40 cursor-not-allowed' : 'hover:bg-accent-600',
      )}
      disabled={inactive}
      aria-label={isStreaming ? 'Parar a geração' : 'Enviar mensagem'}
      title={isStreaming ? 'Parar' : 'Enviar'}
      onClick={(event) => {
        event.preventDefault();

        if (!inactive) {
          onClick?.(event);
        }
      }}
    >
      <div className={classNames('text-lg', isStreaming ? 'i-ph:stop-circle-bold' : 'i-ph:arrow-right')} />
    </button>
  );
};
