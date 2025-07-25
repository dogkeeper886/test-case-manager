import { useMemo, useCallback, useRef } from 'react';
import FilterCache, { memoize, debounce } from '../utils/filterCache';

const useOptimizedFilters = (items = [], filters = {}) => {
  const cacheRef = useRef(new FilterCache(100));
  const lastFiltersRef = useRef(null);

  // Memoized filter function
  const applyFilters = useMemo(() => memoize((items, filters) => {
    let filtered = [...items];

    // Search filter
    if (filters.search?.query && filters.search.query.trim() !== '') {
      const query = filters.search.query.toLowerCase();
      const field = filters.search.field || 'all';
      const operator = filters.search.operator || 'AND';

      filtered = filtered.filter(item => {
        if (field === 'all') {
          const searchableFields = [
            item.title,
            item.description,
            item.id?.toString(),
            item.tags?.join(' ')
          ].filter(Boolean);

          if (operator === 'AND') {
            return searchableFields.some(field => 
              field.toLowerCase().includes(query)
            );
          } else if (operator === 'OR') {
            return searchableFields.some(field => 
              field.toLowerCase().includes(query)
            );
          } else if (operator === 'NOT') {
            return !searchableFields.some(field => 
              field.toLowerCase().includes(query)
            );
          }
        } else {
          const fieldValue = item[field]?.toString().toLowerCase() || '';
          if (operator === 'NOT') {
            return !fieldValue.includes(query);
          }
          return fieldValue.includes(query);
        }
        return true;
      });
    }

    // Project filter
    if (filters.project && filters.project.trim() !== '') {
      filtered = filtered.filter(item => 
        item.project_name === filters.project
      );
    }

    // Suite filter
    if (filters.suite && filters.suite.trim() !== '') {
      filtered = filtered.filter(item => 
        item.test_suite_name === filters.suite
      );
    }

    // Status filter
    if (filters.status && filters.status.toString().trim() !== '') {
      filtered = filtered.filter(item => 
        item.status === parseInt(filters.status)
      );
    }

    // Priority filter
    if (filters.priority && filters.priority.toString().trim() !== '') {
      filtered = filtered.filter(item => 
        item.priority === parseInt(filters.priority)
      );
    }

    // Date filters
    if (filters.dates) {
      Object.entries(filters.dates).forEach(([dateType, dateFilter]) => {
        if (dateFilter.enabled && (dateFilter.start || dateFilter.end)) {
          filtered = filtered.filter(item => {
            const itemDate = new Date(item[`${dateType}_at`] || item.created_at);
            const startDate = dateFilter.start ? new Date(dateFilter.start) : null;
            const endDate = dateFilter.end ? new Date(dateFilter.end) : null;

            if (startDate && endDate) {
              return itemDate >= startDate && itemDate <= endDate;
            } else if (startDate) {
              return itemDate >= startDate;
            } else if (endDate) {
              return itemDate <= endDate;
            }
            return true;
          });
        }
      });
    }

    return filtered;
  }), []);

  // Optimized filtering with caching
  const filteredItems = useMemo(() => {
    const filterKey = JSON.stringify(filters);
    
    // Check if filters haven't changed
    if (lastFiltersRef.current === filterKey) {
      return cacheRef.current.get(filterKey)?.value || items;
    }

    // Generate cache key
    const cacheKey = cacheRef.current.generateKey(filters, items);
    
    // Check cache first
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      lastFiltersRef.current = filterKey;
      return cached.value;
    }

    // Apply filters synchronously
    const result = applyFilters(items, filters);
    
    // Cache result
    cacheRef.current.set(cacheKey, result);
    lastFiltersRef.current = filterKey;
    
    return result;
  }, [items, filters, applyFilters]);

  // Cache statistics
  const cacheStats = useMemo(() => {
    return cacheRef.current.getStats();
  }, [filteredItems]);

  // Clear cache
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    lastFiltersRef.current = null;
  }, []);

  // Invalidate cache for specific pattern
  const invalidateCache = useCallback((pattern) => {
    cacheRef.current.invalidate(pattern);
  }, []);

  return {
    filteredItems: filteredItems || [],
    cacheStats,
    clearCache,
    invalidateCache
  };
};

export default useOptimizedFilters; 