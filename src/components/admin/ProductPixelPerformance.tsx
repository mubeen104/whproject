import { useProductPixelMetrics } from '@/hooks/useProductPixelMetrics';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/currency';
import { TrendingUp, Eye, ShoppingCart, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const ProductPixelPerformance = () => {
  const { data: products, isLoading } = useProductPixelMetrics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/50">
        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Product Data</h3>
        <p className="text-muted-foreground">
          Product performance data will appear here once you have pixel events.
        </p>
      </div>
    );
  }

  const topProducts = [...products]
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total Products</div>
              <div className="text-2xl font-bold">{products.length}</div>
            </div>
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total Views</div>
              <div className="text-2xl font-bold">
                {products.reduce((sum, p) => sum + p.total_views, 0).toLocaleString()}
              </div>
            </div>
            <Eye className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total Purchases</div>
              <div className="text-2xl font-bold">
                {products.reduce((sum, p) => sum + p.total_purchases, 0).toLocaleString()}
              </div>
            </div>
            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total Revenue</div>
              <div className="text-2xl font-bold">
                {formatCurrency(products.reduce((sum, p) => sum + p.total_revenue, 0), 'PKR')}
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Products</h3>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Add to Cart</TableHead>
                <TableHead className="text-right">Purchases</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Conversion Rate</TableHead>
                <TableHead className="text-right">AOV</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product) => (
                <TableRow key={product.product_id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {product.product_image && (
                        <img
                          src={product.product_image}
                          alt={product.product_name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{product.product_name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{product.total_views.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div>
                      {product.total_add_to_carts.toLocaleString()}
                      <Badge variant="outline" className="ml-2">
                        {product.add_to_cart_rate.toFixed(1)}%
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{product.total_purchases.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(product.total_revenue, 'PKR')}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={product.purchase_conversion_rate > 5 ? 'default' : 'secondary'}
                    >
                      {product.purchase_conversion_rate.toFixed(2)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(product.average_order_value, 'PKR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};
