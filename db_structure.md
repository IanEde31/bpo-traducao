Visão Geral do Banco de Dados
O banco de dados foi projetado para gerenciar eficientemente usuários, arquivos de tradução, orçamentos e processos de tradução, suportando tanto a interface do cliente quanto a do tradutor. Ele se integra ao Supabase Storage para o gerenciamento seguro de arquivos.

Tabelas e Estrutura
1. Tabela: translationrequests
Descrição: Contém detalhes sobre as solicitações de tradução dos clientes.
Campos:
id (BIGINT, Primary Key): ID gerado automaticamente.
request_id (UUID, UNIQUE, NOT NULL): Identificador único da solicitação.
user_id (UUID, Foreign Key): Referência ao ID do usuário na tabela auth.users.
status (TEXT, NOT NULL): Status atual da solicitação ('pending', 'in_progress', 'completed', etc).
created_at (TIMESTAMP WITH TIME ZONE): Data de criação do pedido.
updated_at (TIMESTAMP WITH TIME ZONE): Data da última atualização.
files (JSONB): JSON contendo detalhes de todos os arquivos (para multiple files).
file_count (INTEGER): Número de arquivos na solicitação.
file_name (TEXT): Nome do arquivo principal (compatibilidade).
file_path (TEXT): Caminho do arquivo no Supabase Storage (compatibilidade).
file_type (TEXT): Tipo do arquivo (PDF, DOCX, etc.) (compatibilidade).
file_word_count (INTEGER): Contagem de palavras do arquivo principal (compatibilidade).
translated_file_path (TEXT): Caminho para o arquivo traduzido.
name (TEXT): Nome do cliente.
email (TEXT): E-mail de contato.
phone (TEXT): Telefone de contato.
source_language (TEXT): Idioma de origem do documento.
target_language (TEXT): Idioma para o qual o documento será traduzido.
translation_type (TEXT): Tipo de tradução ('normal', 'certificada', etc).
translation_subtype (TEXT): Subtipo específico da tradução.
delivery_date (TIMESTAMP WITH TIME ZONE): Data prevista para entrega.
word_count (INTEGER): Contagem total de palavras.
total_word_count (INTEGER): Contagem total para fins de preço.
price_per_word (DECIMAL): Preço por palavra.
total_price (DECIMAL): Preço total da tradução.
currency (TEXT): Moeda usada (padrão: 'BRL').
valid_until (TIMESTAMP WITH TIME ZONE): Data de validade da cotação.
translator_id (UUID, Foreign Key): Referência ao ID do tradutor alocado.
allocated_at (TIMESTAMP WITH TIME ZONE): Data de alocação.
completed_at (TIMESTAMP WITH TIME ZONE): Data de conclusão.

2. Tabela: translators
Descrição: Armazena informações específicas dos tradutores.
Campos:
id (BIGINT, Primary Key): ID gerado automaticamente.
user_id (UUID, Foreign Key, UNIQUE): Referência ao ID do usuário na tabela auth.users.
approved (BOOLEAN): Indica se o tradutor foi aprovado para trabalhar na plataforma.
created_at (TIMESTAMP WITH TIME ZONE): Data de criação do registro.
updated_at (TIMESTAMP WITH TIME ZONE): Data da última atualização.
languages (TEXT[]): Array de idiomas que o tradutor domina.
specializations (TEXT[]): Áreas de especialização do tradutor.
name (TEXT): Nome do tradutor.
email (TEXT): E-mail de contato.
bio (TEXT): Biografia/descrição profissional.
profile_picture (TEXT): URL da foto de perfil.
total_translations (INTEGER): Total de traduções realizadas.
total_words_translated (INTEGER): Total de palavras traduzidas.
rating (DECIMAL): Avaliação média.

3. Tabela: translation_progress
Descrição: Armazena o progresso das traduções em andamento.
Campos:
id (BIGINT, Primary Key): ID gerado automaticamente.
translation_id (UUID, UNIQUE): Referência ao ID da solicitação na tabela translationrequests.
translated_content (TEXT): Conteúdo traduzido em formato texto.
last_updated (TIMESTAMP WITH TIME ZONE): Data da última atualização.

4. Tabela: translations
Descrição: Armazena traduções segmentadas.
Campos:
id (BIGINT, Primary Key): ID gerado automaticamente.
request_id (UUID): Referência ao request_id na tabela translationrequests.
translator_id (UUID): Referência ao ID do tradutor.
original_text (TEXT): Texto original.
translated_text (TEXT): Texto traduzido.
created_at (TIMESTAMP WITH TIME ZONE): Data de criação.
updated_at (TIMESTAMP WITH TIME ZONE): Data da última atualização.
segment_id (TEXT): Identificador do segmento.
segment_index (INTEGER): Ordem do segmento no documento.

5. Tabela: users (extensão da auth.users)
Descrição: Armazena dados adicionais de usuários.
Campos:
id (UUID, Primary Key): Referência ao ID na tabela auth.users.
name (TEXT): Nome do usuário.
email (TEXT): E-mail de contato.
phone (TEXT): Telefone de contato.
avatar_url (TEXT): URL da foto de perfil.
language (TEXT): Idioma preferido (padrão: 'pt-BR').
user_type (TEXT): Tipo de usuário ('client', 'translator', 'admin').
created_at (TIMESTAMP WITH TIME ZONE): Data de criação.
updated_at (TIMESTAMP WITH TIME ZONE): Data da última atualização.

6. Tabela: notifications
Descrição: Armazena notificações para os usuários.
Campos:
id (BIGINT, Primary Key): ID gerado automaticamente.
user_id (UUID): Referência ao ID do usuário na tabela auth.users.
title (TEXT): Título da notificação.
message (TEXT): Mensagem da notificação.
read (BOOLEAN): Indica se a notificação foi lida.
created_at (TIMESTAMP WITH TIME ZONE): Data de criação.
link (TEXT): Link relacionado à notificação.
type (TEXT): Tipo da notificação.
reference_id (UUID): ID de referência.

7. Tabela: profiles
Descrição: Informações complementares de perfil.
Campos:
id (UUID, Primary Key): Referência ao ID na tabela auth.users.
name (TEXT): Nome do usuário.
email (TEXT): E-mail de contato.
company (TEXT): Empresa.
created_at (TIMESTAMP WITH TIME ZONE): Data de criação.
updated_at (TIMESTAMP WITH TIME ZONE): Data da última atualização.

Buckets no Supabase Storage
1. arquivos_carregados: Armazena arquivos originais enviados pelos usuários.
2. arquivos_traduzidos: Armazena arquivos traduzidos gerados pelos tradutores.

Considerações de Segurança
1. Row Level Security (RLS): Implementar políticas para que usuários só acessem seus próprios dados.
2. Política de Arquivos: Garantir que os usuários só acessem seus próprios arquivos ou arquivos compartilhados conforme sua função.
3. Controle de Acesso: Implementar regras para definir quem pode ver ou modificar cada recurso.