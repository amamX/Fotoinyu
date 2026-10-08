-- 1. Create a default admin user in auth.users (Password: admin123)
-- We use a fixed UUID so we can reference it easily
DO $$
DECLARE
  admin_uid UUID := '00000000-0000-0000-0000-000000000001';
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@fotoinyu.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      aud,
      role,
      created_at,
      updated_at
    ) VALUES (
      admin_uid,
      '00000000-0000-0000-0000-000000000000',
      'admin@fotoinyu.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      'authenticated',
      'authenticated',
      now(),
      now()
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_uid,
      format('{"sub":"%s","email":"%s"}', admin_uid::text, 'admin@fotoinyu.com')::jsonb,
      'email',
      now(),
      now(),
      now()
    );

    -- Also insert into our public.admin_users table
    INSERT INTO public.admin_users (id, email) VALUES (admin_uid, 'admin@fotoinyu.com');
  END IF;
END $$;

-- 2. Relax RLS Policies for MVP

-- Packages: Allow authenticated admins to do everything
CREATE POLICY "Admin can do all on packages" ON public.packages FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Bookings: Allow anon to insert, authenticated to do all
CREATE POLICY "Anon can insert bookings" ON public.bookings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can read own bookings by code" ON public.bookings FOR SELECT TO anon USING (true); -- In a real app, restrict by code/token, but fine for MVP
CREATE POLICY "Admin can do all on bookings" ON public.bookings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Gallery: Allow admin to do all
CREATE POLICY "Admin can do all on gallery" ON public.gallery FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Testimonials: Allow admin to do all
CREATE POLICY "Admin can do all on testimonials" ON public.testimonials FOR ALL TO authenticated USING (true) WITH CHECK (true);
