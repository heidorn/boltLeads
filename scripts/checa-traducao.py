"""Confere a tradução das abas de configuração.

Roda três verificações independentes, porque cada uma pega um tipo de erro:
  1. restos  — strings visíveis que continuaram em inglês
  2. termos  — o mesmo termo inglês traduzido de formas diferentes
  3. quebras — identificadores que podem ter sido traduzidos por engano

Uso: python3 checa_traducao.py [raiz-do-repo]
"""

import os
import re
import sys
import json
import collections

RAIZ = sys.argv[1] if len(sys.argv) > 1 else '/Users/ricardoheidorn/Downloads/bolt'

# Alvos: por padrão o app inteiro; `--settings` restringe às abas de configuração.
if '--settings' in sys.argv:
    ALVOS = [os.path.join(RAIZ, 'app/components/@settings')]
else:
    ALVOS = [
        os.path.join(RAIZ, 'app/components'),
        os.path.join(RAIZ, 'app/routes'),
        os.path.join(RAIZ, 'app/lib'),
    ]

# Prompts de LLM não são interface — ficam em inglês de propósito.
IGNORAR = ('app/lib/common/prompts', 'app/lib/.server', '.spec.', '/test/')

# Nomes próprios e termos técnicos que devem permanecer em inglês.
PERMITIDOS = {
    'github', 'gitlab', 'netlify', 'vercel', 'supabase', 'ollama', 'lm studio',
    'openai', 'anthropic', 'google', 'hugging face', 'mcp', 'model context protocol',
    'docker', 'expo', 'webcontainer', 'react', 'vite', 'astro', 'next.js', 'node',
    'npm', 'pnpm', 'json', 'csv', 'pdf', 'url', 'api', 'http', 'https', 'oauth',
    'ssh', 'pat', 'id', 'uuid', 'token', 'endpoint', 'webhook', 'prompt', 'chat',
    'deploy', 'build', 'branch', 'commit', 'pull request', 'issue', 'fork', 'star',
    'push', 'clone', 'log', 'debug', 'cache', 'cookie', 'dashboard', 'workspace',
    'info', 'warn', 'error', 'trace', 'beta', 'status', 'avatar', 'backup',
    'localstorage', 'indexeddb', 'stars', 'forks', 'watchers', 'readme',
    'download', 'upload', 'preview', 'terminal', 'editor', 'code', 'setup',
    'default', 'developer', 'studio', 'proxy', 'host', 'porta', 'timeout',
}

# Detectar português é frágil (muita palavra sem acento). Detectamos inglês:
# se a string contém um token que só existe em inglês, ela não foi traduzida.
INGLES = {
    'the', 'of', 'your', 'you', 'this', 'that', 'these', 'those', 'with', 'and',
    'for', 'from', 'are', 'was', 'were', 'will', 'would', 'should', 'must',
    'please', 'failed', 'failure', 'success', 'successfully', 'loading',
    'connect', 'connected', 'connecting', 'disconnect', 'disconnected',
    'delete', 'deleted', 'deleting', 'save', 'saved', 'saving', 'cancel',
    'search', 'searching', 'refresh', 'refreshing', 'retry', 'enable',
    'disable', 'enabled', 'disabled', 'show', 'hide', 'select', 'selected',
    'create', 'created', 'creating', 'update', 'updated', 'updating',
    'remove', 'removed', 'removing', 'add', 'added', 'adding', 'view',
    'manage', 'edit', 'editing', 'close', 'open', 'opening', 'start',
    'started', 'starting', 'stop', 'stopped', 'running', 'file', 'files',
    'folder', 'folders', 'all', 'none', 'new', 'last', 'first', 'next',
    'previous', 'back', 'more', 'less', 'warning', 'unknown', 'never',
    'always', 'click', 'enter', 'name', 'settings', 'setting', 'key', 'keys',
    'get', 'set', 'use', 'using', 'make', 'made', 'need', 'needs', 'try',
    'again', 'here', 'there', 'now', 'when', 'what', 'how', 'why', 'which',
    'between', 'before', 'after', 'during', 'only', 'also', 'just', 'but',
    'than', 'then', 'into', 'out', 'over', 'under', 'about', 'above',
    'below', 'not', 'yes', 'no', 'available', 'unavailable', 'found',
    'missing', 'invalid', 'required', 'optional', 'empty', 'items', 'item',
    'details', 'settings', 'options', 'choose', 'apply', 'reset', 'clear',
    'copy', 'copied', 'download', 'upload', 'export', 'import', 'imported',
    'exported', 'sync', 'synced', 'syncing', 'test', 'testing', 'tested',
    'check', 'checking', 'checked', 'installed', 'install', 'installing',
    'ready', 'pending', 'complete', 'completed', 'finish', 'finished',
    'send', 'sent', 'sending', 'receive', 'received', 'read', 'unread',
    'write', 'writing', 'lock', 'locked', 'unlock', 'unlocked', 'expand',
    'collapse', 'toggle', 'switch', 'change', 'changed', 'changes', 'apply',
    'discard', 'confirm', 'continue', 'skip', 'ignore', 'dismiss', 'retry',
    'help', 'about', 'learn', 'soon', 'coming', 'browse', 'preview',
    'terminal', 'editor', 'code', 'run', 'stop', 'restart', 'reload',
    'is', 'be', 'been', 'being', 'has', 'have', 'had', 'does', 'did',
    'can', 'could', 'may', 'might', 'am',
}

