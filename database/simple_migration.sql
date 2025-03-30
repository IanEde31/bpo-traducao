-- Script simplificado para resolver apenas os problemas críticos
-- Execute este script no Console SQL do Supabase

-- 1. Adicionar coluna 'email' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'translationrequests' 
        AND column_name = 'email'
    ) THEN
        ALTER TABLE translationrequests ADD COLUMN email TEXT;
    END IF;
END $$;

-- 2. Adicionar coluna 'phone' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'translationrequests' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE translationrequests ADD COLUMN phone TEXT;
    END IF;
END $$;

-- 3. Garantir que a coluna 'files' exista e seja do tipo JSONB
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'translationrequests' 
        AND column_name = 'files'
    ) THEN
        ALTER TABLE translationrequests ADD COLUMN files JSONB DEFAULT '[]'::jsonb;
    ELSE
        -- Se a coluna existir, verificar o tipo
        IF (
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'translationrequests' 
            AND column_name = 'files'
        ) != 'jsonb' THEN
            -- Criar uma coluna temporária
            ALTER TABLE translationrequests ADD COLUMN files_jsonb JSONB DEFAULT '[]'::jsonb;
            
            -- Tentar converter os dados existentes
            UPDATE translationrequests 
            SET files_jsonb = CASE 
                WHEN files IS NULL THEN '[]'::jsonb
                WHEN files::text = '' THEN '[]'::jsonb
                ELSE 
                    CASE WHEN files::text ~ '^\\[.*\\]$' 
                        THEN files::jsonb 
                        ELSE ('[' || files::text || ']')::jsonb 
                    END
            END;
            
            -- Remover a coluna antiga
            ALTER TABLE translationrequests DROP COLUMN files;
            
            -- Renomear a nova coluna
            ALTER TABLE translationrequests RENAME COLUMN files_jsonb TO files;
        END IF;
    END IF;
END $$;

-- Exibir a estrutura atual para verificação
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'translationrequests'
ORDER BY ordinal_position;
