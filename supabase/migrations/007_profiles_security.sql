-- Protegge i dati personali e impedisce l'escalation autonoma ad admin.

DROP POLICY IF EXISTS "profiles: read all" ON public.profiles;
DROP POLICY IF EXISTS "profiles: read own or admin" ON public.profiles;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE POLICY "profiles: read own or admin"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.is_admin()
  );

CREATE OR REPLACE VIEW public.profiles_public AS
  SELECT
    id, name, avatar, city, bio,
    specialties, verified, rating,
    review_count, sales_count, joined_at, role
  FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- L'email del profilo viene gestita da Auth, non dal client pubblico.
  NEW.email := OLD.email;

  IF NEW.role IS DISTINCT FROM OLD.role
     AND COALESCE(auth.role(), '') <> 'service_role'
     AND NOT public.is_admin()
  THEN
    RAISE EXCEPTION 'Only an administrator can change user roles';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_privileged_fields
  ON public.profiles;

CREATE TRIGGER protect_profile_privileged_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_privileged_fields();
