import React from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { classNames } from '~/utils/classNames';
import { PROVIDER_LIST } from '~/utils/constants';
import { ModelSelector } from '~/components/chat/ModelSelector';
import { APIKeyManager } from './APIKeyManager';
import { LOCAL_PROVIDERS } from '~/lib/stores/settings';
import FilePreview from './FilePreview';
import { ScreenshotStateManager } from './ScreenshotStateManager';
import { SendButton } from './SendButton.client';
import { IconButton } from '~/components/ui/IconButton';
import { toast } from 'react-toastify';
import { SpeechRecognitionButton } from '~/components/chat/SpeechRecognition';
import { SupabaseConnection } from './SupabaseConnection';
import { ExpoQrModal } from '~/components/workbench/ExpoQrModal';
import type { ProviderInfo } from '~/types/model';
import { ColorSchemeDialog } from '~/components/ui/ColorSchemeDialog';
import type { DesignScheme } from '~/types/design-scheme';
import type { ElementInfo } from '~/components/workbench/Inspector';
import { McpTools } from './MCPTools';
import { ChatActionsMenu, ChatActionRow } from './ChatActionsMenu';
import { WebSearch } from './WebSearch.client';

interface ChatBoxProps {
  isModelSettingsCollapsed: boolean;
  setIsModelSettingsCollapsed: (collapsed: boolean) => void;
  provider: any;
  providerList: any[];
  modelList: any[];
  apiKeys: Record<string, string>;
  isModelLoading: string | undefined;
  onApiKeysChange: (providerName: string, apiKey: string) => void;
  uploadedFiles: File[];
  imageDataList: string[];
  textareaRef: React.RefObject<HTMLTextAreaElement> | undefined;
  input: string;
  handlePaste: (e: React.ClipboardEvent) => void;
  TEXTAREA_MIN_HEIGHT: number;
  TEXTAREA_MAX_HEIGHT: number;
  isStreaming: boolean;
  handleSendMessage: (event: React.UIEvent, messageInput?: string) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  chatStarted: boolean;
  exportChat?: () => void;
  qrModalOpen: boolean;
  setQrModalOpen: (open: boolean) => void;
  handleFileUpload: () => void;
  setProvider?: ((provider: ProviderInfo) => void) | undefined;
  model?: string | undefined;
  setModel?: ((model: string) => void) | undefined;
  setUploadedFiles?: ((files: File[]) => void) | undefined;
  setImageDataList?: ((dataList: string[]) => void) | undefined;
  handleInputChange?: ((event: React.ChangeEvent<HTMLTextAreaElement>) => void) | undefined;
  handleStop?: (() => void) | undefined;
  enhancingPrompt?: boolean | undefined;
  enhancePrompt?: (() => void) | undefined;
  onWebSearchResult?: (result: string) => void;
  chatMode?: 'discuss' | 'build';
  setChatMode?: (mode: 'discuss' | 'build') => void;
  designScheme?: DesignScheme;
  setDesignScheme?: (scheme: DesignScheme) => void;
  selectedElement?: ElementInfo | null;
  setSelectedElement?: ((element: ElementInfo | null) => void) | undefined;

  /** Um pedido de verdade para o placeholder — sorteado uma vez, no BaseChat. */
  exemploDePedido?: string;
}

