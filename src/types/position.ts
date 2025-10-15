import { Database } from '@/integrations/supabase/types';

/**
 * Position type from Supabase database
 */
export type Position = Database['public']['Tables']['positions']['Row'];
