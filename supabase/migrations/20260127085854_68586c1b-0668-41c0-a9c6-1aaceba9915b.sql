-- Phase 1.1: Add 'manager' to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';