export const ChatBox: React.FC<ChatBoxProps> = (props) => {
  return (
    <div
      className={classNames(
        'relative w-full mx-auto z-prompt',
        props.chatStarted
          ? /*
             * Com a conversa aberta a caixa é o piso da coluna, não um cartão sobre as
             * mensagens: fundo da página, sem moldura nem raio, e o respiro vem do padding.
             * A única moldura que sobra é a do campo — a que precisa existir.
             */
            'max-w-chat bg-bolt-elements-background-depth-1 pt-2 pb-3'
          : 'max-w-prompt bg-bolt-elements-background-depth-2 backdrop-blur p-3 rounded-lg border border-bolt-elements-borderColor',
      )}
    >
      <div>
        <ClientOnly>
          {() => (
            <div className={props.isModelSettingsCollapsed ? 'hidden' : ''}>
              <ModelSelector
                key={props.provider?.name + ':' + props.modelList.length}
                model={props.model}
                setModel={props.setModel}
                modelList={props.modelList}
                provider={props.provider}
                setProvider={props.setProvider}
                providerList={props.providerList || (PROVIDER_LIST as ProviderInfo[])}
                apiKeys={props.apiKeys}
                modelLoading={props.isModelLoading}
              />
              {(props.providerList || []).length > 0 &&
                props.provider &&
                !LOCAL_PROVIDERS.includes(props.provider.name) && (
                  <APIKeyManager
                    provider={props.provider}
                    apiKey={props.apiKeys[props.provider.name] || ''}
                    setApiKey={(key) => {
                      props.onApiKeysChange(props.provider.name, key);
                    }}
                  />
                )}
            </div>
          )}
        </ClientOnly>
      </div>
      <FilePreview
        files={props.uploadedFiles}
        imageDataList={props.imageDataList}
        onRemove={(index) => {
          props.setUploadedFiles?.(props.uploadedFiles.filter((_, i) => i !== index));
          props.setImageDataList?.(props.imageDataList.filter((_, i) => i !== index));
        }}
      />
      <ClientOnly>
        {() => (
          <ScreenshotStateManager
            setUploadedFiles={props.setUploadedFiles}
            setImageDataList={props.setImageDataList}
            uploadedFiles={props.uploadedFiles}
            imageDataList={props.imageDataList}
          />
        )}
      </ClientOnly>
      {props.selectedElement && (
        <div className="flex mx-1.5 gap-2 items-center justify-between rounded-lg rounded-b-none border border-b-none border-bolt-elements-borderColor text-bolt-elements-textPrimary flex py-1 px-2.5 font-medium text-xs">
          <div className="flex gap-2 items-center lowercase">
            <code className="bg-accent-500 rounded-4px px-1.5 py-1 mr-0.5 text-white">
              {props?.selectedElement?.tagName}
            </code>
            selecionado para inspeção
          </div>
          <button
            className="bg-transparent text-accent-500 pointer-auto"
            onClick={() => props.setSelectedElement?.(null)}
          >
            Limpar
          </button>
        </div>
      )}
      <div
        className={classNames(
          'relative shadow-xs border border-bolt-elements-borderColor backdrop-blur rounded-lg',

          /*
           * Foco visível: a moldura acende no Laranja Chama quando o campo está ativo.
           * O `outline-none` do textarea anulava a regra global de :focus-visible.
           */
          'transition-colors duration-150 focus-within:border-accent-500',
        )}
      >
        <textarea
          ref={props.textareaRef}
          className={classNames(
            'w-full pl-4 pt-4 pr-4 outline-none resize-none text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent text-sm',
            'transition-all duration-200',
          )}
          onDragEnter={(e) => {
            e.preventDefault();
            e.currentTarget.style.outline = '2px solid var(--lph-chama)';
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.outline = '2px solid var(--lph-chama)';
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.currentTarget.style.outline = '';
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.style.outline = '';

            const files = Array.from(e.dataTransfer.files);
            files.forEach((file) => {
              if (file.type.startsWith('image/')) {
                const reader = new FileReader();

                reader.onload = (e) => {
                  const base64Image = e.target?.result as string;
                  props.setUploadedFiles?.([...props.uploadedFiles, file]);
                  props.setImageDataList?.([...props.imageDataList, base64Image]);
                };
                reader.readAsDataURL(file);
              }
            });
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              if (event.shiftKey) {
                return;
              }

              event.preventDefault();

              if (props.isStreaming) {
                props.handleStop?.();
                return;
              }

              // ignore if using input method engine
              if (event.nativeEvent.isComposing) {
                return;
              }

              props.handleSendMessage?.(event);
            }
          }}
          value={props.input}
          onChange={(event) => {
            props.handleInputChange?.(event);
          }}
          onPaste={props.handlePaste}
          style={{
            minHeight: props.TEXTAREA_MIN_HEIGHT,
            maxHeight: props.TEXTAREA_MAX_HEIGHT,
          }}
          placeholder={
            props.chatMode === 'discuss'
              ? 'Pergunte sobre o projeto, a stack ou o próximo passo'
              : props.chatStarted || !props.exemploDePedido
                ? 'Peça uma mudança, um ajuste ou um recurso novo'
                : /*
                   * O H1 já diz a intenção; o campo repetia a mesma coisa em forma de
                   * pergunta. Quem chega não trava por falta de convite, trava por não
                   * saber como pedir — então aqui vai um pedido de verdade.
                   */
                  `Ex.: ${props.exemploDePedido.charAt(0).toLowerCase()}${props.exemploDePedido.slice(1)}`
          }
          title="Enter envia. Shift + Enter quebra a linha."
          translate="no"
        />
        {/*
         * `flex-wrap` e `min-w-0`: na coluna estreita da tela de edição a fileira de
         * ícones não cabia e empurrava o envio para fora da caixa, por baixo do editor.
         * Agora ela quebra a linha em vez de estourar.
         */}
        {/*
         * Dois grupos com sentido, no lugar de oito ícones do mesmo peso.
         * À esquerda o que entra na mensagem; à direita como ela será atendida —
         * e ali o que carrega estado diz o estado, em vez de ser só um glifo.
         * `flex-wrap`: na coluna estreita a barra quebra em vez de empurrar o envio
         * para fora da caixa.
         */}
        <div className="flex flex-wrap justify-between items-center gap-x-3 gap-y-2 text-sm p-4 pt-2">
          <div className="flex flex-wrap gap-1 items-center min-w-0">
            <IconButton title="Anexar imagem" className="transition-all" onClick={() => props.handleFileUpload()}>
              <div className="i-ph:paperclip text-xl"></div>
            </IconButton>
            <WebSearch onSearchResult={(result) => props.onWebSearchResult?.(result)} disabled={props.isStreaming} />
            <SpeechRecognitionButton
              isListening={props.isListening}
              onStart={props.startListening}
              onStop={props.stopListening}
              disabled={props.isStreaming}
            />
            <IconButton
              title="Melhorar o prompt"
              disabled={props.input.length === 0 || props.enhancingPrompt}
              className={classNames('transition-all', props.enhancingPrompt ? 'opacity-100' : '')}
              onClick={() => {
                props.enhancePrompt?.();
                toast.success('Prompt melhorado');
              }}
            >
              {props.enhancingPrompt ? (
                <div className="i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress text-xl animate-spin"></div>
              ) : (
                <div className="i-bolt:stars text-xl"></div>
              )}
            </IconButton>

            {/* Hairline: daqui para a direita não é mais a mensagem, é o projeto. */}
            <div className="w-px h-5 mx-1 bg-bolt-elements-borderColor" />

            <ChatActionsMenu>
              <ChatActionRow label="Paleta de design">
                <ColorSchemeDialog designScheme={props.designScheme} setDesignScheme={props.setDesignScheme} />
              </ChatActionRow>
              <ChatActionRow label="Ferramentas MCP">
                <McpTools />
              </ChatActionRow>
              <ChatActionRow label="Banco de dados">
                <SupabaseConnection />
              </ChatActionRow>
            </ChatActionsMenu>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* O modo vale para a primeira mensagem também: estava escondido antes da conversa começar. */}
            <IconButton
              title={props.chatMode === 'discuss' ? 'Conversando sobre o projeto' : 'Construindo o projeto'}
              className={classNames(
                'transition-all flex items-center gap-1.5 px-2',
                props.chatMode === 'discuss'
                  ? '!bg-bolt-elements-item-backgroundAccent !text-bolt-elements-item-contentAccent'
                  : 'bg-bolt-elements-item-backgroundDefault text-bolt-elements-item-contentDefault',
              )}
              onClick={() => {
                props.setChatMode?.(props.chatMode === 'discuss' ? 'build' : 'discuss');
              }}
            >
              <div className={props.chatMode === 'discuss' ? 'i-ph:chats text-lg' : 'i-ph:hammer text-lg'} />
              {props.chatMode === 'discuss' ? <span className="text-xs">Discutir</span> : <span />}
            </IconButton>

            {/* O modelo carrega estado, então mostra o estado — não só um caret. */}
            <IconButton
              title={`Provedor: ${props.provider?.name ?? '—'}\nModelo: ${props.model ?? '—'}`}
              className={classNames('transition-all flex items-center gap-1 px-2', {
                'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent':
                  !props.isModelSettingsCollapsed,
                'bg-bolt-elements-item-backgroundDefault text-bolt-elements-item-contentDefault':
                  props.isModelSettingsCollapsed,
              })}
              onClick={() => props.setIsModelSettingsCollapsed(!props.isModelSettingsCollapsed)}
              disabled={!props.providerList || props.providerList.length === 0}
            >
              <span className="text-xs max-w-[14ch] truncate">
                {(props.modelList.find((m) => m.name === props.model)?.label || props.model || '').replace(
                  /\s*\(.*\)\s*$/,
                  '',
                )}
              </span>
              <div className={`i-ph:caret-${props.isModelSettingsCollapsed ? 'up' : 'down'} text-sm`} />
            </IconButton>

            <ClientOnly>
              {() => (
                <SendButton
                  canSend={props.input.length > 0 || props.uploadedFiles.length > 0}
                  isStreaming={props.isStreaming}
                  disabled={!props.providerList || props.providerList.length === 0}
                  onClick={(event) => {
                    if (props.isStreaming) {
                      props.handleStop?.();
                      return;
                    }

                    props.handleSendMessage?.(event);
                  }}
                />
              )}
            </ClientOnly>
          </div>
          <ExpoQrModal open={props.qrModalOpen} onClose={() => props.setQrModalOpen(false)} />
        </div>
      </div>
    </div>
  );
};
