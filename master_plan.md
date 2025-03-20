# Master Plan para Plataforma de Tradução Digital (master_plan.md)

## Visão Geral do Projeto

### Objetivo

Desenvolver uma plataforma digital de tradução que facilite a comunicação eficaz entre clientes que buscam traduções e tradutores qualificados. A plataforma visa atender viajantes, empresas globais, estudantes internacionais e qualquer pessoa que necessite de traduções instantâneas.

### Público-Alvo

- **Clientes**: Viajantes, empresas globais, estudantes internacionais.
- **Prestadores de Serviço**: Tradutores qualificados e disponíveis para atender as demandas da plataforma.
- **Administradores**: Responsáveis pela gestão da plataforma, tradutores e qualidade geral do serviço.

## Funcionalidades Principais

1. **Upload de Arquivos**
    - Suporte para formatos: PDF, DOCX, DOC, XLS, XLSX, PPT, JPG, PNG
    - Funcionalidade para contagem de palavras nos arquivos carregados.
2. **Sistema de Orçamento/Cotação**
    - Opções de orçamento direto para diferentes serviços: Tradução Juramentada, Tradução Técnica e Tradução Certificada.
    - Orçamento instantâneo, calculado de acordo com a regra de negócio.
3. **Cadastro e Seleção de Tradutores**
    - Processo seletivo com perguntas e testes para tradutores.
    - Sistema de ativação/desativação de tradutores com controle de acesso robusto.
4. **Ferramenta de Tradução e Revisão**
    - Integração com a API do DeepL para tradução automática.
    - Botão para iniciar a tradução com a IA(DeepL), localizado no card com detalhes da tradução na interface do tradutor.
    - Opções de revisão e edição diretamente na plataforma
5. **Interface do Usuário**
    - Design intuitivo e personalizável, com paleta de cores de acordo com a marca e layout user-friendly.
    - Dashboard com informações sobre traduções em andamento e concluídas.
    - Página para realizar o orçamento instantaneo
    - Lista de orçamentos 
    - Histórico de traduções concluídas
    - Status disponiveis: "Aguardando", "Pendente", "Concluído"
6. **Interface do Tradutor**
    - Dashboard com informações sobre orçamentos pendentes, traduções em andamento e concluídas.
    - Feed de orçamentos disponíveis para aceitação.
    - Lista de orçamentos aceitos com detalhes de cada item, botão para iniciar a tradução com IA(DeepL), botão para abrir o editor em rich test, botão para enviar arquivo finalizado.
    - Histórico de traduções concluidas 
7. **Interface do Administrador**
    - Dashboard com visão geral do sistema e métricas importantes.
    - Gerenciamento de tradutores (visualizar, ativar, desativar).
    - Visualização de logs de atividade para monitoramento de segurança.
8. **Controle de Acesso e Segurança**
    - Sistema de autenticação robusto com Supabase.
    - Verificação de papel do usuário (client, translator, inactive_translator, admin).
    - Fluxo de segurança para contas inativas:
        - Detecção de contas inativas durante o login
        - Logout forçado para usuários inativos
        - Redirecionamento para página dedicada de conta inativa
        - Mensagem clara sobre o status da conta e passos para reativação
    


## Considerações Técnicas

### Tecnologias e Ferramentas

#### Frontend
- **Framework Principal**: React 18 com TypeScript
- **Framework de UI**: 
  - Tailwind CSS para estilização
  - Radix UI para componentes base
  - Shadcn/ui para componentes estilizados
  - Framer Motion para animações
- **Roteamento**: React Router DOM
- **Gerenciamento de Formulários**: React Hook Form com Zod para validação
- **Visualização de Documentos**:
  - React PDF para visualização de PDFs
  - Mammoth.js para conversão de documentos DOCX

#### Backend
- **Banco de Dados e Autenticação**: Supabase
- **Servidor**: Express.js com TypeScript
- **Upload de Arquivos**: Uploadthing
- **Integração com APIs**:
  - Axios para requisições HTTP
  - DeepL API para tradução automática

#### Ferramentas de Desenvolvimento
- **Build Tool**: Vite
- **Linting e Type Checking**: ESLint e TypeScript
- **Estilização**: 
  - PostCSS
  - Tailwind CSS
  - Autoprefixer

#### Bibliotecas Auxiliares
- **Datas**: date-fns
- **UI/UX**:
  - Lucide React para ícones
  - Sonner para notificações toast
  - React Day Picker para seleção de datas
  - React Dropzone para upload de arquivos
  - Recharts para gráficos

### Estrutura e Segurança

- Garantir que a estrutura do banco de dados e a arquitetura do sistema sejam escaláveis e seguras.
- Implementar práticas de segurança para proteger dados sensíveis de clientes e tradutores.
- Sistema de RBAC (Role-Based Access Control) para controlar o acesso às diferentes partes do sistema.
- Monitoramento constante e logging de atividades sensíveis para auditoria de segurança.

## Desafios e Riscos

- **Integração com API**: Garantir que a integração com o DeepL e outras APIs funcione sem problemas.
- **Gestão de Tempo**: Manter-se dentro do cronograma, considerando que o desenvolvimento é feito por uma única pessoa.
- **Testes de Qualidade**: Assegurar que todas as funcionalidades sejam testadas e funcionem conforme o esperado antes do lançamento.
- **Segurança da Informação**: Garantir que dados sensíveis estejam protegidos e que haja controle adequado de acesso.

## Expectativas Futuras

- **Expansão de Funcionalidades**:
  - Suporte a novos idiomas e tipos de tradução
  - Sistema de reconhecimento automático de idioma
  - Integração com outras plataformas de tradução
- **Melhorias de UX/UI**:
  - Modo escuro
  - Personalização da interface do usuário
  - Aplicativo móvel
- **Recursos Avançados**:
  - Sistema de recomendação de tradutores baseado em histórico
  - Ferramentas avançadas de edição de documentos
  - Análise de sentimento e contexto para traduções mais precisas

## Implementações Recentes

- **Sistema de Gerenciamento de Tradutores Inativos**:
  - Implementação de verificação rigorosa de status do tradutor durante login
  - Página dedicada para contas inativas com informações claras
  - Mecanismo de logout forçado para tradutores inativos
  - Redirecionamento automático para evitar acesso não autorizado
  - Interface administrativa para facilitar a ativação/desativação de tradutores

- **Melhorias de Segurança**:
  - Logging detalhado de tentativas de login
  - Normalização de dados de usuário para evitar inconsistências
  - Verificações em múltiplas camadas para garantir controle de acesso
  - Mensagens de erro claras e informativas