import { Star } from 'lucide-react';

interface ProductRatingProps {
  averageRating: number;
  reviewCount: number;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductRating = ({
  averageRating,
  reviewCount,
  showCount = true,
  size = 'sm'
}: ProductRatingProps) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`}
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className={`${sizeClasses[size]} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
          </div>
        </div>
      );
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star
          key={`empty-${i}`}
          className={`${sizeClasses[size]} text-gray-300`}
        />
      );
    }

    return stars;
  };

  if (reviewCount === 0) {
    return (
      <div className={`flex items-center gap-1 ${textSizeClasses[size]} text-muted-foreground`}>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`${sizeClasses[size]} text-gray-300`} />
          ))}
        </div>
        <span>No reviews yet</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1.5 ${textSizeClasses[size]}`}>
      <div className="flex gap-0.5">
        {renderStars()}
      </div>
      <span className="font-medium text-foreground">
        {averageRating.toFixed(1)}
      </span>
      {showCount && (
        <span className="text-muted-foreground">
          ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};
