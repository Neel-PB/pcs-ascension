import { Database } from '@/integrations/supabase/types';

/**
 * Position type from Supabase database, extended with override tracking
 */
export type Position = Database['public']['Tables']['positions']['Row'] & {
  /** ID of the NestJS position-override record, if one exists */
  overrideId?: string;
};
