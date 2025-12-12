-- Create regions table
CREATE TABLE public.regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- RLS policy for authenticated users to read
CREATE POLICY "Regions are viewable by authenticated users" 
ON public.regions FOR SELECT 
USING (true);

-- Add region column to markets table
ALTER TABLE public.markets ADD COLUMN IF NOT EXISTS region text;

-- Add region and submarket columns to facilities table
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS region text;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS submarket text;

-- Populate regions
INSERT INTO public.regions (region) VALUES 
  ('Southeast'),
  ('Midwest'),
  ('South Central')
ON CONFLICT (region) DO NOTHING;

-- Clear existing markets and repopulate with region mapping
DELETE FROM public.markets;
INSERT INTO public.markets (market, region) VALUES 
  ('Florida', 'Southeast'),
  ('Tennessee', 'Southeast'),
  ('Baltimore', 'Southeast'),
  ('Illinois', 'Midwest'),
  ('Indiana', 'Midwest'),
  ('Wisconsin', 'Midwest'),
  ('Kansas', 'South Central'),
  ('Oklahoma', 'South Central'),
  ('Texas', 'South Central');

-- Clear existing facilities and repopulate with full hierarchy
DELETE FROM public.facilities;
INSERT INTO public.facilities (facility_id, facility_name, market, region, submarket) VALUES
  -- Florida - FLJAC submarket
  ('10035_00043', 'Ascension St. Vincent''s Clay County', 'Florida', 'Southeast', 'FLJAC'),
  ('10035_00001', 'Ascension St. Vincent''s Riverside', 'Florida', 'Southeast', 'FLJAC'),
  ('10035_00002', 'Ascension St. Vincent''s Southside', 'Florida', 'Southeast', 'FLJAC'),
  ('10035_70003', 'Ascension St. Vincent''s Ambulatory Care', 'Florida', 'Southeast', 'FLJAC'),
  -- Florida - FLPEN submarket
  ('10035_00025', 'Ascension Sacred Heart Emerald Coast', 'Florida', 'Southeast', 'FLPEN'),
  ('10035_00024', 'Ascension Sacred Heart Gulf', 'Florida', 'Southeast', 'FLPEN'),
  ('10035_00023', 'Ascension Sacred Heart Pensacola', 'Florida', 'Southeast', 'FLPEN'),
  ('10035_70029', 'Ascension Medical Group Sacred Heart', 'Florida', 'Southeast', 'FLPEN'),
  -- Tennessee - TNNAS submarket
  ('10035_00057', 'Ascension Saint Thomas Hospital for Spinal Surgery', 'Tennessee', 'Southeast', 'TNNAS'),
  ('10035_00056', 'Ascension Saint Thomas Midtown', 'Tennessee', 'Southeast', 'TNNAS'),
  ('10035_00058', 'Ascension Saint Thomas West', 'Tennessee', 'Southeast', 'TNNAS'),
  ('10035_00051', 'Ascension Saint Thomas Rutherford', 'Tennessee', 'Southeast', 'TNNAS'),
  ('10035_00054', 'Ascension Saint Thomas Highlands', 'Tennessee', 'Southeast', 'TNNAS'),
  ('10035_00055', 'Ascension Saint Thomas DeKalb', 'Tennessee', 'Southeast', 'TNNAS'),
  ('10035_00052', 'Ascension Saint Thomas River Park', 'Tennessee', 'Southeast', 'TNNAS'),
  ('10035_00053', 'Ascension Saint Thomas Stones River', 'Tennessee', 'Southeast', 'TNNAS'),
  ('10035_70059', 'Ascension Medical Group St. Thomas', 'Tennessee', 'Southeast', 'TNNAS'),
  -- Baltimore - MDBAL submarket
  ('10035_00062', 'Ascension Saint Agnes Hospital', 'Baltimore', 'Southeast', 'MDBAL'),
  ('10035_70061', 'Ascension Medical Group at Saint Agnes', 'Baltimore', 'Southeast', 'MDBAL'),
  -- Illinois - ILARL submarket
  ('10035_00046', 'AMITA Health Alexian Brothers Medical Center Elk Grove Village', 'Illinois', 'Midwest', 'ILARL'),
  ('10035_00047', 'AMITA Health Saint Alexius Medical Center', 'Illinois', 'Midwest', 'ILARL'),
  ('10035_00048', 'AMITA Health Alexian Brothers Behavioral Health Hospital', 'Illinois', 'Midwest', 'ILARL'),
  ('10035_70050', 'AMITA Health Medical Group', 'Illinois', 'Midwest', 'ILARL'),
  -- Indiana - ININD submarket
  ('10035_00008', 'Ascension St. Vincent Indianapolis Hospital', 'Indiana', 'Midwest', 'ININD'),
  ('10035_00012', 'Ascension St. Vincent Carmel Hospital', 'Indiana', 'Midwest', 'ININD'),
  ('10035_00016', 'Ascension St. Vincent Fishers Hospital', 'Indiana', 'Midwest', 'ININD'),
  ('10035_00014', 'Ascension St. Vincent Heart Center', 'Indiana', 'Midwest', 'ININD'),
  ('10035_00011', 'Ascension St. Vincent Anderson', 'Indiana', 'Midwest', 'ININD'),
  ('10035_00017', 'Peyton Manning Children''s Hospital', 'Indiana', 'Midwest', 'ININD'),
  ('10035_70010', 'Ascension Medical Group St. Vincent', 'Indiana', 'Midwest', 'ININD'),
  -- Indiana - INEVA submarket
  ('10035_00006', 'Ascension St. Vincent Evansville', 'Indiana', 'Midwest', 'INEVA'),
  ('10035_00004', 'Ascension St. Vincent Warrick', 'Indiana', 'Midwest', 'INEVA'),
  ('10035_00005', 'Ascension St. Vincent Dunn', 'Indiana', 'Midwest', 'INEVA'),
  ('10035_70007', 'Ascension Medical Group St. Vincent Evansville', 'Indiana', 'Midwest', 'INEVA'),
  -- Wisconsin - WIMIL submarket
  ('10035_00035', 'Ascension Columbia St. Mary''s Hospital Milwaukee', 'Wisconsin', 'Midwest', 'WIMIL'),
  ('10035_00036', 'Ascension Columbia St. Mary''s Hospital Ozaukee', 'Wisconsin', 'Midwest', 'WIMIL'),
  ('10035_00037', 'Ascension SE Wisconsin Hospital St. Joseph''s Campus', 'Wisconsin', 'Midwest', 'WIMIL'),
  ('10035_00039', 'Ascension All Saints', 'Wisconsin', 'Midwest', 'WIMIL'),
  ('10035_00040', 'Ascension Caledonia', 'Wisconsin', 'Midwest', 'WIMIL'),
  ('10035_00038', 'Ascension Franklin', 'Wisconsin', 'Midwest', 'WIMIL'),
  ('10035_70044', 'Ascension Medical Group Wisconsin', 'Wisconsin', 'Midwest', 'WIMIL'),
  -- Kansas - KSWIC submarket
  ('10035_00019', 'Ascension Via Christi St. Francis', 'Kansas', 'South Central', 'KSWIC'),
  ('10035_00021', 'Ascension Via Christi St. Joseph', 'Kansas', 'South Central', 'KSWIC'),
  ('10035_00020', 'Ascension Via Christi St. Teresa', 'Kansas', 'South Central', 'KSWIC'),
  ('10035_00022', 'Ascension Via Christi Rehabilitation Hospital', 'Kansas', 'South Central', 'KSWIC'),
  ('10035_70018', 'Ascension Medical Group Via Christi', 'Kansas', 'South Central', 'KSWIC'),
  -- Oklahoma - OKTUL submarket
  ('10035_00030', 'Ascension St. John Medical Center', 'Oklahoma', 'South Central', 'OKTUL'),
  ('10035_00033', 'Ascension St. John Broken Arrow', 'Oklahoma', 'South Central', 'OKTUL'),
  ('10035_00032', 'Ascension St. John Owasso', 'Oklahoma', 'South Central', 'OKTUL'),
  ('10035_00034', 'Ascension St. John Sapulpa', 'Oklahoma', 'South Central', 'OKTUL'),
  ('10035_00031', 'Ascension St. John Jane Phillips', 'Oklahoma', 'South Central', 'OKTUL'),
  ('10035_70028', 'Ascension Medical Group St. John', 'Oklahoma', 'South Central', 'OKTUL'),
  -- Texas - TXAUS submarket
  ('10035_00064', 'Ascension Seton Medical Center Austin', 'Texas', 'South Central', 'TXAUS'),
  ('10035_00066', 'Ascension Seton Northwest', 'Texas', 'South Central', 'TXAUS'),
  ('10035_00065', 'Ascension Seton Southwest', 'Texas', 'South Central', 'TXAUS'),
  ('10035_00069', 'Ascension Seton Williamson', 'Texas', 'South Central', 'TXAUS'),
  ('10035_00068', 'Ascension Seton Hays', 'Texas', 'South Central', 'TXAUS'),
  ('10035_00067', 'Ascension Seton Highland Lakes', 'Texas', 'South Central', 'TXAUS'),
  ('10035_00070', 'Dell Children''s Medical Center', 'Texas', 'South Central', 'TXAUS'),
  ('10035_70063', 'Ascension Medical Group Seton', 'Texas', 'South Central', 'TXAUS');