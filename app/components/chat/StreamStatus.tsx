import { useEffect, useState } from 'react';
import { classNames } from '~/utils/classNames';

/*
 * O que acontece entre o template e a primeira letra da resposta.
 *
 * Antes não havia nada aqui: a última frase do template ficava congelada na tela
 * enquanto o modelo trabalhava, e um stream que morria no meio deixava exatamente a
 * mesma imagem. Não dava para distinguir "está gerando" de "morreu" sem abrir a aba
 * de rede — então agora um diz o tempo que já passou e o outro se anuncia.
 */

function formatarDuracao(ms: number) {
  const total = Math.floor(ms / 1000);
  const minutos = Math.floor(total / 60);
  const segundos = total % 60;

  return `${minutos}:${String(segundos).padStart(2, '0')}`;
}

interface AguardandoRespostaProps {
  desde: number;
}

export function AguardandoResposta({ desde }: AguardandoRespostaProps) {
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setAgora(Date.now()), 1000);

    /*
     * O Chrome estrangula timers em aba oculta, então o relógio congela quando se
     * troca de aba. Recalcular na volta faz ele se corrigir na hora em vez de
     * mostrar um tempo que parou de andar.
     */
    const aoVoltar = () => setAgora(Date.now());
    document.addEventListener('visibilitychange', aoVoltar);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, []);

  const decorrido = Math.max(0, agora - desde);

  return (
    <div
      className="flex items-center gap-2.5 py-2 text-sm text-bolt-elements-textSecondary"
      role="status"
      aria-live="polite"
    >
      {/* O raio é o indicador de atividade da marca, no lugar do spinner genérico. */}
      <span className="i-bolt:stars lph-live-bolt text-lg" />
      {/* "Gerando a resposta" já é dito pela barra de progresso; aqui o que falta é o tempo. */}
      <span>Aguardando o modelo</span>
      <span className="lph-num text-xs text-bolt-elements-textTertiary tabular-nums">{formatarDuracao(decorrido)}</span>
      {decorrido > 60_000 && (
        <span className="text-xs text-bolt-elements-textTertiary">— pedidos grandes levam alguns minutos</span>
      )}
    </div>
  );
}

interface StreamParadoProps {
  onRetry: () => void;
  onDispensar: () => void;
}

export function StreamParado({ onRetry, onDispensar }: StreamParadoProps) {
  return (
    <div
      className={classNames(
        'flex flex-wrap items-center gap-x-3 gap-y-2 py-3 px-3.5 rounded-lg text-sm',
        'border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2',
      )}
      role="alert"
    >
      <span className="i-ph:plugs text-lg text-bolt-elements-textSecondary shrink-0" />
      <div className="flex-1 min-w-0 text-bolt-elements-textSecondary">
        A resposta parou de chegar. Costuma ser o servidor reiniciando ou a conexão caindo no meio.
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onDispensar}
          className="px-2.5 py-1 rounded-md bg-transparent text-xs text-bolt-elements-textTertiary hover:text-bolt-elements-textSecondary transition-colors"
        >
          Dispensar
        </button>
        <button
          onClick={onRetry}
          className="px-3 py-1 rounded-md bg-accent-500 hover:bg-accent-600 text-white text-xs font-medium transition-colors"
        >
          Tentar de novo
        </button>
      </div>
    </div>
  );
}
