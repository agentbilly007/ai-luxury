-- Run this in Supabase SQL Editor

-- Profiles table
create table profiles (
  id uuid references auth.users primary key,
  name text,
  email text,
  anthropic_api_key text,
  stripe_customer_id text,
  is_active boolean default false,
  created_at timestamp with time zone default now()
);

-- Posts/Feed table
create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  content text not null,
  image_url text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table posts enable row level security;

-- Policies: users can read all posts (community feed)
create policy "Anyone can read posts" on posts for select using (true);

-- Users can insert their own posts
create policy "Users can insert own posts" on posts for insert
  with check (auth.uid() = user_id);

-- Users can read/update their own profile
create policy "Users can read own profile" on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile" on profiles for update
  using (auth.uid() = id);

-- Storage bucket for post images
insert into storage.buckets (id, name, public) values ('post-images', 'post-images', true);

create policy "Anyone can view images" on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Auth users can upload images" on storage.objects for insert
  with check (bucket_id = 'post-images' and auth.role() = 'authenticated');
