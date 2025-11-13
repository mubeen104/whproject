import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Star, Check, X, Search, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Review {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  is_approved: boolean;
  is_verified: boolean;
  created_at: string;
  user_id: string;
  product_id: string;
  products: {
    name: string;
    slug: string;
  } | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const useReviews = (status: 'pending' | 'approved' | 'all' = 'all') => {
  return useQuery({
    queryKey: ['admin-reviews', status],
    queryFn: async () => {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          products (
            name,
            slug
          ),
          profiles (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (status === 'pending') {
        query = query.eq('is_approved', false);
      } else if (status === 'approved') {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });
};

const useReviewCounts = () => {
  return useQuery({
    queryKey: ['admin-review-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('is_approved');

      if (error) throw error;
      
      const total = data?.length || 0;
      const approved = data?.filter(review => review.is_approved).length || 0;
      const pending = data?.filter(review => !review.is_approved).length || 0;

      return { total, approved, pending };
    },
  });
};

const AdminReviews = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  const { data: reviews = [], isLoading } = useReviews(activeTab as any);
  const { data: counts = { total: 0, approved: 0, pending: 0 } } = useReviewCounts();

  const updateReviewStatus = useMutation({
    mutationFn: async ({ reviewId, isApproved }: { reviewId: string; isApproved: boolean }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: isApproved })
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: (_, { isApproved }) => {
      toast({
        title: isApproved ? 'Review approved' : 'Review rejected',
        description: isApproved ? 'The review is now visible to customers.' : 'The review has been hidden from customers.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-counts'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update review status. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Review deleted',
        description: 'The review has been permanently deleted.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin-review-counts'] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete review. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const filteredReviews = reviews.filter(review =>
    review.products?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserName = (review: Review) => {
    if (review.profiles?.first_name && review.profiles?.last_name) {
      return `${review.profiles.first_name} ${review.profiles.last_name}`;
    }
    return 'Anonymous User';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Reviews Management</h1>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reviews Management</h1>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({counts.approved})</TabsTrigger>
          <TabsTrigger value="all">All Reviews ({counts.total})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredReviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No reviews found.</p>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{review.products?.name}</h3>
                        <Badge variant={review.is_approved ? 'default' : 'secondary'}>
                          {review.is_approved ? 'Approved' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>By: {getUserName(review)}</span>
                        <span>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {review.title && (
                      <div>
                        <h4 className="font-medium">{review.title}</h4>
                      </div>
                    )}
                    {review.content && (
                      <p className="text-muted-foreground">{review.content}</p>
                    )}
                    
                    <div className="flex items-center space-x-2 pt-4 border-t">
                      {!review.is_approved && (
                        <Button
                          size="sm"
                          onClick={() => updateReviewStatus.mutate({ reviewId: review.id, isApproved: true })}
                          disabled={updateReviewStatus.isPending}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      )}
                      
                      {review.is_approved && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReviewStatus.mutate({ reviewId: review.id, isApproved: false })}
                          disabled={updateReviewStatus.isPending}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Hide
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/product/${review.product_id}`, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Product
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <X className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Review</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently delete this review? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteReview.mutate(review.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReviews;