-- SaiNitya Academy MVP schema
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student', 'teacher')),
  display_name text not null,
  default_zoom_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.teacher_availability (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  unique (teacher_id, weekday, start_time, end_time)
);

create table if not exists public.class_sessions (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  zoom_join_url text,
  status text not null default 'scheduled' check (status in ('scheduled', 'cancelled')),
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

create unique index if not exists class_sessions_teacher_slot
  on public.class_sessions (teacher_id, start_at)
  where status = 'scheduled';

create unique index if not exists class_sessions_student_slot
  on public.class_sessions (student_id, start_at)
  where status = 'scheduled';

create table if not exists public.resource_catalog (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  title text not null,
  url text not null,
  audience text not null check (audience in ('student', 'teacher', 'both')),
  sort_order int not null default 0
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.prevent_student_session_tamper()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() = old.student_id and auth.uid() <> old.teacher_id then
    if new.teacher_id is distinct from old.teacher_id
      or new.student_id is distinct from old.student_id
      or new.start_at is distinct from old.start_at
      or new.end_at is distinct from old.end_at
      or new.zoom_join_url is distinct from old.zoom_join_url then
      raise exception 'Students may only cancel a session';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists class_sessions_student_tamper on public.class_sessions;
create trigger class_sessions_student_tamper
  before update on public.class_sessions
  for each row execute function public.prevent_student_session_tamper();

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'Role cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

alter table public.profiles enable row level security;
alter table public.teacher_availability enable row level security;
alter table public.class_sessions enable row level security;
alter table public.resource_catalog enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "read teacher profiles" on public.profiles;
create policy "read teacher profiles"
  on public.profiles for select
  to authenticated
  using (role = 'teacher');

drop policy if exists "teachers read booked students" on public.profiles;
create policy "teachers read booked students"
  on public.profiles for select
  using (
    exists (
      select 1 from public.class_sessions s
      where s.student_id = profiles.id
        and s.teacher_id = auth.uid()
    )
  );

drop policy if exists "read availability" on public.teacher_availability;
create policy "read availability"
  on public.teacher_availability for select
  to authenticated
  using (true);

drop policy if exists "manage own availability" on public.teacher_availability;
create policy "manage own availability"
  on public.teacher_availability for all
  using (auth.uid() = teacher_id)
  with check (auth.uid() = teacher_id);

drop policy if exists "read own sessions" on public.class_sessions;
create policy "read own sessions"
  on public.class_sessions for select
  using (auth.uid() = student_id or auth.uid() = teacher_id);

drop policy if exists "student book session" on public.class_sessions;
create policy "student book session"
  on public.class_sessions for insert
  with check (auth.uid() = student_id);

drop policy if exists "update own sessions" on public.class_sessions;
create policy "update own sessions"
  on public.class_sessions for update
  using (auth.uid() = student_id or auth.uid() = teacher_id);

drop policy if exists "read resources" on public.resource_catalog;
create policy "read resources"
  on public.resource_catalog for select
  to authenticated
  using (true);

create or replace function public.list_occupied_slots()
returns table (teacher_id uuid, start_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select teacher_id, start_at
  from public.class_sessions
  where status = 'scheduled';
$$;

revoke all on function public.list_occupied_slots() from public;
grant execute on function public.list_occupied_slots() to authenticated;

insert into public.resource_catalog (kind, title, url, audience, sort_order)
select v.kind, v.title, v.url, v.audience, v.sort_order
from (
  values
    ('curriculum', 'Khan Academy — Grade 3 Math', 'https://www.khanacademy.org/math/cc-third-grade-math', 'both', 10),
    ('whiteboard', 'Zoom interactive worksheet', 'https://zoom.us/wb/doc/x2Jyut0ZSCWzW5awOGwOOg/p/47400512572183', 'both', 20),
    ('homework', 'Homework sheet', 'https://drive.google.com/file/d/1OMD61NC9TX61TV8qUZIyeDiC6UTr7dj3/view?usp=sharing', 'both', 30),
    ('class_activity', 'Class activity sheet', 'https://drive.google.com/file/d/1B8TS3nLbwh1bYgA7MQtSMxHsXo-rikHK/view?usp=sharing', 'both', 40),
    ('geogebra_teacher', 'Teacher activity — Math at Wulmert’s', 'https://www.geogebra.org/m/qcvzccvx', 'teacher', 50),
    ('geogebra_student', 'Student activity — Stuck in Traffic!', 'https://www.geogebra.org/m/bnpqekuh', 'student', 60),
    ('geogebra_advanced', 'Advanced 1 — Checking balloons and light', 'https://www.geogebra.org/m/szhzz9th', 'both', 70),
    ('geogebra_advanced', 'Advanced 2 — Ice Cream!', 'https://www.geogebra.org/m/jvy2fcwg', 'both', 80),
    ('geogebra_advanced', 'Advanced 3 — Lighting and Marking', 'https://www.geogebra.org/m/ypvrns8v', 'both', 90),
    ('geogebra_create', 'Create — Staging is Amazing', 'https://www.geogebra.org/m/geewfmey', 'both', 100),
    ('geogebra_quiz', 'Quiz activity', 'https://www.geogebra.org/m/pxmmum6n', 'both', 110)
) as v(kind, title, url, audience, sort_order)
where not exists (select 1 from public.resource_catalog);
