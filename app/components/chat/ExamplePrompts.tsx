import React from 'react';

export const EXAMPLE_PROMPTS = [
  { text: 'Crie um painel de cadências com funil, taxa de resposta e reuniões' },
  { text: 'Monte uma landing page de captura de leads com formulário e validação' },
  { text: 'Faça uma calculadora de ROI de prospecção outbound' },
  { text: 'Crie uma tabela de leads com filtros por temperatura e busca' },
  { text: 'Construa um formulário de qualificação de ICP em várias etapas' },
  { text: 'Faça um app de checklist diário de prospecção em React' },
];

interface ExamplePromptsProps {
  prompts: { text: string }[];
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
}

/*
 * Seis pílulas quebravam em quatro fileiras irregulares e disputavam peso com a caixa.
 * Viraram três linhas de texto separadas por hairline, com a barra "/" da marca — a
 * mesma estrutura que o resto do produto usa para listar coisas.
 */
export function ExamplePrompts({ prompts, sendMessage }: ExamplePromptsProps) {
  return (
    <div
      id="examples"
      className="w-full max-w-prompt mx-auto mt-8 px-4 lg:px-0 border-t border-bolt-elements-borderColor"
      style={{ animation: '.25s ease-out 0s 1 _fade-and-move-in_g2ptj_1 forwards' }}
    >
      {prompts.map((prompt) => (
        <button
          key={prompt.text}
          onClick={(event) => sendMessage?.(event, prompt.text)}
          className="group flex items-center gap-3 w-full py-2.5 text-left bg-transparent border-b border-bolt-elements-borderColor text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
        >
          <span className="text-accent-500 text-xs font-bold shrink-0">/</span>
          <span className="text-sm">{prompt.text}</span>
          <span className="i-ph:arrow-right ml-auto shrink-0 text-sm opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  );
}
