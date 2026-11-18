INSERT INTO "Permission" ("id", "description") VALUES
  ('offers.read', 'Read offers (including drafts)'),
  ('offers.write', 'Create and update offers'),
  ('offers.publish', 'Publish and archive offers'),
  ('categories.write', 'Create and update categories')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId") VALUES
  ('super_admin', 'offers.read'),
  ('super_admin', 'offers.write'),
  ('super_admin', 'offers.publish'),
  ('super_admin', 'categories.write'),
  ('security_admin', 'offers.read'),
  ('read_only_auditor', 'offers.read')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;