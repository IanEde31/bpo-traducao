# BPO Tradução - Plataforma de Serviços de Tradução

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Versão](https://img.shields.io/badge/Versão-2.0-blue)
![Licença](https://img.shields.io/badge/Licença-MIT-green)

## 📝 Sobre o Projeto

A Plataforma BPO Tradução é um sistema completo para gerenciamento de serviços de tradução, conectando clientes que precisam de traduções com tradutores qualificados. A plataforma gerencia todo o ciclo de vida do processo de tradução, desde o orçamento inicial até a entrega final do documento traduzido.

### Principais Recursos

- ✅ Sistema de orçamento instantâneo baseado no tipo de documento e contagem de palavras
- ✅ Upload e gerenciamento de documentos em múltiplos formatos (PDF, DOCX, etc.)
- ✅ Integração com a API DeepL para auxílio à tradução automática
- ✅ Painel dedicado para tradutores com visualização de pedidos disponíveis
- ✅ Área administrativa para gerenciamento de usuários e monitoramento de processos
- ✅ Sistema seguro de autenticação e controle de acesso baseado em papéis (RBAC)
- ✅ Suporte para traduções técnicas, juramentadas e certificadas

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Vite** como bundler e ferramenta de desenvolvimento
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes de UI
- **React Router DOM** para navegação
- **React Hook Form** com Zod para validação de formulários
- **Framer Motion** para animações
- **React PDF** e **Mammoth.js** para visualização e manipulação de documentos

### Backend e Infraestrutura
- **Supabase** para banco de dados PostgreSQL, autenticação e storage
- **Express.js** com Node.js para serviços de API
- **API DeepL** para serviços de tradução automática
- **Axios** para requisições HTTP

## 🧩 Arquitetura do Sistema

A plataforma é dividida em três módulos principais:

1. **Módulo Cliente**: Interface para usuários solicitarem orçamentos, enviarem documentos e acompanharem o status de suas traduções.

2. **Módulo Tradutor**: Interface para tradutores visualizarem pedidos disponíveis, aceitarem trabalhos, utilizarem ferramentas de tradução assistida e entregarem documentos finalizados.

3. **Módulo Administrativo**: Painel para administradores gerenciarem usuários, monitorarem pedidos e manterem a qualidade do serviço.

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 18 ou superior
- NPM ou Yarn
- Conta no Supabase
- Chave de API do DeepL

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/IanEde31/bpo-traducao.git
cd bpo-traducao
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas credenciais do Supabase e DeepL.

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

5. Para o servidor proxy DeepL (em um terminal separado)
```bash
cd api
npm install
node deepl-proxy.js
```

## 📋 Funcionalidades Detalhadas

### Para Clientes
- Cadastro e login seguros
- Solicitação de orçamentos com upload de arquivos
- Visualização de histórico de pedidos
- Acompanhamento do status de traduções em andamento
- Download de documentos traduzidos

### Para Tradutores
- Visualização de trabalhos disponíveis
- Interface de tradução com ferramentas de auxílio
- Integração com DeepL para sugestões de tradução
- Histórico de trabalhos realizados
- Perfil com estatísticas de produtividade

### Para Administradores
- Gestão completa de usuários
- Ativação/desativação de tradutores
- Monitoramento de pedidos e status
- Dashboard com métricas e análises
- Ferramentas de promoção e marketing

## 🔐 Segurança

A plataforma implementa diversas medidas de segurança:

- Autenticação segura via Supabase com JWT
- Row Level Security (RLS) para controle de acesso a dados
- Sistema de permissões baseado em papéis de usuário
- Armazenamento seguro de documentos com acesso controlado
- Proxy seguro para comunicação com APIs externas

## 🌐 Implantação

A aplicação está configurada para deploy em plataformas como Vercel ou Netlify, com configurações específicas para garantir o correto funcionamento das rotas e da integração com APIs.

## 📈 Roadmap

- [ ] Implementação de sistema de pagamentos integrado
- [ ] Suporte para mais idiomas e tipos de tradução
- [ ] Aplicativo móvel para acompanhamento de traduções
- [ ] Sistema de verificação e certificação avançado
- [ ] Análise de sentimento e contexto para traduções mais precisas

## 👥 Contribuição

Contribuições são bem-vindas! Por favor, leia nossas diretrizes de contribuição antes de submeter pull requests.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

---

Desenvolvido com ❤️ por Ian Ede | BPO Tradução © 2025
