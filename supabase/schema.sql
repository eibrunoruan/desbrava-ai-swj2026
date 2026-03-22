-- =============================================================================
-- PDI Engine - Complete Database Schema
-- Run this SQL directly in the Supabase SQL Editor
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Utility: updated_at trigger function
-- -----------------------------------------------------------------------------
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- -----------------------------------------------------------------------------
-- 2. Tables
-- -----------------------------------------------------------------------------

-- users: Main user profile
create table users (
  id                    uuid        primary key default gen_random_uuid(),
  email                 text        unique not null,
  name                  text        not null,
  password_hash         text,
  photo_url             text,
  job_role          text,
  area                  text,
  experience_years      integer,
  education_level       text,
  education_course      text,
  education_institution text,
  languages             jsonb       default '[]',
  target_role           text,
  target_timeline       text        check (target_timeline in ('6_months', '1_year', '2_years')),
  motivation            text,
  cv_url                text,
  cv_extracted_data     jsonb,
  onboarding_completed  boolean     default false,
  plan                  text        default 'free' check (plan in ('free', 'premium')),
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- assessments: Each assessment taken by a user
create table assessments (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references users(id) on delete cascade,
  type         text        not null check (type in ('mbti', 'big_five', 'disc', 'ikigai', 'flow')),
  status       text        default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  responses    jsonb       default '{}',
  results      jsonb       default '{}',
  created_at   timestamptz default now(),
  completed_at timestamptz,
  unique (user_id, type)
);

-- consolidated_profiles: AI-generated unified profile
create table consolidated_profiles (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references users(id) on delete cascade unique,
  personality_map jsonb       default '{}',
  purpose         jsonb       default '{}',
  flow_zone       jsonb       default '{}',
  gap_analysis    jsonb       default '{}',
  readiness_score numeric     default 0,
  insights        jsonb       default '[]',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- pdis: Personal Development Plans
create table pdis (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references users(id) on delete cascade,
  type            text        not null check (type in ('generated', 'imported')),
  status          text        default 'draft' check (status in ('draft', 'active', 'completed')),
  modules         jsonb       default '[]',
  source_file_url text,
  ai_suggestions  jsonb       default '[]',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- pdi_items: Individual items within a PDI
create table pdi_items (
  id              uuid        primary key default gen_random_uuid(),
  pdi_id          uuid        not null references pdis(id) on delete cascade,
  module          text        not null check (module in ('foundation', 'specialization', 'consolidation')),
  title           text        not null,
  description     text,
  type            text        not null check (type in ('course', 'project', 'reading', 'exercise')),
  flow_potential  text        default 'medium' check (flow_potential in ('high', 'medium', 'low')),
  flow_strategy   text,
  status          text        default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  due_date        date,
  completed_at    timestamptz,
  sort_order      integer     default 0,
  created_at      timestamptz default now()
);

-- course_recommendations: Curated course suggestions for PDI items
create table course_recommendations (
  id                  uuid        primary key default gen_random_uuid(),
  pdi_item_id         uuid        not null references pdi_items(id) on delete cascade,
  user_id             uuid        not null references users(id) on delete cascade,
  title               text        not null,
  url                 text,
  platform            text        default 'udemy',
  rating              numeric,
  students_count      integer,
  price               numeric,
  duration            text,
  language            text,
  compatibility_score numeric,
  created_at          timestamptz default now()
);

-- checkins: Periodic user check-ins linked to a PDI
create table checkins (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references users(id) on delete cascade,
  pdi_id       uuid        not null references pdis(id) on delete cascade,
  feeling      text,
  flow_updates jsonb       default '{}',
  goal_changed boolean     default false,
  notes        text,
  created_at   timestamptz default now()
);


-- -----------------------------------------------------------------------------
-- 3. Indexes
-- -----------------------------------------------------------------------------

create index idx_assessments_user_id      on assessments(user_id);
create index idx_assessments_user_type    on assessments(user_id, type);
create index idx_consolidated_profiles_user_id on consolidated_profiles(user_id);
create index idx_pdis_user_id             on pdis(user_id);
create index idx_pdi_items_pdi_id         on pdi_items(pdi_id);
create index idx_course_recommendations_user_id     on course_recommendations(user_id);
create index idx_course_recommendations_pdi_item_id on course_recommendations(pdi_item_id);
create index idx_checkins_user_id         on checkins(user_id);
create index idx_checkins_pdi_id          on checkins(pdi_id);


-- -----------------------------------------------------------------------------
-- 4. Updated_at triggers
-- -----------------------------------------------------------------------------

create trigger trg_users_updated_at
  before update on users
  for each row execute function update_updated_at();

create trigger trg_consolidated_profiles_updated_at
  before update on consolidated_profiles
  for each row execute function update_updated_at();

create trigger trg_pdis_updated_at
  before update on pdis
  for each row execute function update_updated_at();


-- -----------------------------------------------------------------------------
-- 5. Row Level Security (RLS)
-- -----------------------------------------------------------------------------

-- Enable RLS on every table
alter table users                  enable row level security;
alter table assessments            enable row level security;
alter table consolidated_profiles  enable row level security;
alter table pdis                   enable row level security;
alter table pdi_items              enable row level security;
alter table course_recommendations enable row level security;
alter table checkins               enable row level security;

-- For MVP/development: allow all operations via anon key
-- TODO: Replace with auth.uid()-based policies for production

create policy "users_all" on users for all using (true) with check (true);
create policy "assessments_all" on assessments for all using (true) with check (true);
create policy "consolidated_profiles_all" on consolidated_profiles for all using (true) with check (true);
create policy "pdis_all" on pdis for all using (true) with check (true);
create policy "pdi_items_all" on pdi_items for all using (true) with check (true);
create policy "course_recommendations_all" on course_recommendations for all using (true) with check (true);
create policy "checkins_all" on checkins for all using (true) with check (true);
