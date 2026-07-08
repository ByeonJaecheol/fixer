-- V2: AS 작업이력 테이블
-- Supabase SQL Editor 또는 supabase db push 로 실행하세요.

create table if not exists public.as_logs (
  id bigint generated always as identity primary key,
  work_type text not null,
  work_date timestamptz not null default now(),
  category text,
  detail_category text,
  model_name text,
  employee_workspace text,
  employee_department text,
  employee_name text,
  serial_number text,
  security_code text,
  new_security_code text,
  question text,
  pc_info text,
  solution_detail text,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.as_logs is 'V2 AS 작업이력 (레거시: as_management_log)';

create index if not exists as_logs_work_date_idx on public.as_logs (work_date desc);
create index if not exists as_logs_work_type_idx on public.as_logs (work_type);
create index if not exists as_logs_employee_name_idx on public.as_logs (employee_name);

alter table public.as_logs enable row level security;

create policy "Authenticated users can read as_logs"
  on public.as_logs for select
  to authenticated
  using (true);

create policy "Authenticated users can insert as_logs"
  on public.as_logs for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update as_logs"
  on public.as_logs for update
  to authenticated
  using (true);

create policy "Authenticated users can delete as_logs"
  on public.as_logs for delete
  to authenticated
  using (true);
