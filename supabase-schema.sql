-- Run this in your Supabase SQL editor (safe to run multiple times)

-- Profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can read all profiles" on profiles;
drop policy if exists "Users can update own profile" on profiles;
create policy "Users can read all profiles" on profiles for select using (true);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Posts
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

alter table posts enable row level security;

drop policy if exists "Members can read all posts" on posts;
drop policy if exists "Members can insert own posts" on posts;
create policy "Members can read all posts" on posts for select using (auth.uid() is not null);
create policy "Members can insert own posts" on posts for insert with check (auth.uid() = user_id);

-- Subscriptions
create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'inactive',
  created_at timestamptz default now()
);

alter table subscriptions enable row level security;

drop policy if exists "Users can read own subscription" on subscriptions;
drop policy if exists "Service role can write subscriptions" on subscriptions;
create policy "Users can read own subscription" on subscriptions for select using (auth.uid() = user_id);
create policy "Service role can write subscriptions" on subscriptions for all using (true);
