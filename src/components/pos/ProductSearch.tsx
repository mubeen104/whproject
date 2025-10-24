import { useState } from 'react';
import { Search, Barcode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useProducts } from '@/hooks/useProducts';
import { POSCartItem } from '@/hooks/usePOS';
import { formatCurrency } from '@/lib/currency';

interface ProductSearchProps {
  onAddToCart: (item: Omit<POSCartItem, 'quantity'>) => void;
}

export function ProductSearch({ onAddToCart }: ProductSearchProps) {
  const [search, setSearch] = useState('');
  const [barcodeMode, setBarcodeMode] = useState(false);
  const { data: products = [] } = useProducts();

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.sku?.toLowerCase().includes(search.toLowerCase()) ||
    product.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBarcodeSearch = (barcode: string) => {
    const product = products.find(p => p.sku === barcode);
    if (product) {
      const image = product.product_images?.[0];
      onAddToCart({
        id: product.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        image_url: image?.image_url,
        sku: product.sku,
      });
      setSearch('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcodeMode && search) {
      handleBarcodeSearch(search);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={barcodeMode ? "Scan or enter barcode..." : "Search products..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>
        <Button
          variant={barcodeMode ? "default" : "outline"}
          size="icon"
          onClick={() => setBarcodeMode(!barcodeMode)}
        >
          <Barcode className="h-4 w-4" />
        </Button>
      </div>

      {search && (
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {filteredProducts.map(product => {
            const image = product.product_images?.[0];
            return (
              <Card
                key={product.id}
                className="p-3 cursor-pointer hover:shadow-medium transition-all"
                onClick={() => {
                  onAddToCart({
                    id: product.id,
                    product_id: product.id,
                    name: product.name,
                    price: product.price,
                    image_url: image?.image_url,
                    sku: product.sku,
                  });
                  setSearch('');
                }}
              >
                {image && (
                  <img
                    src={image.image_url}
                    alt={image.alt_text || product.name}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                )}
                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                <p className="text-xs text-muted-foreground">{product.sku}</p>
                <p className="text-sm font-bold mt-1">{formatCurrency(product.price)}</p>
                <p className="text-xs text-muted-foreground">Stock: {product.inventory_quantity}</p>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
