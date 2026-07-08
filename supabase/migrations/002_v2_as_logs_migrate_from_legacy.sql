-- (선택) 레거시 as_management_log → v2 as_logs 데이터 이전
-- 001 실행 후, 이전할 준비가 되면 아래 주석을 해제하고 실행하세요.

/*
insert into public.as_logs (
  work_type,
  work_date,
  category,
  detail_category,
  model_name,
  employee_workspace,
  employee_department,
  employee_name,
  serial_number,
  security_code,
  new_security_code,
  question,
  pc_info,
  solution_detail,
  created_by,
  created_at,
  updated_at
)
select
  work_type,
  work_date,
  category,
  detail_category,
  model_name,
  employee_workspace,
  employee_department,
  employee_name,
  serial_number,
  security_code,
  new_security_code,
  question,
  detail_description,
  solution_detail,
  created_by,
  coalesce(created_at, now()),
  coalesce(created_at, now())
from public.as_management_log
on conflict do nothing;
*/
