import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const VirtualList = ({
  items = [],
  itemHeight = 60,
  containerHeight = 400,
  overscan = 5,
  renderItem,
  className = '',
  onScroll,
  scrollToIndex,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);
  const scrollElementRef = useRef(null);

  // Calculate virtual list dimensions
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor(scrollTop / itemHeight) + visibleCount + overscan
  );

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      ...item,
      virtualIndex: startIndex + index,
      style: {
        position: 'absolute',
        top: (startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    }));
  }, [items, startIndex, endIndex, itemHeight]);

  // Handle scroll events
  const handleScroll = useCallback((event) => {
    const newScrollTop = event.target.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Scroll to specific index
  useEffect(() => {
    if (scrollToIndex !== undefined && scrollElementRef.current) {
      const targetScrollTop = scrollToIndex * itemHeight;
      scrollElementRef.current.scrollTop = targetScrollTop;
    }
  }, [scrollToIndex, itemHeight]);

  // Auto-scroll to top when items change
  useEffect(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  return (
    <div
      ref={setContainerRef}
      className={`relative overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      {...props}
    >
      <div
        ref={scrollElementRef}
        style={{ height: totalHeight, position: 'relative' }}
      >
        {visibleItems.map((item) => (
          <div
            key={item.id || item.virtualIndex}
            style={item.style}
            className="transition-opacity duration-200"
          >
            {renderItem(item, item.virtualIndex)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VirtualList; 