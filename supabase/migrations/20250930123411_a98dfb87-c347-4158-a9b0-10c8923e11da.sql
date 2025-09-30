-- Add INSERT policies for data import tables
-- Allow authenticated users to insert into staffing_standards
CREATE POLICY "Authenticated users can insert staffing standards"
ON public.staffing_standards
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to insert into labor_performance
CREATE POLICY "Authenticated users can insert labor performance"
ON public.labor_performance
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to insert into positions
CREATE POLICY "Authenticated users can insert positions"
ON public.positions
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to insert into markets
CREATE POLICY "Authenticated users can insert markets"
ON public.markets
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to insert into facilities
CREATE POLICY "Authenticated users can insert facilities"
ON public.facilities
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to insert into departments
CREATE POLICY "Authenticated users can insert departments"
ON public.departments
FOR INSERT
TO authenticated
WITH CHECK (true);