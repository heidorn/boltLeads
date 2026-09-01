# Glossário pt-BR — abas de configuração do Studio (Leads Per Hour)

Terminologia obrigatória. Se um termo estiver aqui, use exatamente esta forma.
Tom: ferramenta de trabalho — seco, direto, sem entusiasmo de assistente.

## Termos fixos

| Inglês | pt-BR |
| --- | --- |
| Settings | Configurações |
| Preferences | Preferências |
| Connection / Connect / Disconnect | Conexão / Conectar / Desconectar |
| Connected / Not connected | Conectado / Não conectado |
| Repository / Repositories | Repositório / Repositórios |
| Branch | branch (mantém) |
| Commit / Commits | commit / commits (mantém) |
| Deploy / Deployment | deploy / deploy (substantivo: "o deploy") |
| Deployments | deploys |
| Build | build (mantém) |
| Provider / Providers | Provedor / Provedores |
| Model / Models | Modelo / Modelos |
| API Key | chave da API |
| Token | token |
| Access token | token de acesso |
| Enable / Disable | Ativar / Desativar |
| Enabled / Disabled | Ativo / Desativado |
| Save / Saved | Salvar / Salvo |
| Cancel | Cancelar |
| Delete / Remove | Excluir / Remover |
| Edit | Editar |
| Refresh / Reload | Atualizar / Recarregar |
| Retry / Try again | Tentar de novo |
| Loading… | Carregando… |
| Search | Buscar |
| Filter | Filtrar |
| Export / Import | Exportar / Importar |
| Download / Upload | Baixar / Enviar |
| Copy / Copied | Copiar / Copiado |
| Logs / Event Logs | Registros |
| Log level | nível do registro |
| Notifications | Notificações |
| Mark all as read | Marcar todas como lidas |
| Profile | Perfil |
| Account | Conta |
| Username | Nome de usuário |
| Avatar | Avatar |
| Features | Recursos |
| Beta / Experimental | Beta / Experimental |
| Data Management | Dados |
| Storage | Armazenamento |
| Backup / Restore | Backup / Restaurar |
| Reset | Redefinir |
| Status | Status |
| Health / Healthy | Saúde / Saudável |
| Running / Stopped | Em execução / Parado |
| Environment variable | variável de ambiente |
| Setup / Setup Guide | Configuração / Guia de configuração |
| Server / Servers | Servidor / Servidores |
| Database | Banco de dados |
| Table / Tables | Tabela / Tabelas |
| Query | consulta |
| Project / Projects | Projeto / Projetos |
| Site / Sites | Site / Sites |
| Team | Time |
| Usage | Uso |
| Last updated | Atualizado em |
| Created / Updated | Criado / Atualizado |
| Never | Nunca |
| Unknown | Desconhecido |
| None | Nenhum |
| All | Todos (ou "Todas", conforme o gênero) |
| Success / Error / Warning / Info | Sucesso / Erro / Aviso / Informação |
| Failed to X | Não foi possível X |
| Something went wrong | Algo deu errado |
| No results found | Nada encontrado |
| Coming soon | Em breve |
| Learn more | Saiba mais |
| Get started | Começar |
| Advanced | Avançado |
| Optional / Required | Opcional / Obrigatório |
| Show / Hide | Mostrar / Ocultar |
| Select / Selected | Selecionar / Selecionado |
| Clear | Limpar |
| Apply | Aplicar |
| Close | Fechar |
| Back | Voltar |
| Next | Avançar |
| Confirm | Confirmar |
| Are you sure? | frase direta em vez de pergunta: "Essa ação não pode ser desfeita." |

## Nunca traduzir

Nomes próprios de produtos, serviços e tecnologias:

GitHub, GitLab, Netlify, Vercel, Supabase, Ollama, LM Studio, OpenAI, Anthropic,
Google, Hugging Face, MCP, Model Context Protocol, Docker, Expo, WebContainer,
React, Vite, Astro, Next.js, Node, npm, pnpm, JSON, CSV, PDF, URL, API, HTTP,
localStorage, IndexedDB, OAuth, SSH, PAT, ID, UUID, token, endpoint, webhook,
prompt, chat, deploy, build, branch, commit, pull request, issue, fork, star,
push, clone, log, debug, cache, cookie, dashboard, workspace.

Também não traduza siglas de nível de log (INFO, WARN, ERROR, DEBUG, TRACE) nem
nomes de campos de API.

## Estilo

- **Capitalização de frase**, nunca Title Case: "Provedores em nuvem", não
  "Provedores Em Nuvem". Títulos de aba e botões seguem a mesma regra.
- **Sem ponto final** em rótulos, botões e títulos curtos. Com ponto em frases
  descritivas completas.
- **Voz direta e impessoal**: "Não foi possível conectar" em vez de "Nós não
  conseguimos conectar". Evite "por favor", "desculpe", "ops".
- **Sem emoji** e sem exclamação em UI. `toast.success('Salvo')`, não
  `toast.success('Salvo com sucesso!')`.
- **Números e unidades** ficam como estão. Datas em pt-BR só se já houver
  formatação por locale; não introduza mudança de formato.
- Prefira a forma curta: "Conectar" em vez de "Conectar-se ao serviço".
