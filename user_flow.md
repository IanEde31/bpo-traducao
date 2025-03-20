# Fluxo do Usuário - Plataforma de Tradução

```mermaid
graph TD
    %% Definição de Estilos
    classDef error fill:#FFE4E1,stroke:#FF0000
    classDef success fill:#98FB98,stroke:#006400
    classDef warning fill:#FFE4B5,stroke:#DAA520
    classDef process fill:#E6E6FA,stroke:#483D8B
    classDef validation fill:#F0F8FF,stroke:#4682B4
    classDef blocked fill:#FF6347,stroke:#8B0000

    %% Fluxo Inicial
    Start((Início)) --> A[Acesso à Plataforma]
    A --> B{Já tem conta?}
    
    %% Fluxo de Cadastro
    B -->|Não| C[Página de Cadastro]
    C --> C1{Tipo de Usuário}
    C1 -->|Cliente| C2[Formulário Cliente]
    C1 -->|Tradutor| C3[Formulário Tradutor]
    
    %% Cadastro Cliente
    C2 --> C2_1[Dados Pessoais]
    C2_1 --> C2_2{Pessoa Física/Jurídica}
    C2_2 -->|Física| C2_3[CPF + RG]
    C2_2 -->|Jurídica| C2_4[CNPJ + Docs]
    C2_3 & C2_4 --> C2_5[Validação Docs]
    C2_5 --> C2_6{Docs OK?}
    C2_6 -->|Não| C2_5
    C2_6 -->|Sim| C2_7[Criar Conta]
    
    %% Cadastro Tradutor
    C3 --> C3_1[Dados Pessoais]
    C3_1 --> C3_2[Documentos Profissionais]
    C3_2 --> C3_3[Teste de Proficiência]
    C3_3 --> C3_4{Aprovado?}
    C3_4 -->|Não| C3_5[Notificação Reprovação]
    C3_4 -->|Sim| C3_6[Criar Conta Tradutor]
    
    %% Fluxo de Login
    B -->|Sim| D[Página de Login]
    D --> D1[Email + Senha]
    D1 --> D2{Validar Credenciais}
    D2 -->|Inválido| D3[Erro Login]:::error
    D2 -->|Válido| D4{Verificar Papel}
    
    %% Verificação de Status do Tradutor
    D4 -->|Tradutor Inativo| D5[Forçar Logout]:::error
    D5 --> D6[Redirecionar para Página de Conta Inativa]:::blocked
    
    %% Dashboard Cliente
    D4 -->|Cliente| E[Dashboard Cliente]
    E --> E1[Menu Principal Cliente]
    
    E1 --> F1[Novo Pedido]
    E1 --> F2[Pedidos Ativos]
    E1 --> F3[Histórico]
    E1 --> F4[Configurações]
    
    %% Dashboard Tradutor
    D4 -->|Tradutor Ativo| T[Dashboard Tradutor]
    T --> T1[Menu Principal Tradutor]
    
    T1 --> U1[Feed Trabalhos]
    T1 --> U2[Trabalhos Ativos]
    T1 --> U3[Histórico]
    T1 --> U4[Métricas]
    
    %% Dashboard Admin
    D4 -->|Admin| A1[Dashboard Admin]
    A1 --> A2[Menu Principal Admin]
    
    A2 --> A3[Gerenciar Tradutores]
    A2 --> A4[Relatórios]
    A2 --> A5[Configurações]
    
    %% Gerenciamento de Tradutores (Admin)
    A3 --> A3_1[Lista de Tradutores]
    A3_1 --> A3_2[Ver Detalhes]
    A3_2 --> A3_3{Ativar/Desativar}
    A3_3 -->|Desativar| A3_4[Alterar Status para Inativo]:::warning
    A3_4 --> A3_5[Notificar Tradutor]
    A3_3 -->|Ativar| A3_6[Alterar Status para Ativo]:::success
    A3_6 --> A3_7[Notificar Tradutor]
    
    %% Fluxo Novo Pedido
    F1 --> G[Upload Arquivo]
    G --> G1{Validar Arquivo}
    G1 -->|Inválido| G2[Erro Formato]:::error
    G1 -->|Válido| H[Análise Arquivo]
    
    H --> H1[Contagem Palavras]
    H1 --> I[Configurar Pedido]
    
    I --> I1[Selecionar Idiomas]
    I1 --> I2[Tipo Tradução]
    I2 --> I3[Prazo Desejado]
    I3 --> J[Cálculo Orçamento]
    
    J --> J1[Mostrar Preço]
    J1 --> K{Aceitar Orçamento?}
    
    %% Fluxo Pós-Orçamento
    K -->|Não| K1[Salvar Rascunho]
    K -->|Sim| L[Processo Pagamento]
    
    L --> L1[Selecionar Método]
    L1 --> L2{Processar Pagamento}
    L2 -->|Falha| L3[Erro Pagamento]:::error
    L2 -->|Sucesso| L4[Pedido Criado]:::success
    
    %% Status do Pedido
    L4 --> M[Aguardando Tradutor]:::warning
    M --> M1[Notificar Tradutores]
    
    %% Fluxo Trabalho Tradutor
    U1 --> V[Visualizar Pedidos]
    V --> V1[Detalhes Pedido]
    V1 --> V2{Aceitar Trabalho?}
    
    V2 -->|Não| V3[Retornar Feed]
    V2 -->|Sim| W[Iniciar Tradução]
    
    %% Processo Tradução
    W --> W1[Baixar Arquivo]
    W1 --> X[Usar DeepL API]
    X --> X1[Primeira Versão]
    X1 --> Y[Editor Rich Text]
    Y --> Y1[Revisão/Edição]
    Y1 --> Y2{Finalizar?}
    Y2 -->|Não| Y1
    Y2 -->|Sim| Z[Enviar Tradução]
    
    %% Finalização
    Z --> Z1[Validação Final]
    Z1 --> Z2{Aprovado?}
    Z2 -->|Não| Z3[Solicitar Correções]:::error
    Z2 -->|Sim| Z4[Marcar Concluído]:::success
    
    %% Notificações Cliente
    Z4 --> N[Notificar Cliente]
    N --> O[Download Disponível]
    O --> P[Avaliar Serviço]
    
    %% Subprocessos
    subgraph "Processo de Pagamento"
        L
        L1
        L2
        L3
        L4
    end
    
    subgraph "Processo de Tradução"
        W
        W1
        X
        X1
        Y
        Y1
        Y2
        Z
        Z1
        Z2
        Z3
        Z4
    end
    
    subgraph "Validação de Documentos"
        C2_5
        C2_6
    end
    
    subgraph "Fluxo de Conta Inativa"
        D5
        D6
    end
    
    subgraph "Gerenciamento de Tradutores"
        A3
        A3_1
        A3_2
        A3_3
        A3_4
        A3_5
        A3_6
        A3_7
    end
```

