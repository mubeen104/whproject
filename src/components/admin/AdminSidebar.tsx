import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingCart, Users, BarChart3, Settings, Leaf, ChevronRight, Star, Percent, Image, FileText, Target, MessageSquare, Database, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
const adminMenuItems = [{
  title: 'Dashboard',
  url: '/admin',
  icon: LayoutDashboard,
  badge: null
}, {
  title: 'Point of Sale',
  url: '/admin/pos',
  icon: CreditCard,
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
  title: 'Testimonials',
  url: '/admin/testimonials',
  icon: MessageSquare,
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
  title: 'Advertising Pixels',
  url: '/admin/pixels',
  icon: Target,
  badge: null
}, {
  title: 'Catalog Export',
  url: '/admin/catalog',
  icon: Database,
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
  }) => `group flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 ${isActive ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-medium transform scale-105' : 'hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 text-muted-foreground hover:text-foreground'}`;
  
  return (
    <div className="w-56 lg:w-72 h-full bg-gradient-to-b from-card via-card/95 to-muted/30 backdrop-blur-xl border-r border-border/30 flex flex-col shadow-elevated">
      {/* Modern Header */}
      <div className="p-4 lg:p-6 border-b border-border/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center space-x-3 lg:space-x-4">
          <div className="relative">
            <img 
              src="/logo.png" 
              alt="New Era Herbals Logo" 
              className="h-10 lg:h-12 w-auto rounded-lg shadow-soft hover:shadow-medium transition-shadow duration-300" 
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0idXJsKCNncmFkaWVudDApIi8+CjxwYXRoIGQ9Ik0yMCAzMkMxNy4yIDMyIDE1IDI5LjggMTUgMjdWMThDMTUgMTUuMiAxNy4yIDEzIDIwIDEzQzIyLjggMTMgMjUgMTUuMiAyNSAxOFYyN0MyNSAyOS44IDIyLjggMzIgMjAgMzJaIiBmaWxsPSJmZmZmZmYiIG9wYWNpdHk9IjAuOSIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjEwIiByPSIzIiBmaWxsPSJmZmZmZmYiIG9wYWNpdHk9IjAuOSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudDAiIHgxPSIwIiB5MT0iMCIgeDI9IjQwIiB5Mj0iNDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzA1OTY2OSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMzNDZENTMiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K';
              }}
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-lg font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-xs text-muted-foreground">New Era Herbals</p>
          </div>
        </div>
      </div>
      
      {/* Enhanced Navigation */}
      <div className="flex-1 p-3 lg:p-5 overflow-auto">
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden lg:block opacity-70">
              Dashboard
            </h3>
            <div className="hidden lg:block w-8 h-px bg-gradient-to-r from-primary/20 to-accent/20"></div>
          </div>
          <nav className="space-y-2">
            {adminMenuItems.map((item, index) => (
              <NavLink 
                key={item.title} 
                to={item.url} 
                end={item.url === '/admin'} 
                className={({ isActive }) => getNavCls({ isActive })}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center w-full">
                  <item.icon className="h-5 w-5 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium flex-1 text-sm lg:text-base hidden lg:block truncate">
                    {item.title}
                  </span>
                  <div className="flex items-center space-x-2 hidden lg:flex">
                    {item.badge}
                    <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 lg:p-5 border-t border-border/20 bg-gradient-to-r from-muted/20 to-muted/10">
        <div className="text-center">
          <p className="text-xs text-muted-foreground hidden lg:block">
            v2.0.1 • Powered by AI
          </p>
          <div className="flex justify-center mt-2 lg:hidden">
            <Leaf className="h-4 w-4 text-primary animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}