# Palavras iguais ou quase iguais nos dois idiomas: não decidem nada sozinhas.
NEUTRAS = {
    'total', 'local', 'normal', 'central', 'global', 'final', 'geral',
    'error', 'info', 'debug', 'status', 'beta',
    # Palavras portuguesas que colidem com tokens ingleses da lista acima.
    'a', 'e', 'o', 'do', 'da', 'de', 'no', 'na', 'as', 'os', 'dos', 'das',
    'em', 'um', 'uma', 'se', 'ou', 'ao', 'aos', 'nos', 'nas', 'com', 'por',
    'sem', 'sob', 'ate', 'ser', 'ver', 'tem', 'ha', 'foi', 'era', 'sao',
    'item', 'itens', 'normal', 'nome', 'base', 'modo', 'lista', 'texto',
}

TOKEN = re.compile(r"[A-Za-zÀ-ÿ']+")


def esta_em_ingles(s: str) -> bool:
    tokens = [t.lower() for t in TOKEN.findall(s)]
    uteis = [t for t in tokens if t not in NEUTRAS and t not in PERMITIDOS]
    return any(t in INGLES for t in uteis)


# Extratores de string visível.
EXTRATORES = [
    ('atributo', re.compile(r'(?:title|placeholder|aria-label|alt)="([A-Z][^"{}]{2,})"')),
    ('toast', re.compile(r"toast\.(?:success|error|info|warning)\(\s*['\"]([A-Z][^'\"]{2,})['\"]")),
    ('jsx', re.compile(r'>\s*([A-Z][a-zA-Z][a-zA-Z \-\'/&,\.]{4,70})\s*<')),
    ('label', re.compile(r"\b(?:label|description|title|message|text)\s*:\s*['\"]([A-Z][^'\"]{3,})['\"]")),
]


def parece_portugues(s: str) -> bool:
    return bool(ACENTO.search(s) or PALAVRA_PT.search(s))


def eh_nome_proprio(s: str) -> bool:
    limpo = s.strip().lower().rstrip('.:')
    if limpo in PERMITIDOS:
        return True
    # Uma ou duas palavras que são todas termos permitidos.
    partes = [p for p in re.split(r'[\s/–—-]+', limpo) if p]
    return bool(partes) and all(p.strip('.,:()') in PERMITIDOS for p in partes)


def arquivos():
    vistos = set()
    for alvo in ALVOS:
        for root, _, names in os.walk(alvo):
            for n in names:
                if not n.endswith(('.tsx', '.ts')):
                    continue
                path = os.path.join(root, n)
                if any(ig in path for ig in IGNORAR) or path in vistos:
                    continue
                vistos.add(path)
                yield path


restos = collections.defaultdict(list)
por_arquivo = collections.Counter()

