import React from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui';

const FilterChip = ({ 
  label, 
  value, 
  onRemove, 
  variant = 'default',
  className = '',
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'search':
        return 'bg-apple-blue/10 text-apple-blue border-apple-blue/20 hover:bg-apple-blue/20 hover:border-apple-blue/30';
      case 'date':
        return 'bg-success/10 text-success border-success/20 hover:bg-success/20 hover:border-success/30';
      case 'status':
        return 'bg-warning/10 text-warning border-warning/20 hover:bg-warning/20 hover:border-warning/30';
      case 'priority':
        return 'bg-error/10 text-error border-error/20 hover:bg-error/20 hover:border-error/30';
      case 'project':
        return 'bg-info/10 text-info border-info/20 hover:bg-info/20 hover:border-info/30';
      case 'suite':
        return 'bg-apple-blue/10 text-apple-blue border-apple-blue/20 hover:bg-apple-blue/20 hover:border-apple-blue/30';
      default:
        return 'bg-apple-gray-1 text-apple-gray-7 border-apple-gray-2 hover:bg-apple-gray-2 hover:border-apple-gray-3';
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-sf font-medium transition-all duration-200 hover:shadow-apple-sm hover:-translate-y-0.5 ${getVariantClasses()} ${className}`}
      data-testid={`filter-chip-${variant}`}
      {...props}
    >
      <span className="font-semibold text-xs uppercase tracking-wide" data-testid="filter-chip-label">{label}:</span>
      <span className="truncate max-w-32 font-medium" data-testid="filter-chip-value">{value}</span>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-5 w-5 p-0 hover:bg-black/10 rounded-full transition-all duration-200 hover:scale-110"
          data-testid="filter-chip-remove-button"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
};

export default FilterChip; 