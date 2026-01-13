import { useState, useCallback, useEffect } from 'react';
import { useFeedbackStore } from '@/stores/useFeedbackStore';

interface UseFeedbackResizableOptions {
  minWidth: number;
  maxWidthVw: number;
  snapPoints?: number[];
}

export const useFeedbackResizable = ({ minWidth, maxWidthVw, snapPoints = [] }: UseFeedbackResizableOptions) => {
  const { width, setWidth } = useFeedbackStore();
  const [isDragging, setIsDragging] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width);

  const maxWidth = typeof window !== 'undefined' ? window.innerWidth * maxWidthVw : 1000;

  const findClosestSnapPoint = useCallback((targetWidth: number): number => {
    if (snapPoints.length === 0) return targetWidth;

    const validSnapPoints = snapPoints.filter(point => point >= minWidth && point <= maxWidth);
    if (validSnapPoints.length === 0) return targetWidth;

    const closest = validSnapPoints.reduce((prev, curr) => {
      return Math.abs(curr - targetWidth) < Math.abs(prev - targetWidth) ? curr : prev;
    });

    const threshold = 30;
    return Math.abs(closest - targetWidth) < threshold ? closest : targetWidth;
  }, [snapPoints, minWidth, maxWidth]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      const newWidth = Math.max(minWidth, Math.min(maxWidth, window.innerWidth - e.clientX));
      setCurrentWidth(newWidth);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      const snappedWidth = findClosestSnapPoint(currentWidth);
      setWidth(snappedWidth);
      setCurrentWidth(snappedWidth);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, currentWidth, findClosestSnapPoint, setWidth, minWidth, maxWidth]);

  return {
    isDragging,
    currentWidth: isDragging ? currentWidth : width,
    handlePointerDown,
  };
};
