Visão Geral do Banco de Dados
O banco de dados foi projetado para gerenciar eficientemente usuários, arquivos de tradução, orçamentos e processos de tradução, suportando tanto a interface do cliente quanto a do tradutor. Ele se integra ao Supabase Storage para o gerenciamento seguro de arquivos.

Tabelas e Estrutura
1. Tabela: users
Descrição: Armazena informações sobre todos os usuários da plataforma, incluindo clientes e tradutores.
Campos:
user_id (UUID, Primary Key): Identificador único do usuário.
name (TEXT, NOT NULL): Nome completo do usuário.
birth_date (DATE, NOT NULL): Data de nascimento do usuário.
role (TEXT, NOT NULL): Define o papel do usuário no sistema:
  - 'client': Usuário cliente que solicita traduções
  - 'translator': Tradutor ativo no sistema
  - 'inactive_translator': Tradutor inativo (bloqueado)
  - 'admin': Administrador do sistema com acesso privilegiado
is_individual (BOOLEAN, NOT NULL): Indica se é pessoa física (true) ou jurídica (false).
cpf (CHAR(11), UNIQUE): CPF para pessoa física (apenas se is_individual for true).
cnpj (CHAR(14), UNIQUE): CNPJ para pessoa jurídica (apenas se is_individual for false).
phone (TEXT, NOT NULL): Telefone para contato.
email (TEXT, UNIQUE, NOT NULL): Endereço de e-mail do usuário.
password_hash (TEXT, NOT NULL): Hash da senha do usuário.
newsletter (BOOLEAN, DEFAULT false): Indica se o usuário optou por receber newsletters.
created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Data de criação do registro.
updated_at (TIMESTAMP): Data da última atualização do registro.

Constraints:
CHECK (role IN ('client', 'translator', 'inactive_translator', 'admin')): Garante que o valor do campo role seja um dos valores permitidos.

2. Tabela: translators
Descrição: Armazena informações específicas dos tradutores.
Campos:
translator_id (UUID, Primary Key): Identificador único do tradutor.
user_id (UUID, Foreign Key): Refere-se ao user_id na tabela Users.
languages (TEXT, NOT NULL): Lista de idiomas que o tradutor domina.
certifications (TEXT): Certificações e qualificações do tradutor.
rating (FLOAT): Avaliação média baseada em feedback dos clientes.
activation_date (TIMESTAMP): Data em que o tradutor foi ativado no sistema.
deactivation_date (TIMESTAMP): Data em que o tradutor foi desativado no sistema, se aplicável.
last_login (TIMESTAMP): Data e hora do último login do tradutor.

3. Tabela: translationrequests
Descrição: Contém detalhes sobre as solicitações de tradução dos clientes.
Campos:
request_id (UUID, Primary Key): Identificador único da solicitação.
user_id (UUID, Foreign Key): Refere-se ao user_id na tabela Users.
file_name (TEXT, NOT NULL): Nome do arquivo carregado para tradução.
file_path (TEXT, NOT NULL): Caminho do arquivo no Supabase Storage.
bucket_name (TEXT, DEFAULT 'arquivos_carregados'): Nome do bucket onde o arquivo está armazenado.
file_type (TEXT, NOT NULL): Tipo do arquivo (PDF, DOCX, etc.).
word_count (INTEGER): Contagem de palavras do arquivo.
service_type (TEXT, NOT NULL): Tipo de serviço solicitado (juramentada, técnica, etc.).
status (TEXT, DEFAULT 'pending'): Status atual da solicitação (pendente, em progresso, concluída).
source_language (TEXT): Idioma de origem do documento.
target_language (TEXT): Idioma para o qual o documento será traduzido.
delivery_date (TIMESTAMP WITH TIME ZONE): Data prevista para entrega da tradução.
created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Data de criação do pedido.
price_per_word (NUMERIC): Preço por palavra.
total_price (NUMERIC): Preço total.
currency (VARCHAR): Moeda.
valid_until (TIMESTAMP): Data de validade.
translation_subtype (TEXT): Subtipo da tradução.
translator_id (UUID, Foreign Key): Refere-se ao translator_id na tabela Translators.

