-- V2: 회원가입 시 user_profiles 자동 생성
-- Supabase Auth에서 "Confirm email" 활성화 권장 (Authentication → Providers → Email)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, email, nickname, updated_at)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'nickname'), ''),
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- V2: 인증된 사용자는 다른 사용자 프로필 닉네임만 조회 (작성자 표시용)
drop policy if exists "Authenticated users can read profiles for display" on public.user_profiles;

create policy "Authenticated users can read profiles for display"
  on public.user_profiles for select
  to authenticated
  using (true);