## Legenda

🔴 Erro/Falha
🟢 Sucesso/Concluído
🟡 Em Andamento/Aguardando
🟣 Processo em Execução
🔵 Validação
🟠 Bloqueado/Inativo

## Notas
1. **Tipos de Arquivos Suportados**
   - Documentos: PDF, DOCX, DOC
   - Planilhas: XLS, XLSX
   - Apresentações: PPT, PPTX
   - Imagens: JPG, PNG

2. **Tipos de Tradução**
   - Juramentada
   - Técnica
   - Certificada
   - Comum

3. **Estados do Sistema**
   - Aguardando Pagamento
   - Aguardando Tradutor
   - Em Tradução
   - Em Revisão
   - Concluído
   - Cancelado

4. **Papéis de Usuário**
   - Cliente: Solicita e gerencia traduções
   - Tradutor Ativo: Realiza traduções e aceita trabalhos
   - Tradutor Inativo: Bloqueado de acessar o sistema (redirecionado para página específica)
   - Administrador: Gerencia sistema, usuários e monitora atividades

5. **Validações Importantes**
   - Documentos de identificação
   - Formatos de arquivo
   - Tamanho máximo de arquivo
   - Qualificações do tradutor
   - Qualidade da tradução
   - Status do tradutor (ativo/inativo)

6. **Fluxo de Segurança para Contas Inativas**
   - Detecção de conta inativa durante login
   - Forçar logout imediato
   - Redirecionamento para página dedicada
   - Mensagem clara sobre status da conta
   - Contato direto com suporte para reativação

7. **Integrações**
   - DeepL API para auxílio na tradução
   - Gateway de pagamento
   - Sistema de notificações
   - Sistema de armazenamento (Supabase Storage)