4. Tabela: translations
Descrição: Armazena informações sobre traduções concluídas.
Campos:
translation_id (UUID, Primary Key): Identificador único da tradução.
request_id (UUID, Foreign Key): Refere-se ao request_id na tabela TranslationRequests.
translator_id (UUID, Foreign Key): Refere-se ao translator_id na tabela Translators.
translated_file_path (TEXT, NOT NULL): Caminho do arquivo traduzido no Supabase Storage.
review_notes (TEXT): Observações da revisão, se aplicável.
completed_at (TIMESTAMP): Data de conclusão da tradução.

5. Tabela: quotes
Descrição: Armazena informações sobre cotações de tradução fornecidas aos clientes.
Campos:
quote_id (UUID, Primary Key): Identificador único da cotação.
request_id (UUID, Foreign Key): Refere-se ao request_id na tabela TranslationRequests.
amount (DECIMAL, NOT NULL): Valor cotado para a tradução.
currency (TEXT, DEFAULT 'USD'): Moeda da cotação.
valid_until (DATE): Data de validade da cotação.

6. Tabela: user_activity_logs
Descrição: Registra atividades importantes dos usuários no sistema para auditoria e segurança.
Campos:
log_id (UUID, Primary Key): Identificador único do registro de log.
user_id (UUID, Foreign Key): Refere-se ao user_id na tabela Users.
activity_type (TEXT, NOT NULL): Tipo de atividade (login, logout, role_change, etc.).
details (JSONB): Detalhes adicionais sobre a atividade em formato JSON.
ip_address (TEXT): Endereço IP do qual a atividade foi realizada.
user_agent (TEXT): Informações do navegador/dispositivo.
created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Data e hora do registro.

# Buckets Criados no Supabase Storage
1. Bucket: arquivos_carregados: Utilizado para armazenar arquivos enviados pelos usuários para tradução.
2. Bucket: arquivos_traduzidos: Utilizado para armazenar arquivos traduzidos que foram concluídos e estão prontos para download.

# Considerações de Segurança
1. Armazenamento de Arquivos: Utilize o Supabase Storage para garantir o armazenamento seguro e acessível de arquivos.
2. Autenticação e Autorização: Assegurar que somente usuários autenticados possam acessar dados sensíveis e arquivos.
3. Criptografia: Armazenar senhas usando hashing seguro e considerar criptografar links de arquivos.
4. Controle de Acesso por Função (RBAC): Garantir que usuários só acessem recursos e dados conforme seu papel no sistema.
5. Implementação de Regras de Segurança no Supabase:
   - Row Level Security (RLS) para controlar acesso aos dados por usuário
   - Políticas de bucket para restringir acesso aos arquivos
   - Monitoramento de atividades suspeitas

# Políticas de Controle de Acesso
1. Bucket: arquivos_carregados
Descrição: Utilizado para armazenar arquivos enviados pelos usuários para tradução.
Configurações:
Acesso: Controlado por políticas de segurança para garantir que apenas usuários autorizados possam acessar os arquivos.

2. Bucket: arquivos_traduzidos
Descrição: Utilizado para armazenar arquivos traduzidos que foram concluídos e estão prontos para download.
Configurações:
Acesso: Clientes só podem acessar seus próprios arquivos traduzidos, enquanto tradutores podem acessar apenas os arquivos que eles traduziram.

# Gerenciamento de Estado do Tradutor
O sistema implementa um mecanismo de gerenciamento de estado do tradutor através do campo 'role' na tabela 'users':
1. Ativação: Quando um tradutor é ativado, seu papel é definido como 'translator'.
2. Desativação: Quando um tradutor é desativado, seu papel é alterado para 'inactive_translator'.
3. Segurança: Tradutores inativos são automaticamente bloqueados de acessar qualquer parte do sistema.
4. Workflow: Um tradutor inativo que tenta fazer login é redirecionado para uma página específica (/conta-inativa) que explica a situação.