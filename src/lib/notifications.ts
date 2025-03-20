import { supabase } from './supabase';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface CreateNotificationParams {
  userId: string;
  message: string;
  type?: NotificationType;
  link?: string;
}

/**
 * Adiciona uma nova notificação para um usuário
 * @param params Parâmetros da notificação
 * @returns Objeto com sucesso (boolean) e dados ou erro
 */
export async function addNotification({ 
  userId, 
  message, 
  type = 'info', 
  link 
}: CreateNotificationParams) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        message,
        type,
        link,
        read: false
      })
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao adicionar notificação:', error);
    return { success: false, error };
  }
}

/**
 * Marca uma notificação como lida
 * @param notificationId ID da notificação
 * @returns Objeto com sucesso (boolean) e dados ou erro
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    return { success: false, error };
  }
}

/**
 * Marca todas as notificações de um usuário como lidas
 * @param userId ID do usuário
 * @returns Objeto com sucesso (boolean) e número de notificações atualizadas ou erro
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error('Erro ao marcar todas as notificações como lidas:', error);
    return { success: false, error };
  }
}

/**
 * Busca notificações de um usuário
 * @param userId ID do usuário
 * @param limit Limite de notificações para retornar (padrão: 10)
 * @param onlyUnread Se true, retorna apenas notificações não lidas
 * @returns Objeto com sucesso (boolean) e lista de notificações ou erro
 */
export async function fetchUserNotifications(userId: string, limit = 10, onlyUnread = false) {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (onlyUnread) {
      query = query.eq('read', false);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    
    return { success: true, notifications: data };
  } catch (error) {
    console.error('Erro ao buscar notificações do usuário:', error);
    return { success: false, error };
  }
}
