-- Tiered admin access: `admin` = super admin (full access), `staff` = limited by admin_permissions.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_permissions jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.profiles.admin_permissions IS
  'Permission keys for staff users. Super admins (role=admin) ignore this and have full access.';

-- Super admins may manage team profiles; staff may only read their own row (existing policy).
DROP POLICY IF EXISTS "Super admins manage team profiles" ON public.profiles;
CREATE POLICY "Super admins manage team profiles"
  ON public.profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
