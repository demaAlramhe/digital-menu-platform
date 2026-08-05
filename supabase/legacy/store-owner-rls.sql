-- Optional: run in Supabase SQL Editor so the anon client can read/write own store data.
-- The app also uses service-role reads after auth when RLS is not configured.

alter table public.menu_categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.stores enable row level security;

drop policy if exists "menu_categories_owner_select" on public.menu_categories;
create policy "menu_categories_owner_select"
  on public.menu_categories for select to authenticated
  using (
    store_id in (
      select store_id from public.profiles
      where id = auth.uid() and store_id is not null
    )
  );

drop policy if exists "menu_categories_owner_insert" on public.menu_categories;
create policy "menu_categories_owner_insert"
  on public.menu_categories for insert to authenticated
  with check (
    store_id in (
      select store_id from public.profiles
      where id = auth.uid() and store_id is not null
    )
  );

drop policy if exists "menu_categories_owner_update" on public.menu_categories;
create policy "menu_categories_owner_update"
  on public.menu_categories for update to authenticated
  using (
    store_id in (
      select store_id from public.profiles
      where id = auth.uid() and store_id is not null
    )
  );

drop policy if exists "menu_categories_owner_delete" on public.menu_categories;
create policy "menu_categories_owner_delete"
  on public.menu_categories for delete to authenticated
  using (
    store_id in (
      select store_id from public.profiles
      where id = auth.uid() and store_id is not null
    )
  );

-- Mirror for menu_items
drop policy if exists "menu_items_owner_select" on public.menu_items;
create policy "menu_items_owner_select"
  on public.menu_items for select to authenticated
  using (
    store_id in (
      select store_id from public.profiles
      where id = auth.uid() and store_id is not null
    )
  );

drop policy if exists "menu_items_owner_insert" on public.menu_items;
create policy "menu_items_owner_insert"
  on public.menu_items for insert to authenticated
  with check (
    store_id in (
      select store_id from public.profiles
      where id = auth.uid() and store_id is not null
    )
  );

drop policy if exists "menu_items_owner_update" on public.menu_items;
create policy "menu_items_owner_update"
  on public.menu_items for update to authenticated
  using (
    store_id in (
      select store_id from public.profiles
      where id = auth.uid() and store_id is not null
    )
  );

drop policy if exists "menu_items_owner_delete" on public.menu_items;
create policy "menu_items_owner_delete"
  on public.menu_items for delete to authenticated
  using (
    store_id in (
      select store_id from public.profiles
      where id = auth.uid() and store_id is not null
    )
  );

drop policy if exists "stores_owner_select" on public.stores;
create policy "stores_owner_select"
  on public.stores for select to authenticated
  using (
    id in (
      select store_id from public.profiles
      where id = auth.uid() and store_id is not null
    )
  );

drop policy if exists "stores_owner_update" on public.stores;
create policy "stores_owner_update"
  on public.stores for update to authenticated
  using (
    id in (
      select store_id from public.profiles
      where id = auth.uid() and store_id is not null
    )
  );
