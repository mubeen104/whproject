import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PixelPerformance } from '@/hooks/usePixelPerformance';
import { TrendingUp, Eye, ShoppingCart, CreditCard, DollarSign, Users, Activity } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface PixelPerformanceCardProps {
  performance: PixelPerformance;
  platformIcon: string;
  platformColor: string;
}

export const PixelPerformanceCard = ({ 
  performance, 
  platformIcon, 
  platformColor 
}: PixelPerformanceCardProps) => {
  const metrics = [
    { 
      label: 'Page Views', 
      value: performance.page_views, 
      icon: Eye,
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      label: 'Content Views', 
      value: performance.content_views, 
      icon: Activity,
      color: 'text-purple-600 dark:text-purple-400'
    },
    { 
      label: 'Add to Carts', 
      value: performance.add_to_carts, 
      icon: ShoppingCart,
      color: 'text-orange-600 dark:text-orange-400'
    },
    { 
      label: 'Checkouts', 
      value: performance.checkouts, 
      icon: CreditCard,
      color: 'text-indigo-600 dark:text-indigo-400'
    },
    { 
      label: 'Purchases', 
      value: performance.purchases, 
      icon: TrendingUp,
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      label: 'Unique Users', 
      value: performance.unique_users, 
      icon: Users,
      color: 'text-pink-600 dark:text-pink-400'
    }
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`${platformColor} text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{platformIcon}</span>
            <div>
              <CardTitle className="text-white">{performance.platform.replace('_', ' ').toUpperCase()}</CardTitle>
              <CardDescription className="text-white/80 text-xs mt-1">
                ID: {performance.tracking_id}
              </CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-none">
            {performance.conversion_rate.toFixed(2)}% CVR
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(Number(performance.total_revenue))}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-green-600 text-green-600 dark:border-green-400 dark:text-green-400">
              {performance.purchases} orders
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                    <p className="text-xs text-muted-foreground">{metric.label}</p>
                  </div>
                  <p className="text-xl font-semibold">{metric.value.toLocaleString()}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm">
            <span className="text-muted-foreground">Total Events Tracked</span>
            <span className="font-semibold">{performance.total_events.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
