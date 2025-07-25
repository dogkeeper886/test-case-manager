import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '../ui';

const FilterChip = ({ 
  label, 
  value, 
  onRemove, 
  variant = 'default',
  className = '' 
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'search':
        return 'bg-apple-blue/10 text-apple-blue border-apple-blue/20';
      case 'date':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'status':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'priority':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'project':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'suite':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-apple-gray-1 text-apple-gray-7 border-apple-gray-2';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-sf ${getVariantClasses()} ${className}`}
    >
      <span className="font-medium">{label}:</span>
      <span className="truncate max-w-32">{value}</span>
      {onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="h-4 w-4 p-0 hover:bg-black/10 rounded-full"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </motion.div>
  );
};

export default FilterChip; 