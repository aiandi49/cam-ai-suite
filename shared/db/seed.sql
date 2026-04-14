-- ============================================================
-- CAM×AI Demo Seed Data — Run after schema.sql
-- ============================================================

-- Demo Clients (Kameron's real client types)
INSERT INTO clients (name, email, phone, property_type, min_sqft, max_sqft, max_monthly, transaction_type, search_frequency, active)
VALUES
  ('Elijah Daly',   'elijah.daly@email.com',   '520-555-0101', 'retail',     2500, 3500, 3500, 'lease', 'daily',  true),
  ('Marcus Webb',   'marcus.webb@email.com',   '520-555-0102', 'office',     1000, 2000, 2000, 'lease', 'daily',  true),
  ('Sandra Ortiz',  'sandra.ortiz@email.com',  '520-555-0103', 'retail',     3000, 5000, null, 'sale',  'weekly', true),
  ('Dev Singh',     'dev.singh@email.com',     '520-555-0104', 'industrial', 4000, 8000, 4500, 'lease', 'daily',  true),
  ('Hilda Reyes',   'hilda.reyes@email.com',   '520-555-0105', 'retail',     1500, 2500, 2800, 'lease', 'weekly', true),
  ('Tom Farley',    'tom.farley@email.com',    '520-555-0106', 'mixed',      3000, 5000, 4000, 'lease', 'daily',  true)
ON CONFLICT DO NOTHING;

-- Demo Properties (real Tucson addresses)
INSERT INTO properties (source, address, city, state, property_type, sqft, asking_monthly, year_built, cross_street, traffic_count, sprinklered, parking_ratio, listing_status, is_listed, photos)
VALUES
  ('crexi',   '4820 E Broadway Blvd',   'Tucson', 'AZ', 'retail',     2800, 3220, 2008, 'Rosemont Blvd',  38000, true,  4.0, 'available', true,  '[]'),
  ('costar',  '2930 N Oracle Rd',        'Tucson', 'AZ', 'retail',     3200, 3456, 2015, 'Wetmore Rd',     52000, true,  5.5, 'available', true,  '[]'),
  ('loopnet', '6280 S Campbell Ave',     'Tucson', 'AZ', 'retail',     2600, 2990, 2001, 'Irvington Rd',  28000, false, 4.0, 'available', true,  '[]'),
  ('costar',  '9200 E Broadway Blvd',   'Tucson', 'AZ', 'retail',     3200, 3200, 2005, 'Pantano Rd',    41000, true,  4.5, 'available', true,  '[]'),
  ('crexi',   '1234 N Stone Ave',        'Tucson', 'AZ', 'office',     1800, 1900, 1998, 'Speedway Blvd', 22000, false, 3.5, 'available', true,  '[]'),
  ('costar',  '5600 E Speedway Blvd',   'Tucson', 'AZ', 'retail',     2200, 2450, 2010, 'Craycroft Rd',  44000, true,  3.8, 'available', true,  '[]'),
  ('loopnet', '3445 N First Ave',        'Tucson', 'AZ', 'office',     1500, 1650, 2003, 'Glenn St',      18000, false, 4.2, 'available', true,  '[]'),
  ('crexi',   '8441 E 22nd St',          'Tucson', 'AZ', 'industrial', 4200, null, 1995, 'Kolb Rd',       null,  false, 2.0, 'available', false, '[]')
ON CONFLICT DO NOTHING;

-- Demo Leads for outreach engine
INSERT INTO leads (name, company, email, phone, lease_address, lease_sqft, lease_date, lease_source, match_score, match_reason)
VALUES
  ('Maria Santos',  'Santos Bakery',     'maria@santosbakery.com',  '520-555-1001', '820 W Grant Rd',     2400, '2022-03-15', 're_daily_news', 'hot',  'Lease expires ~Mar 2027, size matches perfectly'),
  ('Derek Nolan',   'Nolan Fitness',     'derek@nolanfitness.com',  '520-555-1002', '4002 E Speedway',    3100, '2021-06-01', 'crexi',         'warm', 'Fitness studio — great parking + traffic match'),
  ('Lucinda Vela',  'LV Salon',          'lvela@lvsalon.com',       '520-555-1003', '5600 E Speedway',    1800, '2020-09-10', 're_daily_news', 'cold', 'Older lease, size slightly small'),
  ('Pima Family',   'Pima Family Adv.',  'info@pimafamily.org',     '520-555-1004', '300 W Fort Lowell',  2200, '2023-01-20', 'costar',        'warm', 'Nonprofit — could need larger footprint')
ON CONFLICT DO NOTHING;

SELECT 'Seed data loaded successfully' as status;
SELECT COUNT(*) as clients FROM clients;
SELECT COUNT(*) as properties FROM properties;
SELECT COUNT(*) as leads FROM leads;
