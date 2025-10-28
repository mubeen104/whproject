import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { EventFilters } from '@/hooks/usePixelEventDetails';
import { useEnabledPixels } from '@/hooks/useAdvertisingPixels';

interface PixelEventFiltersProps {
  onFilterChange: (filters: EventFilters) => void;
  currentFilters: EventFilters;
}

const EVENT_TYPES = [
  { value: 'page_view', label: 'Page View' },
  { value: 'view_content', label: 'Product View' },
  { value: 'add_to_cart', label: 'Add to Cart' },
  { value: 'initiate_checkout', label: 'Checkout Started' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'search', label: 'Search' }
];

export const PixelEventFilters = ({ onFilterChange, currentFilters }: PixelEventFiltersProps) => {
  const { data: pixels = [] } = useEnabledPixels();
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(currentFilters.eventTypes || []);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(currentFilters.platforms || []);
  const [minValue, setMinValue] = useState<string>(currentFilters.minValue?.toString() || '');
  const [maxValue, setMaxValue] = useState<string>(currentFilters.maxValue?.toString() || '');

  const handleApplyFilters = () => {
    const filters: EventFilters = {};

    if (dateRange.start && dateRange.end) {
      filters.dateRange = {
        start: format(dateRange.start, 'yyyy-MM-dd'),
        end: format(dateRange.end, 'yyyy-MM-dd')
      };
    }

    if (selectedEventTypes.length > 0) {
      filters.eventTypes = selectedEventTypes;
    }

    if (selectedPlatforms.length > 0) {
      filters.platforms = selectedPlatforms;
    }

    if (minValue) {
      filters.minValue = parseFloat(minValue);
    }

    if (maxValue) {
      filters.maxValue = parseFloat(maxValue);
    }

    onFilterChange(filters);
  };

  const handleClearFilters = () => {
    setDateRange({});
    setSelectedEventTypes([]);
    setSelectedPlatforms([]);
    setMinValue('');
    setMaxValue('');
    onFilterChange({});
  };

  const toggleEventType = (type: string) => {
    setSelectedEventTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  const activeFiltersCount = 
    (dateRange.start ? 1 : 0) +
    selectedEventTypes.length +
    selectedPlatforms.length +
    (minValue ? 1 : 0) +
    (maxValue ? 1 : 0);

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filters</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary">{activeFiltersCount} active</Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleClearFilters}>
          <X className="h-4 w-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.start && dateRange.end
                  ? `${format(dateRange.start, 'MMM dd')} - ${format(dateRange.end, 'MMM dd')}`
                  : 'Select dates'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={{ from: dateRange.start, to: dateRange.end }}
                onSelect={(range) => setDateRange({ start: range?.from, end: range?.to })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Event Types */}
        <div className="space-y-2">
          <Label>Event Types</Label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map(type => (
              <Badge
                key={type.value}
                variant={selectedEventTypes.includes(type.value) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleEventType(type.value)}
              >
                {type.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div className="space-y-2">
          <Label>Platforms</Label>
          <div className="flex flex-wrap gap-2">
            {pixels.map(pixel => (
              <Badge
                key={pixel.id}
                variant={selectedPlatforms.includes(pixel.platform) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => togglePlatform(pixel.platform)}
              >
                {pixel.platform}
              </Badge>
            ))}
          </div>
        </div>

        {/* Value Range */}
        <div className="space-y-2">
          <Label>Min Value (PKR)</Label>
          <Input
            type="number"
            placeholder="0"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Max Value (PKR)</Label>
          <Input
            type="number"
            placeholder="10000"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};
