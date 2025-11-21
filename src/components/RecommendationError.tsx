import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface RecommendationErrorProps {
  error: Error | null;
  onRetry: () => void;
  title: string;
  description: string;
}

export const RecommendationError: React.FC<RecommendationErrorProps> = ({
  error,
  onRetry,
  title,
  description
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <Card className="mb-6 border-yellow-200 bg-yellow-50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-yellow-800">{title}</h3>
            <p className="text-sm text-yellow-700 mt-1">{description}</p>

            {process.env.NODE_ENV === 'development' && error && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs text-yellow-600 cursor-pointer hover:text-yellow-800 underline"
                >
                  {showDetails ? 'Hide' : 'Show'} error details
                </button>
                {showDetails && (
                  <pre className="text-xs text-yellow-600 mt-1 bg-yellow-100 p-2 rounded overflow-auto max-h-32">
                    {error.message}
                    {error.stack && `\n\nStack trace:\n${error.stack}`}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" onClick={onRetry}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};