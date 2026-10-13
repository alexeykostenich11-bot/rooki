-- Платформа мастеров ROOKI: пользователи, сессии, анкеты мастеров, прайс, проекты, фото.

create table users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  password_hash text not null,
  role          text not null check (role in ('master', 'customer', 'admin')),
  display_name  text not null,
  consent_at    timestamptz not null,           -- когда согласился на обработку данных
  created_at    timestamptz not null default now()
);
create unique index users_email_lower_idx on users (lower(email));

create table sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  token_hash text not null unique,              -- sha256 токена; сам токен хранится только в cookie
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index sessions_user_idx on sessions (user_id);
create index sessions_expires_idx on sessions (expires_at);

create table master_profiles (
  user_id          uuid primary key references users(id) on delete cascade,
  specialties      text[] not null default '{}',
  experience_years int check (experience_years between 0 and 60),
  city             text not null default 'Москва',
  districts        text not null default '',     -- районы / метро / области работы
  team_type        text not null default 'solo' check (team_type in ('solo', 'crew')),
  about            text not null default '',
  avatar_key       text,
  status           text not null default 'draft'
                   check (status in ('draft', 'pending', 'approved', 'rejected')),
  reject_reason    text,
  submitted_at     timestamptz,
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index master_profiles_status_idx on master_profiles (status);
create index master_profiles_specialties_idx on master_profiles using gin (specialties);

create table master_prices (
  id         uuid primary key default gen_random_uuid(),
  master_id  uuid not null references master_profiles(user_id) on delete cascade,
  work_name  text not null,
  unit       text not null,
  price_from int  not null check (price_from >= 0),
  sort       int  not null default 0
);
create index master_prices_master_idx on master_prices (master_id, sort);

create table projects (
  id            uuid primary key default gen_random_uuid(),
  master_id     uuid not null references master_profiles(user_id) on delete cascade,
  title         text not null,
  description   text not null default '',
  area_m2       numeric(7,1) check (area_m2 is null or area_m2 > 0),
  duration_days int check (duration_days is null or duration_days > 0),
  price_total   int check (price_total is null or price_total >= 0),   -- сколько стоили работы
  status        text not null default 'draft'
                check (status in ('draft', 'pending', 'approved', 'rejected')),
  reject_reason text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index projects_master_idx on projects (master_id, created_at desc);
create index projects_status_idx on projects (status);

create table project_photos (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  storage_key text not null,                   -- ключ большого фото; превью = ключ с суффиксом -sm
  sort        int  not null default 0,
  created_at  timestamptz not null default now()
);
create index project_photos_project_idx on project_photos (project_id, sort);
