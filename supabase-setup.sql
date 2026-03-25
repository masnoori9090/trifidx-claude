-- ============================================================
-- Trifid CRM — Full Database Setup
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fczrhxbnzuezweizabtn/sql
-- ============================================================

-- USERS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'salesperson' CHECK (role IN ('admin', 'manager', 'salesperson')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- COMPANIES
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  country TEXT,
  city TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CONTACTS
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  phone_e164 TEXT,
  company_name TEXT,
  company_id UUID REFERENCES public.companies(id),
  job_title TEXT,
  lead_status TEXT,
  lead_source TEXT,
  industry TEXT,
  notes TEXT,
  owner_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- LEADS
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT,
  last_name TEXT,
  business_name TEXT NOT NULL,
  instagram_handle TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  website TEXT,
  lead_source TEXT NOT NULL DEFAULT 'inbound' CHECK (lead_source IN ('inbound','outbound','referral','website','social_media','other')),
  industry TEXT,
  country TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','proposal','negotiation','closed_won','closed_lost')),
  lead_type TEXT CHECK (lead_type IN ('hot','warm','cold')),
  owner_id UUID REFERENCES public.users(id),
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  notes TEXT,
  last_contact_date DATE,
  do_not_approach BOOLEAN DEFAULT false,
  dna_reason TEXT,
  dna_notes TEXT,
  dna_flagged_by UUID REFERENCES public.users(id),
  dna_flagged_at TIMESTAMPTZ,
  is_client BOOLEAN DEFAULT false,
  client_id UUID,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON public.leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_country ON public.leads(country);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(lead_source);
CREATE INDEX IF NOT EXISTS idx_leads_deleted ON public.leads(deleted_at) WHERE deleted_at IS NULL;

-- DEALS
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  lead_id UUID REFERENCES public.leads(id),
  client_id UUID,
  company_id UUID REFERENCES public.companies(id),
  stage TEXT NOT NULL DEFAULT 'discovery' CHECK (stage IN ('discovery','proposal','negotiation','contract','closed_won','closed_lost')),
  value DECIMAL(12,2),
  currency TEXT DEFAULT 'AED',
  probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),
  expected_close_date DATE,
  actual_close_date DATE,
  lost_reason TEXT,
  owner_id UUID REFERENCES public.users(id),
  notes TEXT,
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_owner ON public.deals(owner_id);

-- CALENDAR EVENTS
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'meeting' CHECK (type IN ('meeting','phone_call','follow_up','demo','other')),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','no_show')),
  location TEXT,
  meeting_link TEXT,
  description TEXT,
  meeting_notes TEXT,
  completed_at TIMESTAMPTZ,
  participants TEXT[],
  visibility TEXT DEFAULT 'everyone' CHECK (visibility IN ('everyone','private')),
  related_lead_id UUID REFERENCES public.leads(id),
  related_deal_id UUID REFERENCES public.deals(id),
  related_client_id UUID,
  assigned_to UUID REFERENCES public.users(id),
  calendar_country TEXT DEFAULT 'UAE',
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_start ON public.calendar_events(start_at);
CREATE INDEX IF NOT EXISTS idx_events_assigned ON public.calendar_events(assigned_to);

-- ACTIVITY LOG
CREATE TABLE IF NOT EXISTS public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  performed_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_entity ON public.activity_log(entity_type, entity_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any, then recreate
DO $$ BEGIN
  DROP POLICY IF EXISTS "users_read" ON public.users;
  DROP POLICY IF EXISTS "users_update" ON public.users;
  DROP POLICY IF EXISTS "leads_read" ON public.leads;
  DROP POLICY IF EXISTS "leads_insert" ON public.leads;
  DROP POLICY IF EXISTS "leads_update" ON public.leads;
  DROP POLICY IF EXISTS "leads_delete" ON public.leads;
  DROP POLICY IF EXISTS "deals_read" ON public.deals;
  DROP POLICY IF EXISTS "deals_insert" ON public.deals;
  DROP POLICY IF EXISTS "deals_update" ON public.deals;
  DROP POLICY IF EXISTS "events_read" ON public.calendar_events;
  DROP POLICY IF EXISTS "events_insert" ON public.calendar_events;
  DROP POLICY IF EXISTS "events_update" ON public.calendar_events;
  DROP POLICY IF EXISTS "contacts_all" ON public.contacts;
  DROP POLICY IF EXISTS "companies_all" ON public.companies;
  DROP POLICY IF EXISTS "activity_all" ON public.activity_log;
END $$;

-- Users: authenticated can read all, update own
CREATE POLICY "users_read" ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_update" ON public.users FOR UPDATE TO authenticated USING (id = auth.uid());

-- Leads: read non-deleted, insert any, update own or admin
CREATE POLICY "leads_read" ON public.leads FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "leads_insert" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "leads_update" ON public.leads FOR UPDATE TO authenticated USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','manager'))
);
CREATE POLICY "leads_delete" ON public.leads FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Deals
CREATE POLICY "deals_read" ON public.deals FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "deals_insert" ON public.deals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "deals_update" ON public.deals FOR UPDATE TO authenticated USING (
  owner_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','manager'))
);

-- Calendar events
CREATE POLICY "events_read" ON public.calendar_events FOR SELECT TO authenticated USING (deleted_at IS NULL);
CREATE POLICY "events_insert" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "events_update" ON public.calendar_events FOR UPDATE TO authenticated USING (
  assigned_to = auth.uid() OR
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('admin','manager'))
);

-- Contacts & Companies: full access to authenticated
CREATE POLICY "contacts_all" ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "companies_all" ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Activity log: full access
CREATE POLICY "activity_all" ON public.activity_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;

-- ============================================================
-- TRIGGER: auto-sync auth.users → public.users on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'salesperson')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
