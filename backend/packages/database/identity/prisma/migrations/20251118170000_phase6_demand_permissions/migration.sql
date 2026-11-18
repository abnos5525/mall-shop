INSERT INTO "Permission" ("id", "description") VALUES
  ('demand.read', 'Read demand requests'),
  ('demand.moderate', 'Moderate demand requests')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId") VALUES
  ('super_admin', 'demand.read'),
  ('super_admin', 'demand.moderate'),
  ('security_admin', 'demand.read')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;