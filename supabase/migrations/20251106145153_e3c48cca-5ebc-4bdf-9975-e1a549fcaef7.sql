-- Insert demo employees for Texas / Dell Seton / Radiology / Radiology Tech
INSERT INTO positions (
  market, "facilityId", "facilityName", "departmentId", "departmentName",
  "jobTitle", "jobFamily", "employeeName", "employeeId", "FTE",
  "positionLifecycle", "positionStatus", "employmentFlag", "employeeType", "standardHours"
) VALUES 
  ('Texas', '30049', 'Dell Seton', '10210', 'Radiology', 'Radiology Tech', 'Allied Health', 'Sarah Martinez', 'EMP001', 0.5, 'Filled', 'Active', 'Regular', 'FT', 40),
  ('Texas', '30049', 'Dell Seton', '10210', 'Radiology', 'Radiology Tech', 'Allied Health', 'James Wilson', 'EMP002', 0.5, 'Filled', 'Active', 'Regular', 'FT', 40),
  ('Texas', '30049', 'Dell Seton', '10210', 'Radiology', 'Radiology Tech', 'Allied Health', 'Emily Chen', 'EMP003', 1.0, 'Filled', 'Active', 'Regular', 'FT', 40),
  ('Texas', '30049', 'Dell Seton', '10210', 'Radiology', 'Radiology Tech', 'Allied Health', 'David Park', 'EMP004', 0.3, 'Filled', 'Active', 'Regular', 'PT', 24),
  ('Texas', '30049', 'Dell Seton', '10210', 'Radiology', 'Radiology Tech', 'Allied Health', 'Lisa Anderson', 'EMP005', 0.2, 'Filled', 'Active', 'Regular', 'PT', 16);

-- Insert demo employees for Florida / St. Vincent's Riverside / Laboratory / Lab Tech
INSERT INTO positions (
  market, "facilityId", "facilityName", "departmentId", "departmentName",
  "jobTitle", "jobFamily", "employeeName", "employeeId", "FTE",
  "positionLifecycle", "positionStatus", "employmentFlag", "employeeType", "standardHours"
) VALUES 
  ('Florida', '40022', 'St. Vincent''s Riverside', '10310', 'Laboratory', 'Lab Tech', 'Allied Health', 'Michael Brown', 'EMP006', 1.0, 'Filled', 'Active', 'Regular', 'FT', 40),
  ('Florida', '40022', 'St. Vincent''s Riverside', '10310', 'Laboratory', 'Lab Tech', 'Allied Health', 'Jennifer Davis', 'EMP007', 1.0, 'Filled', 'Active', 'Regular', 'FT', 40),
  ('Florida', '40022', 'St. Vincent''s Riverside', '10310', 'Laboratory', 'Lab Tech', 'Allied Health', 'Robert Taylor', 'EMP008', 0.8, 'Filled', 'Active', 'Regular', 'FT', 40),
  ('Florida', '40022', 'St. Vincent''s Riverside', '10310', 'Laboratory', 'Lab Tech', 'Allied Health', 'Amanda White', 'EMP009', 0.75, 'Filled', 'Active', 'Regular', 'FT', 40),
  ('Florida', '40022', 'St. Vincent''s Riverside', '10310', 'Laboratory', 'Lab Tech', 'Allied Health', 'Christopher Lee', 'EMP010', 0.6, 'Filled', 'Active', 'Regular', 'FT', 40),
  ('Florida', '40022', 'St. Vincent''s Riverside', '10310', 'Laboratory', 'Lab Tech', 'Allied Health', 'Patricia Moore', 'EMP011', 0.5, 'Filled', 'Active', 'Regular', 'PT', 40);

-- Insert demo employees for Alabama / St. Vincent's Birmingham / Pharmacy / Pharmacist
INSERT INTO positions (
  market, "facilityId", "facilityName", "departmentId", "departmentName",
  "jobTitle", "jobFamily", "employeeName", "employeeId", "FTE",
  "positionLifecycle", "positionStatus", "employmentFlag", "employeeType", "standardHours"
) VALUES 
  ('Alabama', '40015', 'St. Vincent''s Birmingham', '10410', 'Pharmacy', 'Pharmacist', 'Pharmacy', 'Daniel Harris', 'EMP012', 0.9, 'Filled', 'Active', 'Regular', 'FT', 40),
  ('Alabama', '40015', 'St. Vincent''s Birmingham', '10410', 'Pharmacy', 'Pharmacist', 'Pharmacy', 'Michelle Clark', 'EMP013', 0.6, 'Filled', 'Active', 'Regular', 'FT', 40),
  ('Alabama', '40015', 'St. Vincent''s Birmingham', '10410', 'Pharmacy', 'Pharmacist', 'Pharmacy', 'Kevin Rodriguez', 'EMP014', 0.75, 'Filled', 'Active', 'Regular', 'FT', 40),
  ('Alabama', '40015', 'St. Vincent''s Birmingham', '10410', 'Pharmacy', 'Pharmacist', 'Pharmacy', 'Rebecca Martinez', 'EMP015', 0.8, 'Filled', 'Active', 'Regular', 'FT', 40),
  ('Alabama', '40015', 'St. Vincent''s Birmingham', '10410', 'Pharmacy', 'Pharmacist', 'Pharmacy', 'Thomas Garcia', 'EMP016', 0.5, 'Filled', 'Active', 'Regular', 'PT', 40);