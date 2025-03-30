-- Script para adaptar a tabela translationrequests para suportar múltiplos arquivos e corrigir colunas de email
-- Execute este script no Console SQL do Supabase

-- Verificar se a coluna 'files' existe e é do tipo JSONB
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'translationrequests' 
        AND column_name = 'files'
    ) THEN
        -- Adicionar a coluna 'files' como JSONB
        ALTER TABLE translationrequests ADD COLUMN files JSONB;
    ELSE
        -- Verificar se a coluna files é do tipo JSONB, se não for, converter
        IF (
            SELECT data_type 
            FROM information_schema.columns 
            WHERE table_name = 'translationrequests' 
            AND column_name = 'files'
        ) != 'jsonb' THEN
            -- Se a coluna existir mas não for do tipo JSONB, alterar o tipo
            ALTER TABLE translationrequests ALTER COLUMN files TYPE JSONB USING files::jsonb;
        END IF;
    END IF;
END $$;

-- Verificar e adicionar a coluna 'email' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'translationrequests' 
        AND column_name = 'email'
    ) THEN
        -- Adicionar a coluna 'email'
        ALTER TABLE translationrequests ADD COLUMN email TEXT;
        
        -- Se existir uma coluna client_email, copiar dados para email
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'translationrequests' 
            AND column_name = 'client_email'
        ) THEN
            UPDATE translationrequests SET email = client_email WHERE client_email IS NOT NULL;
        END IF;
    END IF;
END $$;

-- Verificar e adicionar a coluna 'phone' se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'translationrequests' 
        AND column_name = 'phone'
    ) THEN
        -- Adicionar a coluna 'phone'
        ALTER TABLE translationrequests ADD COLUMN phone TEXT;
        
        -- Se existir uma coluna client_phone, copiar dados para phone
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'translationrequests' 
            AND column_name = 'client_phone'
        ) THEN
            UPDATE translationrequests SET phone = client_phone WHERE client_phone IS NOT NULL;
        END IF;
    END IF;
END $$;

-- Atualizar a estrutura da tabela 'files' para conter o dados de todos os arquivos
DO $$
BEGIN
    -- Verificar se as colunas necessárias existem
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'translationrequests' 
        AND column_name = 'file_path'
    ) AND EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'translationrequests' 
        AND column_name = 'files'
        AND data_type = 'jsonb'
    ) THEN
        -- Para registros que têm file_path mas não têm files preenchido
        UPDATE translationrequests
        SET files = json_build_array(
            json_build_object(
                'originalName', COALESCE(file_name, split_part(file_path, '/', -1)),
                'storagePath', file_path,
                'fileType', CASE 
                    WHEN file_path LIKE '%.pdf' THEN 'application/pdf'
                    WHEN file_path LIKE '%.doc' THEN 'application/msword'
                    WHEN file_path LIKE '%.docx' THEN 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    WHEN file_path LIKE '%.txt' THEN 'text/plain'
                    ELSE 'application/octet-stream'
                END,
                'wordCount', 0  -- Valor fixo já que não temos a coluna total_word_count
            )
        )::jsonb
        WHERE file_path IS NOT NULL 
        AND (files IS NULL OR files::text = '[]' OR files::text = 'null');
    END IF;
END $$;

-- Criar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_translationrequests_files ON translationrequests USING GIN (files);
CREATE INDEX IF NOT EXISTS idx_translationrequests_email ON translationrequests (email);

-- Criar tabela para armazenar informações dos arquivos (opcional - abordagem alternativa)
-- Se preferir usar uma tabela separada em vez de um campo JSONB
CREATE TABLE IF NOT EXISTS translation_files (
    id SERIAL PRIMARY KEY,
    request_id UUID REFERENCES translationrequests(request_id) ON DELETE CASCADE,
    original_name TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE,
    file_type TEXT,
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentário informativo
COMMENT ON TABLE translation_files IS 'Armazena informações sobre arquivos associados a solicitações de tradução';
