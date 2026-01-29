import { useState, useEffect, useMemo } from 'react';

/**
 * Custom hook for debounced search input
 * Returns immediate value for display and debounced value for filtering
 */
export function useDebouncedSearch(delay: number = 300) {
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, delay);

    return () => clearTimeout(timer);
  }, [inputValue, delay]);

  return {
    inputValue,
    debouncedValue,
    setInputValue,
  };
}
