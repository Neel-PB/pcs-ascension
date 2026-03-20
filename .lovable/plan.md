

## NestJS Seed Data Requirements

### What You Need

Your frontend's `rbacConfig.ts` defines the exact role-permission matrix. Here's everything your NestJS seed must contain:

---

### 1. `users` table — Admin seed (already done)

```sql
INSERT INTO users (email, password_hash, first_name, last_name, must_change_password, is_active, role)
VALUES ('admin@particleblack.com', '$2b$10$<bcrypt_hash_of_password>', 'Admin', 'PB', true, true, 'admin');
```

---

### 2. `user_roles` table — Admin gets admin role

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('<admin_user_id>', 'admin');
```

---

### 3. `user_organization_access` — No rows for admin

When a user has **no rows** in this table, the frontend treats them as having **unrestricted access** (all regions, markets, facilities, departments). So admin needs no seed here.

---

### 4. `role_permissions` table — Full seed

This is the critical missing piece. The frontend falls back to hardcoded defaults in `rbacConfig.ts`, but your NestJS `GET /role-permissions` endpoint needs to return this data. Seed all 21 permission keys × 6 active roles:

```sql
-- All 21 permission keys:
-- admin.access, feedback.access, staffing.access, positions.access,
-- analytics.access, reports.access, support.access,
-- settings.volume_override, settings.np_override,
-- filters.region, filters.market, filters.facility, filters.department,
-- filters.submarket, filters.level2, filters.pstat,
-- approvals.positions_to_open, approvals.positions_to_close,
-- approvals.volume_override, approvals.np_override, approvals.feedback,
-- support.add_faq

-- ADMIN — all 22 permissions (true)
INSERT INTO role_permissions (role, permission_key, permission_value) VALUES
('admin', 'admin.access', 'true'),
('admin', 'feedback.access', 'true'),
('admin', 'staffing.access', 'true'),
('admin', 'positions.access', 'true'),
('admin', 'analytics.access', 'true'),
('admin', 'reports.access', 'true'),
('admin', 'support.access', 'true'),
('admin', 'settings.volume_override', 'true'),
('admin', 'settings.np_override', 'true'),
('admin', 'filters.region', 'true'),
('admin', 'filters.market', 'true'),
('admin', 'filters.facility', 'true'),
('admin', 'filters.department', 'true'),
('admin', 'filters.submarket', 'true'),
('admin', 'filters.level2', 'true'),
('admin', 'filters.pstat', 'true'),
('admin', 'approvals.positions_to_open', 'true'),
('admin', 'approvals.positions_to_close', 'true'),
('admin', 'approvals.volume_override', 'true'),
('admin', 'approvals.np_override', 'true'),
('admin', 'approvals.feedback', 'true'),
('admin', 'support.add_faq', 'true');

-- LABOR_TEAM — same as admin (all true)
INSERT INTO role_permissions (role, permission_key, permission_value) VALUES
('labor_team', 'admin.access', 'true'),
('labor_team', 'feedback.access', 'true'),
('labor_team', 'staffing.access', 'true'),
('labor_team', 'positions.access', 'true'),
('labor_team', 'analytics.access', 'true'),
('labor_team', 'reports.access', 'true'),
('labor_team', 'support.access', 'true'),
('labor_team', 'settings.volume_override', 'true'),
('labor_team', 'settings.np_override', 'true'),
('labor_team', 'filters.region', 'true'),
('labor_team', 'filters.market', 'true'),
('labor_team', 'filters.facility', 'true'),
('labor_team', 'filters.department', 'true'),
('labor_team', 'filters.submarket', 'true'),
('labor_team', 'filters.level2', 'true'),
('labor_team', 'filters.pstat', 'true'),
('labor_team', 'approvals.positions_to_open', 'true'),
('labor_team', 'approvals.positions_to_close', 'true'),
('labor_team', 'approvals.volume_override', 'true'),
('labor_team', 'approvals.np_override', 'true'),
('labor_team', 'approvals.feedback', 'true'),
('labor_team', 'support.add_faq', 'true');

-- LEADERSHIP — no admin, feedback, settings, approvals
INSERT INTO role_permissions (role, permission_key, permission_value) VALUES
('leadership', 'staffing.access', 'true'),
('leadership', 'positions.access', 'true'),
('leadership', 'analytics.access', 'true'),
('leadership', 'reports.access', 'true'),
('leadership', 'support.access', 'true'),
('leadership', 'filters.region', 'true'),
('leadership', 'filters.market', 'true'),
('leadership', 'filters.facility', 'true'),
('leadership', 'filters.department', 'true'),
('leadership', 'filters.submarket', 'true'),
('leadership', 'filters.level2', 'true'),
('leadership', 'filters.pstat', 'true');

-- CNO — same as leadership
INSERT INTO role_permissions (role, permission_key, permission_value) VALUES
('cno', 'staffing.access', 'true'),
('cno', 'positions.access', 'true'),
('cno', 'analytics.access', 'true'),
('cno', 'reports.access', 'true'),
('cno', 'support.access', 'true'),
('cno', 'filters.region', 'true'),
('cno', 'filters.market', 'true'),
('cno', 'filters.facility', 'true'),
('cno', 'filters.department', 'true'),
('cno', 'filters.submarket', 'true'),
('cno', 'filters.level2', 'true'),
('cno', 'filters.pstat', 'true');

-- DIRECTOR — facility + department only, no subfilters
INSERT INTO role_permissions (role, permission_key, permission_value) VALUES
('director', 'staffing.access', 'true'),
('director', 'positions.access', 'true'),
('director', 'analytics.access', 'true'),
('director', 'reports.access', 'true'),
('director', 'support.access', 'true'),
('director', 'filters.facility', 'true'),
('director', 'filters.department', 'true');

-- MANAGER — department only
INSERT INTO role_permissions (role, permission_key, permission_value) VALUES
('manager', 'staffing.access', 'true'),
('manager', 'positions.access', 'true'),
('manager', 'analytics.access', 'true'),
('manager', 'reports.access', 'true'),
('manager', 'support.access', 'true'),
('manager', 'filters.department', 'true');
```

---

### Summary Table

| Role | Modules | Filters | Subfilters | Settings | Approvals |
|------|---------|---------|------------|----------|-----------|
| admin | ALL 7 | ALL 4 | ALL 3 | ALL 2 | ALL 5 + FAQ |
| labor_team | ALL 7 | ALL 4 | ALL 3 | ALL 2 | ALL 5 + FAQ |
| leadership | 5 (no admin, feedback) | ALL 4 | ALL 3 | none | none |
| cno | 5 (no admin, feedback) | ALL 4 | ALL 3 | none | none |
| director | 5 (no admin, feedback) | facility, dept | none | none | none |
| manager | 5 (no admin, feedback) | dept only | none | none | none |

### How the Frontend Uses This

1. `GET /users/:id/roles` returns e.g. `["admin"]`
2. `GET /role-permissions` returns the full matrix above
3. Frontend merges: starts with hardcoded defaults from `rbacConfig.ts`, then applies overrides from the API response
4. If API returns nothing, hardcoded defaults still work — so the seed is optional but recommended for consistency

### No Frontend Changes Needed

This is purely a NestJS seed task. Copy the SQL above into your `seed.ts`.

