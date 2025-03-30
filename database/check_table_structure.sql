-- Script para verificar a estrutura da tabela translationrequests
-- Execute este script no Console SQL do Supabase para diagnosticar problemas

-- Verificar todas as colunas da tabela translationrequests
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'translationrequests'
ORDER BY ordinal_position;

-- Verificar se existem registros na tabela
SELECT COUNT(*) FROM translationrequests;

-- Verificar quais campos existem em um registro de exemplo (se houver)
SELECT * FROM translationrequests LIMIT 1;

-- Verificar quais tabelas existem no schema public
SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verificar restrições na tabela
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'translationrequests'::regclass::oid;

-- Verificar índices na tabela
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'translationrequests';
