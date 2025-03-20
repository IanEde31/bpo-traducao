import { Bell, Settings, LogOut, ChevronDown, User, Menu, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface HeaderProps {
  onMenuClick?: () => void;
}

interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  created_at: string;
  read: boolean;
  link?: string;
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userName, setUserName] = useState<string>("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('name')
            .eq('user_id', user.id)
            .single();

          if (error) throw error;
          if (userData) {
            setUserName(userData.name);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar nome do usuário:', error);
      }
    };

    fetchUserName();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoadingNotifications(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

          if (error) throw error;
          
          if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(notif => !notif.read).length);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar notificações:', error);
      } finally {
        setIsLoadingNotifications(false);
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
          (payload) => {
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
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      navigate('/login');
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado do sistema",
      });
    } catch (error) {
      toast({
        title: "Erro ao realizar logout",
        description: "Tente novamente mais tarde",
        variant: "destructive",
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
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
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

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
      
      toast({
        title: "Notificações marcadas como lidas",
        description: "Todas as notificações foram marcadas como lidas"
      });
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar as notificações como lidas",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-16 border-b border-[#E8F3FF] flex items-center justify-between px-4 md:px-6 bg-white">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5 text-[#23B0DE]" />
        </Button>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-[#F0F7FF] rounded-full w-10 h-10"
            >
              <Bell className="h-5 w-5 text-[#23B0DE]" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 mt-2 bg-white border border-[#E8F3FF] max-h-96 overflow-y-auto">
            <div className="py-2 px-4 border-b border-[#E8F3FF] flex justify-between items-center">
              <h4 className="font-medium text-[#23B0DE]">Notificações</h4>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={markAllAsRead} 
                  className="text-xs text-gray-500 hover:text-[#23B0DE]"
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            
            {isLoadingNotifications ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-gray-500">Carregando notificações...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">Nenhuma notificação</p>
              </div>
            ) : (
              <>
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    className={cn(
                      "py-3 px-4 cursor-pointer flex items-start border-b border-[#E8F3FF] last:border-0",
                      !notification.read ? "bg-[#F0F7FF]" : "",
                      "hover:bg-[#F0F7FF]",
                      "focus:bg-[#F0F7FF] focus:text-current"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
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
                          {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{notification.message}</p>
                    </div>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 ml-2 rounded-full hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3 text-gray-500" />
                      </Button>
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem 
                  className="py-2 text-center text-[#23B0DE] hover:bg-[#F0F7FF] focus:bg-[#F0F7FF] focus:text-[#23B0DE]"
                  onClick={() => navigate("/notificacoes")}
                >
                  Ver todas
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="flex items-center space-x-3 px-3 py-2 hover:bg-[#F0F7FF] rounded-full h-auto"
            >
              <div className="h-8 w-8 rounded-full bg-[#F0F7FF] flex items-center justify-center">
                <User className="h-5 w-5 text-[#23B0DE]" />
              </div>
              <div className="hidden md:flex items-center gap-2">
                <div className="text-left">
                  <p className="text-sm font-medium text-[#23B0DE]">
                    Olá, {userName || 'Usuário'}!
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-[#23B0DE]" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 bg-white border border-[#E8F3FF]">
            <DropdownMenuItem 
              onClick={() => navigate("/configuracoes")} 
              className={cn(
                "py-2 text-[#23B0DE] hover:bg-[#F0F7FF]",
                "focus:bg-[#F0F7FF] focus:text-[#23B0DE]"
              )}
            >
              <Settings className="mr-3 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#E8F3FF]" />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className={cn(
                "py-2 text-red-500 hover:bg-red-50",
                "focus:bg-red-50 focus:text-red-500"
              )}
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}