import { useState, useEffect, useRef } from 'react';
import { useSearchSuggestions, SearchSuggestion } from '@/hooks/useSearchSuggestions';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp } from 'lucide-react';

interface SearchSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchSuggestions = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search products...',
  className = '',
}: SearchSuggestionsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { suggestions } = useSearchSuggestions(value);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Reset highlighted index when suggestions change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSearch(value);
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          selectSuggestion(suggestions[highlightedIndex]);
        } else {
          onSearch(value);
        }
        setIsOpen(false);
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    navigate(`/product/${suggestion.id}`);
    onChange('');
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-all duration-300 pointer-events-none group-focus-within:text-primary group-focus-within:scale-110" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setIsOpen(!!e.target.value);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(!!value)}
            className="w-full pl-11 pr-4 py-2.5 bg-muted/30 border border-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:shadow-lg rounded-lg transition-all duration-300"
            data-testid="input-search-suggestions"
          />
        </form>
      </PopoverTrigger>
      {isOpen && value && suggestions.length > 0 && (
        <PopoverContent 
          className="w-full p-0 mt-2 border-0 shadow-xl rounded-lg overflow-hidden"
          align="start"
          sideOffset={4}
        >
          <div 
            ref={suggestionsRef}
            className="max-h-80 overflow-y-auto bg-card rounded-lg"
            data-testid="search-suggestions-list"
          >
            {/* Suggestions header */}
            <div className="sticky top-0 px-4 py-2.5 bg-muted/50 border-b border-border/30 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">
                Results ({suggestions.length})
              </span>
            </div>

            {/* Suggestion items */}
            <div className="divide-y divide-border/30">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => selectSuggestion(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left hover:bg-primary/5 ${
                    highlightedIndex === index ? 'bg-primary/10' : ''
                  }`}
                  data-testid={`suggestion-product-${suggestion.id}`}
                >
                  {/* Product Image */}
                  {suggestion.image_url && (
                    <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-muted border border-border/30">
                      <img
                        src={suggestion.image_url}
                        alt={suggestion.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {suggestion.name}
                    </p>
                    <p className="text-xs text-primary font-semibold">
                      ${suggestion.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex-shrink-0 text-muted-foreground opacity-0 transition-all group-hover:opacity-100">
                    →
                  </div>
                </button>
              ))}
            </div>

            {/* View all results button */}
            <div className="sticky bottom-0 border-t border-border/30 bg-muted/30 p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSearch(value);
                  setIsOpen(false);
                }}
                className="w-full h-auto py-2 text-xs font-medium text-primary hover:bg-primary/10"
                data-testid="button-view-all-results"
              >
                View all results for "{value}"
              </Button>
            </div>
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
};
