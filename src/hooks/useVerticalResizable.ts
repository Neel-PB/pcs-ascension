import { useState, useCallback, useEffect } from 'react';
import { useWorkforceDrawer } from '@/stores/useWorkforceDrawer';

interface UseVerticalResizableOptions {
  minHeight: number;
  maxHeightVh: number;
}

export const useVerticalResizable = ({ minHeight, maxHeightVh }: UseVerticalResizableOptions) => {
  const { height, setHeight } = useWorkforceDrawer();
  const [isDragging, setIsDragging] = useState(false);
  const [currentHeight, setCurrentHeight] = useState(height);

  const maxHeight = typeof window !== 'undefined' ? window.innerHeight * maxHeightVh : 600;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const newHeight = Math.max(minHeight, Math.min(maxHeight, window.innerHeight - e.clientY));
      setCurrentHeight(newHeight);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setHeight(currentHeight);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, currentHeight, setHeight, minHeight, maxHeight]);

  // Sync with store when not dragging
  useEffect(() => {
    if (!isDragging) {
      setCurrentHeight(height);
    }
  }, [height, isDragging]);

  return {
    isDragging,
    currentHeight: isDragging ? currentHeight : height,
    handlePointerDown,
  };
};
