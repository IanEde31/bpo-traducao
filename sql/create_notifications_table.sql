-- SQL para criar a tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) NOT NULL DEFAULT 'info',
    read BOOLEAN NOT NULL DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Adicionar políticas RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários autenticados verem apenas suas próprias notificações
CREATE POLICY "Usuários podem ver suas próprias notificações"
    ON public.notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Políticas para usuários autenticados atualizarem apenas suas próprias notificações
CREATE POLICY "Usuários podem atualizar suas próprias notificações"
    ON public.notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Função para atualizar o timestamp de atualização
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar o trigger para atualizar o timestamp
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Exemplo de inserção de notificações de teste (opcional)
-- INSERT INTO public.notifications (user_id, message, type, link)
-- VALUES 
--   ('USER_ID_HERE', 'Seu orçamento foi aprovado', 'success', '/pedidos/123'),
--   ('USER_ID_HERE', 'Nova mensagem recebida', 'info', '/mensagens'),
--   ('USER_ID_HERE', 'Pedido em atraso', 'warning', '/pedidos/456');
