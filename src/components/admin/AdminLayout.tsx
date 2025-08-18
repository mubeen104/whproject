import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { Bell, Search, User, Package, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { formatDistanceToNow } from 'date-fns';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
        <div className="flex flex-col items-center space-y-6 p-8 rounded-2xl bg-card/80 backdrop-blur-md shadow-elevated">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/20 border-t-primary"></div>
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-foreground">Loading Admin Panel</p>
            <p className="text-sm text-muted-foreground">Preparing your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-screen flex w-full bg-gradient-to-br from-background via-muted/20 to-secondary/10">
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full">
        {/* Ultra Modern Admin Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-card/50 backdrop-blur-xl border-b border-border/30 shrink-0 shadow-sm">
          <div className="flex items-center space-x-3 lg:space-x-6">
            <div className="hidden lg:flex items-center space-x-3">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-colors group-focus-within:text-primary" />
                <Input
                  placeholder="Search admin panel..."
                  className="pl-10 w-56 xl:w-72 bg-muted/30 border-border/50 focus:bg-background/80 focus:border-primary/50 transition-all duration-300 rounded-xl"
                />
              </div>
            </div>
            <div className="lg:hidden">
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Admin Panel
              </h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 lg:space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:scale-105 transition-all duration-200 rounded-xl">
                  <Bell className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse shadow-sm">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 md:w-96 p-0 border-border/50 shadow-elevated rounded-xl backdrop-blur-xl bg-card/95" align="end">
                <div className="flex items-center justify-between p-4 border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5">
                  <h4 className="font-semibold text-foreground">Notifications</h4>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="hover:bg-primary/10 text-primary">
                      Mark all read
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-80 md:h-96">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 hover:bg-muted/50 cursor-pointer border-b border-border/30 ${
                            !notification.read ? 'bg-muted/30' : ''
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {notification.type === 'new_order' && (
                                <Package className="h-4 w-4 text-primary" />
                              )}
                              {notification.type === 'low_stock' && (
                                <AlertTriangle className="h-4 w-4 text-destructive" />
                              )}
                              {notification.type === 'new_review' && (
                                <User className="h-4 w-4 text-muted-foreground" />
                              )}
                              {notification.type === 'system' && (
                                <Bell className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium truncate">{notification.title}</p>
                                {!notification.read && (
                                  <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full ml-2" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-primary/10 hover:scale-105 transition-all duration-200 group">
                  <Avatar className="h-8 w-8 group-hover:h-9 group-hover:w-9 transition-all duration-200">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-semibold">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 z-50 bg-card/95 backdrop-blur-xl border border-border/50 shadow-elevated rounded-xl">
                <DropdownMenuItem className="hover:bg-primary/10 rounded-lg mx-1 my-1">
                  <User className="h-4 w-4 mr-3 text-primary" />
                  <span className="font-medium">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem onClick={signOut} className="hover:bg-destructive/10 text-destructive rounded-lg mx-1 my-1">
                  <Package className="h-4 w-4 mr-3" />
                  <span className="font-medium">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-auto bg-gradient-to-br from-background/50 via-muted/20 to-secondary/10 animate-fade-in">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
