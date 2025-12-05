-- Seed invite codes for testing
INSERT INTO invite_codes (code) VALUES
  ('FOUNDER2024'),
  ('INVESTOR2024'),
  ('BUILDER2024'),
  ('STARTUP2024'),
  ('VENTURE2024')
ON CONFLICT DO NOTHING;
