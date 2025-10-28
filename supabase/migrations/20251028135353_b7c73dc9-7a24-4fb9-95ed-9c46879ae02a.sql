-- Update data_refresh_log with the correct 3 data sources
DELETE FROM public.data_refresh_log;

INSERT INTO public.data_refresh_log (data_source, last_refresh_at, refresh_status, notes)
VALUES 
  ('positions_data', now(), 'success', 'Initial sync completed'),
  ('staffing_grid', now(), 'success', 'Initial sync completed'),
  ('labor_uos_data', now(), 'success', 'Initial sync completed')
ON CONFLICT (data_source) DO NOTHING;