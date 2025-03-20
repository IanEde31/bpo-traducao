import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Bell, Info, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { markAllNotificationsAsRead } from "@/lib/notifications";

interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  read: boolean;
  link?: string;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setNotifications(data || []);
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar notificações",
          description: "Não foi possível carregar suas notificações. Por favor, tente novamente.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Configurar inscrição em tempo real para atualizações de notificações
    const setupSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const unsubscribe = setupSubscription();
    return () => {
      if (unsubscribe) {
        unsubscribe.then(fn => fn && fn());
      }
    };
  }, [navigate, toast]);

  const handleMarkAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const result = await markAllNotificationsAsRead(user.id);
      
      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        
        toast({
          title: "Notificações marcadas como lidas",
          description: "Todas as notificações foram marcadas como lidas",
        });
      } else {
        throw result.error;
      }
    } catch (error) {
      console.error('Erro ao marcar notificações como lidas:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar as notificações como lidas",
      });
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida",
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-[#23B0DE]" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <PageHeader
          heading="Notificações"
          text="Acompanhe suas atualizações e mensagens"
        />
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            onClick={handleMarkAllAsRead}
            className="text-[#23B0DE] border-[#E8F3FF] hover:bg-[#F0F7FF] hover:text-[#23B0DE]"
          >
            <Check className="mr-2 h-4 w-4" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="space-y-3 md:space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando notificações...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 bg-white">
            <Bell className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhuma notificação</h3>
            <p className="text-gray-500 text-center">
              Você não tem notificações no momento.
            </p>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id}
              className={cn(
                "p-4 bg-white cursor-pointer transition-all hover:shadow-md",
                !notification.read ? "border-l-4 border-l-[#23B0DE]" : ""
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-xs font-medium",
                      notification.type === 'success' && "text-green-600",
                      notification.type === 'warning' && "text-amber-600",
                      notification.type === 'error' && "text-red-600",
                      notification.type === 'info' && "text-[#23B0DE]"
                    )}>
                      {notification.type === 'success' && "Sucesso"}
                      {notification.type === 'warning' && "Atenção"}
                      {notification.type === 'error' && "Erro"}
                      {notification.type === 'info' && "Informação"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{notification.message}</p>
                </div>
                {!notification.read && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                  >
                    <Check className="h-4 w-4 text-gray-500" />
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;
