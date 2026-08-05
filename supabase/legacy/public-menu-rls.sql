-- Optional: allow anonymous reads for active public menus (QR / storefront).
-- The app also uses service-role reads scoped to active stores when RLS is not set.

drop policy if exists "stores_public_select_active" on public.stores;
create policy "stores_public_select_active"
  on public.stores for select to anon, authenticated
  using (status = 'active');

drop policy if exists "menu_categories_public_select_active" on public.menu_categories;
create policy "menu_categories_public_select_active"
  on public.menu_categories for select to anon, authenticated
  using (
    is_active = true
    and store_id in (select id from public.stores where status = 'active')
  );

drop policy if exists "menu_items_public_select_active" on public.menu_items;
create policy "menu_items_public_select_active"
  on public.menu_items for select to anon, authenticated
  using (
    is_active = true
    and store_id in (select id from public.stores where status = 'active')
  );
