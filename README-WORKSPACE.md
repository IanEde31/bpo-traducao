# Área de Trabalho do Tradutor - Documentação

## Visão Geral

O Workspace do Tradutor é uma interface especializada que permite aos tradutores visualizar documentos originais e realizar traduções de forma eficiente. O ambiente é projetado para maximizar a produtividade com recursos como:

- Visualização lado a lado do documento original e da tradução
- Tradução automática assistida por IA via DeepL
- Salvamento automático do progresso
- Acompanhamento de progresso da tradução
- Finalização e envio de tradução

## Funcionalidades Principais

### 1. Visualização de Documentos

- **Pré-visualização de Arquivos**: Visualize arquivos em seu formato original
- **Modo Texto**: Para arquivos de texto, exibe o conteúdo para cópia fácil

### 2. Tradução Assistida

- **Tradução com IA**: Integração com DeepL para sugestões de tradução automática
- **Edição Manual**: Editor de texto completo para refinamento da tradução

### 3. Gerenciamento de Progresso

- **Salvamento Automático**: Salva o trabalho a cada 30 segundos
- **Indicador de Progresso**: Mostra o percentual de palavras traduzidas em relação ao total
- **Carregamento de Progresso**: Recupera automaticamente trabalhos anteriores

### 4. Entrega de Traduções

- **Finalização**: Envie a tradução final quando estiver pronta
- **Histórico**: Registra todas as entregas no histórico de traduções

## Acesso ao Workspace

O Workspace do Tradutor pode ser acessado de duas formas:

1. A partir da página **Minhas Traduções**, clicando no botão "Abrir Workspace" em qualquer tradução em andamento
2. Diretamente pela URL: `/translator/workspace/:requestId`

## Configuração Técnica

### Banco de Dados

- Tabela `translation_progress`: Armazena o progresso das traduções
- Relacionamento com a tabela `translations` via `translation_id`

### Armazenamento

- Bucket `arquivos_carregados`: Armazena os documentos originais
- Bucket `arquivos_traduzidos`: Armazena as traduções finalizadas

## Fluxo de Trabalho Recomendado

1. Aceite uma tradução disponível na plataforma
2. Abra o Workspace de tradução
3. Revise o documento original
4. Use a tradução assistida por IA como ponto de partida (opcional)
5. Edite e refine a tradução no editor
6. Finalize e envie quando estiver satisfeito com o resultado

## Considerações Futuras

- Integração com glossários e memórias de tradução
- Suporte para edição colaborativa
- Verificação ortográfica e gramatical avançada
- Métricas detalhadas de produtividade
