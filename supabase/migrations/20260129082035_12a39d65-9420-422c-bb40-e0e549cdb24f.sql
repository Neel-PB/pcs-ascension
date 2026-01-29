-- Update markets policy to allow public read
DROP POLICY IF EXISTS "Markets are viewable by authenticated users" ON markets;
CREATE POLICY "Markets are viewable by everyone" ON markets
  FOR SELECT
  TO public
  USING (true);

-- Update facilities policy to allow public read  
DROP POLICY IF EXISTS "Facilities are viewable by authenticated users" ON facilities;
CREATE POLICY "Facilities are viewable by everyone" ON facilities
  FOR SELECT
  TO public
  USING (true);

-- Update departments policy to allow public read
DROP POLICY IF EXISTS "Departments are viewable by authenticated users" ON departments;
CREATE POLICY "Departments are viewable by everyone" ON departments
  FOR SELECT
  TO public
  USING (true);