create table if not exists app_users (
  id text primary key,
  email text unique,
  password_hash text,
  name text default '',
  home_course text default '',
  handicap numeric(4,1) not null default 12.4,
  distance integer not null default 25,
  handicap_range integer not null default 8,
  preferred_vibe text not null default 'any',
  gender text not null default 'Prefer not to say',
  gender_preference text not null default 'Anyone',
  mobility_preference text not null default 'either',
  music_preference text not null default 'either',
  available_days text not null default 'Sat,Sun',
  availability_window text not null default 'Any time',
  play_mode text not null default 'group_owner',
  group_size integer not null default 3,
  current_filter text not null default 'all',
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id text primary key,
  user_id text not null references app_users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists tee_times (
  id text primary key,
  user_id text not null references app_users(id) on delete cascade,
  day_label text not null,
  tee_date date,
  tee_time text,
  home_course text not null,
  posting_type text not null default 'group_owner',
  golfers_committed integer not null,
  open_slots integer not null,
  holes integer not null default 18,
  note text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists swipes (
  user_id text not null references app_users(id) on delete cascade,
  profile_id integer not null,
  direction text not null check (direction in ('left', 'right')),
  created_at timestamptz not null default now(),
  primary key (user_id, profile_id)
);

create table if not exists matches (
  id text primary key,
  user_id text not null references app_users(id) on delete cascade,
  profile_id integer not null,
  created_at timestamptz not null default now(),
  unique (user_id, profile_id)
);

create table if not exists blocked_profiles (
  user_id text not null references app_users(id) on delete cascade,
  profile_id integer not null,
  created_at timestamptz not null default now(),
  primary key (user_id, profile_id)
);

create table if not exists trust_events (
  id text primary key,
  user_id text not null references app_users(id) on delete cascade,
  profile_id integer not null,
  match_id text not null references matches(id) on delete cascade,
  action text not null check (action in ('report', 'no_show')),
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id text primary key,
  match_id text not null references matches(id) on delete cascade,
  sender text not null,
  body text not null,
  sent_at timestamptz not null default now()
);

create table if not exists ratings (
  id text primary key,
  match_id text not null references matches(id) on delete cascade,
  rater_role text not null check (rater_role in ('host', 'guest')),
  rating integer not null check (rating between 1 and 5),
  note text default '',
  created_at timestamptz not null default now(),
  unique (match_id, rater_role)
);

create index if not exists idx_swipes_user_created_at on swipes(user_id, created_at desc);
create index if not exists idx_matches_user_created_at on matches(user_id, created_at desc);
create index if not exists idx_messages_match_sent_at on messages(match_id, sent_at asc);
create index if not exists idx_ratings_match_created_at on ratings(match_id, created_at desc);
create index if not exists idx_trust_events_user_created_at on trust_events(user_id, created_at desc);
