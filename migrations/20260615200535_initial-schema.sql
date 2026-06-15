-- ============================================================
-- profiles
-- ============================================================
CREATE TABLE public.profiles (
  id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name           TEXT,
  email               TEXT,
  phone               TEXT,
  location            TEXT,
  current_title       TEXT,
  experience_level    TEXT,
  years_experience    INTEGER,
  skills              TEXT[],
  industries          TEXT[],
  work_experience     JSONB,
  education           JSONB,
  job_titles_seeking  TEXT[],
  remote_preference   TEXT,
  preferred_locations TEXT[],
  salary_expectation  TEXT,
  cover_letter_tone   TEXT,
  linkedin_url        TEXT,
  portfolio_url       TEXT,
  work_authorization  TEXT,
  resume_pdf_url      TEXT,
  is_complete         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

-- ============================================================
-- agent_runs
-- ============================================================
CREATE TABLE public.agent_runs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'running',
  job_title_searched  TEXT,
  location_searched   TEXT,
  jobs_found          INTEGER,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ
);

CREATE INDEX idx_agent_runs_user_id ON public.agent_runs(user_id);

-- ============================================================
-- jobs
-- ============================================================
CREATE TABLE public.jobs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id              UUID REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  user_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source              TEXT NOT NULL CHECK (source IN ('search', 'url')),
  source_url          TEXT,
  external_apply_url  TEXT,
  title               TEXT,
  company             TEXT,
  location            TEXT,
  salary              TEXT,
  job_type            TEXT,
  about_role          TEXT,
  responsibilities    TEXT[],
  requirements        TEXT[],
  nice_to_have        TEXT[],
  benefits            TEXT[],
  about_company       TEXT,
  match_score         INTEGER,
  match_reason        TEXT,
  matched_skills      TEXT[],
  missing_skills      TEXT[],
  company_research    JSONB,
  status              TEXT NOT NULL DEFAULT 'active',
  found_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX idx_jobs_run_id ON public.jobs(run_id);

-- ============================================================
-- agent_logs
-- ============================================================
CREATE TABLE public.agent_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id      UUID NOT NULL REFERENCES public.agent_runs(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  level       TEXT NOT NULL,
  job_id      UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_logs_run_id ON public.agent_logs(run_id);
CREATE INDEX idx_agent_logs_user_id ON public.agent_logs(user_id);
CREATE INDEX idx_agent_logs_job_id ON public.agent_logs(job_id);

-- ============================================================
-- Trigger: auto-create skeleton profile on new OAuth user
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RLS — profiles
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can select own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ============================================================
-- RLS — agent_runs
-- ============================================================
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can select own runs"
  ON public.agent_runs FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "users can insert own runs"
  ON public.agent_runs FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "users can update own runs"
  ON public.agent_runs FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================
-- RLS — jobs
-- ============================================================
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can select own jobs"
  ON public.jobs FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "users can insert own jobs"
  ON public.jobs FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "users can update own jobs"
  ON public.jobs FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "users can delete own jobs"
  ON public.jobs FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- ============================================================
-- RLS — agent_logs
-- ============================================================
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can select own logs"
  ON public.agent_logs FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "users can insert own logs"
  ON public.agent_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- ============================================================
-- Grants
-- ============================================================
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.agent_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT SELECT, INSERT ON public.agent_logs TO authenticated;
