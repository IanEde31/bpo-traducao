# Instruções para Atualização do Banco de Dados

Este documento contém instruções para atualizar a estrutura do banco de dados Supabase para suportar o upload de múltiplos arquivos no formulário de orçamento.

## Problema

O formulário de orçamento foi adaptado para suportar múltiplos arquivos, mas a estrutura do banco de dados precisa ser atualizada para armazenar essas informações corretamente.

## Solução

O arquivo `migration_files.sql` contém scripts SQL para:

1. Adicionar/alterar a coluna `files` para armazenar informações de múltiplos arquivos como JSONB
2. Garantir que as colunas `email` e `phone` existam na tabela
3. Migrar dados antigos para o novo formato (se necessário)
4. Criar índices para melhorar a performance

## Como Executar o Script

### Método 1: Via Console SQL do Supabase

1. Faça login no [Supabase Dashboard](https://app.supabase.io)
2. Selecione seu projeto
3. No menu lateral, clique em "SQL Editor"
4. Crie um novo script
5. Copie e cole o conteúdo do arquivo `migration_files.sql`
6. Clique em "Run" para executar o script

### Método 2: Via CLI (Para Desenvolvedores)

Se você tem o Supabase CLI instalado:

```bash
supabase db push --db-url=sua_url_do_banco_de_dados
```

## Verificação

Após executar o script, você pode verificar se a migração foi bem-sucedida com a seguinte consulta SQL:

```sql
-- Verificar estrutura da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'translationrequests';

-- Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'translationrequests';
```

## Estrutura do Campo `files`

O campo `files` armazena um array JSON com a seguinte estrutura:

```json
[
  {
    "originalName": "documento.pdf",
    "storagePath": "documento_2025-03-20_11-30-45.pdf",
    "fileType": "application/pdf",
    "wordCount": 1200
  },
  {
    "originalName": "outro_documento.docx",
    "storagePath": "outro_documento_2025-03-20_11-30-45.docx",
    "fileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "wordCount": 800
  }
]
```

## Observações

- O script é idempotente (pode ser executado múltiplas vezes sem causar problemas)
- O script preserva dados existentes
- Uma tabela alternativa `translation_files` também é criada caso você prefira armazenar os arquivos em uma tabela separada no futuro
