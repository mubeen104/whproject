import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingCart, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useSuggestedCartProducts, trackCartSuggestionView, trackCartSuggestionConversion } from '@/hooks/useSuggestedCartProducts';
import { useGuestCart } from '@/hooks/useGuestCart';
import { useAuth } from '@/contexts/AuthContext';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useToast } from '@/hooks/use-toast';
import { AddToCartModal } from '@/components/AddToCartModal';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CartSuggestionsProps {
  cartItems: any[];
  limit?: number;
}

const CartSuggestions = ({ cartItems, limit = 4 }: CartSuggestionsProps) => {
  const { data: suggestedProducts = [], isLoading } = useSuggestedCartProducts(cartItems, limit);
  const { addToCart } = useGuestCart();
  const { user } = useAuth();
  const { currency } = useStoreSettings();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [addToCartProduct, setAddToCartProduct] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [sessionId] = useState(() => {
    const existingId = sessionStorage.getItem('session_id');
    if (existingId) return existingId;
    const newId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem('session_id', newId);
    return newId;
  });

  const cartProductIds = cartItems.map(item =>
    item.product_id || item.products?.id || item.product?.id
  ).filter(Boolean) as string[];

  useEffect(() => {
    if (suggestedProducts.length > 0 && isOpen) {
      suggestedProducts.forEach(product => {
        trackCartSuggestionView(cartProductIds, product.id, sessionId, user?.id);
      });
    }
  }, [suggestedProducts, isOpen, cartProductIds, sessionId, user?.id]);

  const handleAddToCartRequest = (product: any) => {
    setAddToCartProduct(product);
  };

  const handleAddToCart = async (suggestedProductId: string, quantity: number, variantId?: string) => {
    await addToCart(suggestedProductId, quantity, variantId);
    trackCartSuggestionConversion(cartProductIds, suggestedProductId, sessionId, user?.id);
    toast({
      title: 'Added to cart',
      description: 'Product has been added to your cart.',
    });
  };

  const handleProductClick = (product: any) => {
    trackCartSuggestionConversion(cartProductIds, product.id, sessionId, user?.id);
    navigate(`/product/${product.slug}`);
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="w-full aspect-square rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestedProducts || suggestedProducts.length === 0) {
    return null;
  }

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card className="mb-6 border-primary/20 bg-gradient-to-br from-background via-background to-primary/5">
          <CardHeader>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Complete Your Order
                  <Badge variant="secondary" className="ml-2">
                    {suggestedProducts.length} Suggestions
                  </Badge>
                </CardTitle>
                {isOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <p className="text-sm text-muted-foreground mt-1">
              Customers who bought items in your cart also bought these
            </p>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {suggestedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative rounded-lg overflow-hidden bg-card hover:shadow-md transition-all duration-300 border"
                  >
                    <div
                      className="relative aspect-square overflow-hidden bg-muted cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <img
                        src={product.image_url}
                        alt={product.image_alt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      {product.is_best_seller && (
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                          Best Seller
                        </Badge>
                      )}
                      {product.compare_price && product.compare_price > product.price && (
                        <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs">
                          Sale
                        </Badge>
                      )}
                    </div>

                    <div className="p-3">
                      <h3
                        className="font-medium text-xs md:text-sm text-foreground mb-2 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleProductClick(product)}
                      >
                        {product.name}
                      </h3>

                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-base md:text-lg font-bold text-primary">
                          {currency} {product.price.toFixed(2)}
                        </span>
                        {product.compare_price && product.compare_price > product.price && (
                          <span className="text-xs text-muted-foreground line-through">
                            {currency} {product.compare_price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        className="w-full text-xs md:text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCartRequest(product);
                        }}
                      >
                        <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        Quick Add
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {addToCartProduct && (
        <AddToCartModal
          product={addToCartProduct}
          isOpen={!!addToCartProduct}
          onClose={() => setAddToCartProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
};

export default CartSuggestions;