for path in arquivos():
    rel = os.path.relpath(path, RAIZ)
    src = open(path, encoding='utf-8').read()
    for tipo, rx in EXTRATORES:
        for m in rx.finditer(src):
            s = m.group(1).strip()
            if eh_nome_proprio(s) or not esta_em_ingles(s):
                continue
            linha = src[: m.start()].count('\n') + 1
            restos[rel].append({'linha': linha, 'tipo': tipo, 'texto': s})
            por_arquivo[rel] += 1

# ---- 2. consistência de terminologia -------------------------------------
# Rótulos curtos idênticos devem ter virado sempre a mesma coisa. Como não temos
# o par origem→destino, checamos o inverso: variantes pt-BR de um mesmo conceito.
CONCEITOS = {
    'desconectar': [r'\bDesconectar\b', r'\bEncerrar conexão\b', r'\bRemover conexão\b'],
    'conectar': [r'\bConectar\b', r'\bConectar-se\b', r'\bFazer conexão\b'],
    'excluir': [r'\bExcluir\b', r'\bApagar\b', r'\bDeletar\b'],
    'atualizar': [r'\bAtualizar\b', r'\bRecarregar\b', r'\bSincronizar\b'],
    'tentar-de-novo': [r'\bTentar de novo\b', r'\bTentar novamente\b', r'\bRepetir\b'],
    'carregando': [r'\bCarregando\b', r'\bCarregando\.\.\.\b'],
    'nao-foi-possivel': [r'\bNão foi possível\b', r'\bFalha ao\b', r'\bFalhou\b'],
    'configuracoes': [r'\bConfigurações\b', r'\bAjustes\b', r'\bPreferências\b'],
    'chave-api': [r'\bchave da API\b', r'\bchave de API\b', r'\bAPI key\b'],
}

variantes = {}
for conceito, padroes in CONCEITOS.items():
    achados = collections.Counter()
    for path in arquivos():
        src = open(path, encoding='utf-8').read()
        for p in padroes:
            n = len(re.findall(p, src))
            if n:
                achados[p.strip(r'\b')] += n
    if len(achados) > 1:
        variantes[conceito] = dict(achados)

# ---- 3. identificadores possivelmente traduzidos -------------------------
SUSPEITO_ID = re.compile(
    r"(?:===|!==|case\s+|\.includes\(|\bid:\s*|\bkey=\{?['\"]|\btype:\s*)['\"]([^'\"]*[áéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ][^'\"]*)['\"]"
)
suspeitos = []
for path in arquivos():
    rel = os.path.relpath(path, RAIZ)
    src = open(path, encoding='utf-8').read()
    for m in SUSPEITO_ID.finditer(src):
        linha = src[: m.start()].count('\n') + 1
        suspeitos.append({'arquivo': rel, 'linha': linha, 'valor': m.group(1)})

print('=' * 70)
print('1. STRINGS VISÍVEIS AINDA EM INGLÊS')
print('=' * 70)
total = sum(por_arquivo.values())
if not total:
    print('  nenhuma encontrada')
else:
    for rel, n in por_arquivo.most_common():
        print(f'\n  {rel}  ({n})')
        for r in restos[rel][:12]:
            print(f'    L{r["linha"]:<5} [{r["tipo"]:8}] {r["texto"][:70]}')
        if len(restos[rel]) > 12:
            print(f'    ... e mais {len(restos[rel]) - 12}')
print(f'\n  TOTAL: {total}')

print()
print('=' * 70)
print('2. TERMOS COM MAIS DE UMA TRADUÇÃO')
print('=' * 70)
if not variantes:
    print('  terminologia consistente')
else:
    for conceito, achados in variantes.items():
        print(f'  {conceito}: {achados}')

print()
print('=' * 70)
print('3. IDENTIFICADORES SUSPEITOS (acento onde deveria haver id/comparação)')
print('=' * 70)
if not suspeitos:
    print('  nenhum')
else:
    for s in suspeitos[:40]:
        print(f'  {s["arquivo"]}:{s["linha"]}  → "{s["valor"][:60]}"')
    print(f'\n  TOTAL: {len(suspeitos)}')

print()
print(json.dumps({'restos': total, 'variantes': len(variantes), 'suspeitos': len(suspeitos)}))
