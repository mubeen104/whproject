import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, BarChart3, Settings, Leaf, ChevronRight, Star, Percent, Image, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
const adminMenuItems = [{
  title: 'Dashboard',
  url: '/admin',
  icon: LayoutDashboard,
  badge: null
}, {
  title: 'Products',
  url: '/admin/products',
  icon: Package,
  badge: null
}, {
  title: 'Categories',
  url: '/admin/categories',
  icon: FolderTree,
  badge: null
}, {
  title: 'Orders',
  url: '/admin/orders',
  icon: ShoppingCart,
  badge: null
}, {
  title: 'Coupons',
  url: '/admin/coupons',
  icon: Percent,
  badge: null
}, {
  title: 'Users',
  url: '/admin/users',
  icon: Users,
  badge: null
}, {
  title: 'Analytics',
  url: '/admin/analytics',
  icon: BarChart3,
  badge: null
}, {
  title: 'Reviews',
  url: '/admin/reviews',
  icon: Star,
  badge: null
}, {
  title: 'Blog',
  url: '/admin/blog',
  icon: FileText,
  badge: null
}, {
  title: 'Hero Slides',
  url: '/admin/hero-slides',
  icon: Image,
  badge: null
}, {
  title: 'Settings',
  url: '/admin/settings',
  icon: Settings,
  badge: null
}];
export function AdminSidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => path === '/admin' ? currentPath === path : currentPath.startsWith(path);
  const getNavCls = ({
    isActive
  }: {
    isActive: boolean;
  }) => `flex items-center w-full px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'}`;
  return <div className="w-56 lg:w-64 h-full border-r border-border/50 bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-border/50">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <img src="/lovable-uploads/22303e3e-d2dd-4bad-a05f-9245ad435b33.png" alt="New Era Herbals Logo" className="h-8 lg:h-10 w-auto" />
          <div className="hidden lg:block">
            <h2 className="text-lg font-bold text-foreground">Admin Panel</h2>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 p-3 lg:p-4">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 hidden lg:block">
            Management
          </h3>
          <nav className="space-y-1">
            {adminMenuItems.map(item => <NavLink key={item.title} to={item.url} end={item.url === '/admin'} className={({
            isActive
          }) => getNavCls({
            isActive
          })}>
                <item.icon className="h-4 w-4 lg:h-5 lg:w-5 mr-2 lg:mr-3 flex-shrink-0" />
                <span className="font-medium flex-1 text-sm lg:text-base hidden lg:block">{item.title}</span>
                <div className="flex items-center space-x-2 hidden lg:flex">
                  {item.badge}
                  <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </NavLink>)}
          </nav>
        </div>
      </div>
    </div>;
}