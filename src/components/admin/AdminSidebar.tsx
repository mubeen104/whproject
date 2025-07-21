import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  Leaf,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const adminMenuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, badge: null },
  { title: 'Products', url: '/admin/products', icon: Package, badge: 'New' },
  { title: 'Categories', url: '/admin/categories', icon: FolderTree, badge: null },
  { title: 'Orders', url: '/admin/orders', icon: ShoppingCart, badge: '5' },
  { title: 'Users', url: '/admin/users', icon: Users, badge: null },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3, badge: null },
  { title: 'Settings', url: '/admin/settings', icon: Settings, badge: null },
];

export function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => 
    path === '/admin' ? currentPath === path : currentPath.startsWith(path);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `group transition-all duration-200 ${
      isActive 
        ? 'bg-primary text-primary-foreground shadow-sm' 
        : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
    }`;

  return (
    <Sidebar className="w-64 border-r border-border/50 bg-sidebar-background">
      <SidebarHeader className="p-6 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-primary p-2 rounded-xl shadow-sm">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">New Era Herbals</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/admin'}
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <div className="flex items-center w-full">
                        <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                        <span className="font-medium flex-1">{item.title}</span>
                        <div className="flex items-center space-x-2">
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs px-2 py-0.5 bg-accent/20 text-accent-foreground"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}