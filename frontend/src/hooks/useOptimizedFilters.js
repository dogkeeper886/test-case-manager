import { useMemo, useCallback } from 'react';

const useOptimizedFilters = (items = [], filters = {}) => {

  // Simple filter function
  const applyFilters = (items, filters) => {
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
  };

  // Simple filtering without caching
  const filteredItems = useMemo(() => {
    // Apply filters directly
    const result = applyFilters(items, filters);
    return result;
  }, [items, filters]);

  return {
    filteredItems: filteredItems || []
  };
};

export default useOptimizedFilters; 