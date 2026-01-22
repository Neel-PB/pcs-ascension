import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ClosureSelectionKey {
  departmentId: string;
  facilityId: string;
  skillType: string;
  shift: 'Day' | 'Night';
  employmentType: 'Full-Time' | 'Part-Time' | 'PRN';
}

export interface ClosureSelection extends ClosureSelectionKey {
  id: string;
  selectedClosureIds: string[];
  selectedFteSum: number;
}

// Local state management for closure selections (no DB persistence for now, can add later)
export function useClosureSelections() {
  const { user } = useAuth();
  const [selections, setSelections] = useState<Map<string, Set<string>>>(new Map());
  const [isSaving, setIsSaving] = useState(false);

  // Generate a unique key for a closure selection context
  const getSelectionKey = useCallback((key: ClosureSelectionKey): string => {
    return `${key.departmentId}|${key.facilityId}|${key.skillType}|${key.shift}|${key.employmentType}`;
  }, []);

  // Get selected closure IDs for a specific context
  const getSelectedIds = useCallback((key: ClosureSelectionKey): Set<string> => {
    const selectionKey = getSelectionKey(key);
    return selections.get(selectionKey) || new Set();
  }, [selections, getSelectionKey]);

  // Check if a specific closure ID is selected
  const isSelected = useCallback((key: ClosureSelectionKey, closureId: string): boolean => {
    return getSelectedIds(key).has(closureId);
  }, [getSelectedIds]);

  // Toggle selection of a closure ID
  const toggleSelection = useCallback((key: ClosureSelectionKey, closureId: string): void => {
    setSelections(prev => {
      const newMap = new Map(prev);
      const selectionKey = getSelectionKey(key);
      const currentSet = new Set(prev.get(selectionKey) || []);
      
      if (currentSet.has(closureId)) {
        currentSet.delete(closureId);
      } else {
        currentSet.add(closureId);
      }
      
      newMap.set(selectionKey, currentSet);
      return newMap;
    });
  }, [getSelectionKey]);

  // Set all selections for a specific context
  const setSelectionsForKey = useCallback((key: ClosureSelectionKey, closureIds: string[]): void => {
    setSelections(prev => {
      const newMap = new Map(prev);
      const selectionKey = getSelectionKey(key);
      newMap.set(selectionKey, new Set(closureIds));
      return newMap;
    });
  }, [getSelectionKey]);

  // Clear all selections for a specific context
  const clearSelectionsForKey = useCallback((key: ClosureSelectionKey): void => {
    setSelections(prev => {
      const newMap = new Map(prev);
      const selectionKey = getSelectionKey(key);
      newMap.delete(selectionKey);
      return newMap;
    });
  }, [getSelectionKey]);

  // Clear all selections
  const clearAllSelections = useCallback((): void => {
    setSelections(new Map());
  }, []);

  // Get total selected FTE for a context given the details
  const getSelectedFteSum = useCallback((
    key: ClosureSelectionKey, 
    details: { id: string; fte: number; count: number }[]
  ): number => {
    const selectedIds = getSelectedIds(key);
    return details
      .filter(d => selectedIds.has(d.id))
      .reduce((sum, d) => sum + (d.fte * d.count), 0);
  }, [getSelectedIds]);

  // Persist selections to database (optional, for future use)
  const saveSelections = useCallback(async (key: ClosureSelectionKey): Promise<boolean> => {
    if (!user) return false;
    
    const selectedIds = Array.from(getSelectedIds(key));
    if (selectedIds.length === 0) return true;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('closure_selections')
        .upsert({
          department_id: key.departmentId,
          facility_id: key.facilityId,
          skill_type: key.skillType,
          shift: key.shift,
          employment_type: key.employmentType,
          selected_closure_ids: selectedIds,
          created_by: user.id,
        }, {
          onConflict: 'department_id,facility_id,skill_type,shift,employment_type'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to save closure selections:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [user, getSelectedIds]);

  return {
    getSelectedIds,
    isSelected,
    toggleSelection,
    setSelectionsForKey,
    clearSelectionsForKey,
    clearAllSelections,
    getSelectedFteSum,
    saveSelections,
    isSaving,
  };
}
