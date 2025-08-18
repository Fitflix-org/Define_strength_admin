import { useCallback, useMemo, useRef, useState } from 'react';

// Debounce hook for search inputs
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
};

// Memoized filter function
export const useFilteredData = <T>(
  data: T[] | undefined,
  searchTerm: string,
  filterFn: (item: T, search: string) => boolean
) => {
  return useMemo(() => {
    if (!data) return [];
    if (!searchTerm.trim()) return data;
    
    return data.filter(item => filterFn(item, searchTerm.toLowerCase()));
  }, [data, searchTerm, filterFn]);
};

// Virtualization helper for large lists
export const usePagination = <T>(
  data: T[] | undefined,
  itemsPerPage: number = 20
) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const paginatedData = useMemo(() => {
    if (!data) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);
  
  const totalPages = useMemo(() => {
    if (!data) return 0;
    return Math.ceil(data.length / itemsPerPage);
  }, [data, itemsPerPage]);
  
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);
  
  return {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

// Performance monitoring utility
export const performanceLogger = {
  mark: (name: string) => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },
  
  measure: (name: string, startMark: string, endMark?: string) => {
    if (typeof performance !== 'undefined' && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        console.log(`${name}: ${measure.duration.toFixed(2)}ms`);
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }
  },
  
  clearMarks: () => {
    if (typeof performance !== 'undefined' && performance.clearMarks) {
      performance.clearMarks();
    }
  },
};
