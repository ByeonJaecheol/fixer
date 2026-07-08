export type AsWorkType = 'H/W' | 'S/W' | '보안' | '네트워크' | '기타';

export interface AsLog {
  id: number;
  work_type: AsWorkType | string;
  work_date: string;
  category: string | null;
  detail_category: string | null;
  model_name: string | null;
  employee_workspace: string | null;
  employee_department: string | null;
  employee_name: string | null;
  serial_number: string | null;
  security_code: string | null;
  new_security_code: string | null;
  question: string | null;
  pc_info: string | null;
  solution_detail: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type AsLogInsert = Omit<AsLog, 'id' | 'created_at' | 'updated_at'> & {
  id?: never;
  created_at?: string;
  updated_at?: string;
};

export type AsLogUpdate = Partial<Omit<AsLog, 'id' | 'created_at'>>;

export interface AsLogListParams {
  workType?: string;
  limit?: number;
  offset?: number;
}

export type AsLogSortField =
  | 'id'
  | 'work_date'
  | 'work_type'
  | 'category'
  | 'model_name'
  | 'employee_department'
  | 'created_by';

export interface AsLogListOptions extends AsLogListParams {
  sortField?: AsLogSortField;
  ascending?: boolean;
}
