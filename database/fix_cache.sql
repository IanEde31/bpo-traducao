-- Script para resolver o problema de cache do PostgREST
-- Execute este script no Console SQL do Supabase

-- 1. Remover completamente a coluna client_email se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'translationrequests' 
        AND column_name = 'client_email'
    ) THEN
        ALTER TABLE translationrequests DROP COLUMN client_email;
    END IF;
END $$;

-- 2. Remover completamente a coluna client_phone se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'translationrequests' 
        AND column_name = 'client_phone'
    ) THEN
        ALTER TABLE translationrequests DROP COLUMN client_phone;
    END IF;
END $$;

-- 3. Limpar o cache de schema do PostgREST (isso pode exigir permissões administrativas)
-- Se você não tiver permissões suficientes para executar esse comando,
-- pode ser necessário entrar em contato com o suporte do Supabase
SELECT pg_notify('pgrst', 'reload schema');

-- 4. Verificar a estrutura atual da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'translationrequests' 
ORDER BY ordinal_position;

-- Nota: Pode ser necessário reiniciar a API do Supabase para limpar completamente o cache.
-- Isso pode ser feito através do painel de administração do Supabase.
