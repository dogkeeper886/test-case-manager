class FilterCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
  }

  // Generate cache key from filter parameters
  generateKey(filters, items) {
    const filterString = JSON.stringify({
      search: filters.search,
      project: filters.project,
      suite: filters.suite,
      status: filters.status,
      priority: filters.priority,
      dates: filters.dates
    });
    
    // Include items hash for cache invalidation
    const itemsHash = this.hashItems(items);
    
    return `${filterString}_${itemsHash}`;
  }

  // Simple hash function for items array
  hashItems(items) {
    if (!items || items.length === 0) return 'empty';
    
    // Use first and last item IDs and total count for quick hash
    const firstId = items[0]?.id || 0;
    const lastId = items[items.length - 1]?.id || 0;
    const count = items.length;
    
    return `${firstId}_${lastId}_${count}`;
  }

  // Get cached result
  get(key) {
    if (!this.cache.has(key)) {
      return null;
    }

    // Update access order
    this.updateAccessOrder(key);
    
    return this.cache.get(key);
  }

  // Set cached result
  set(key, value) {
    // Remove oldest entry if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0
    });
    
    this.updateAccessOrder(key);
  }

  // Update access order for LRU
  updateAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
    
    // Update access count
    const entry = this.cache.get(key);
    if (entry) {
      entry.accessCount++;
    }
  }

  // Evict oldest entry
  evictOldest() {
    if (this.accessOrder.length === 0) return;
    
    const oldestKey = this.accessOrder.shift();
    this.cache.delete(oldestKey);
  }

  // Clear cache
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  // Get cache statistics
  getStats() {
    const entries = Array.from(this.cache.values());
    const totalAccess = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const avgAccess = entries.length > 0 ? totalAccess / entries.length : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalAccess,
      avgAccess,
      hitRate: this.calculateHitRate()
    };
  }

  // Calculate cache hit rate (simplified)
  calculateHitRate() {
    // This would need to be implemented with actual hit tracking
    return 0.85; // Placeholder
  }

  // Invalidate cache entries that match a pattern
  invalidate(pattern) {
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      const index = this.accessOrder.indexOf(key);
      if (index > -1) {
        this.accessOrder.splice(index, 1);
      }
    });
  }
}

// Debounce utility for filter operations
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle utility for scroll events
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoization utility for expensive filter operations
export const memoize = (fn) => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

// Performance monitoring utility
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  startTimer(operation) {
    this.metrics.set(operation, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    });
  }

  endTimer(operation) {
    const metric = this.metrics.get(operation);
    if (metric) {
      metric.endTime = performance.now();
      metric.duration = metric.endTime - metric.startTime;
    }
  }

  getMetrics() {
    const results = {};
    for (const [operation, metric] of this.metrics) {
      results[operation] = {
        duration: metric.duration,
        startTime: metric.startTime,
        endTime: metric.endTime
      };
    }
    return results;
  }

  logMetrics() {
    console.log('Performance Metrics:', this.getMetrics());
  }
}

export default FilterCache; 