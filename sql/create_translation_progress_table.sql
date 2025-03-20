-- Tabela para armazenar o progresso das traduções
CREATE TABLE translation_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  translation_id UUID NOT NULL REFERENCES translations(id) ON DELETE CASCADE,
  translated_content TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(translation_id)
);

-- Adicionar coluna para armazenar o caminho do arquivo traduzido na tabela de traduções
ALTER TABLE translations ADD COLUMN IF NOT EXISTS translated_file_path TEXT;

-- Configurar políticas de segurança
ALTER TABLE translation_progress ENABLE ROW LEVEL SECURITY;

-- Política para permitir que tradutores vejam e editem apenas seus próprios documentos
CREATE POLICY translator_translation_progress_policy
  ON translation_progress
  USING (
    translation_id IN (
      SELECT id FROM translations 
      WHERE translator_id = auth.uid()
    )
  );

-- Política para administradores
CREATE POLICY admin_translation_progress_policy
  ON translation_progress
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Índice para melhorar a performance de consultas
CREATE INDEX IF NOT EXISTS idx_translation_progress_translation_id
  ON translation_progress(translation_id);
