-- Run in Supabase SQL Editor if login works but you are sent back with "no profile".
-- Lets each signed-in user read their own profile row (required for routing after login).

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- Example: link an existing Auth user to super_admin (replace USER_UUID and name)
-- insert into public.profiles (id, full_name, role, store_id)
-- values ('USER_UUID', 'Super Admin', 'super_admin', null)
-- on conflict (id) do update set role = 'super_admin', full_name = excluded.full_name;
