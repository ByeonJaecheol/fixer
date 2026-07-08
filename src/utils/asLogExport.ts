import { supabase } from '@/utils/supabase';
import { IAsManagementLog } from '@/api/supabase/supabaseApi';
import { exportAsLogsToExcel } from './excelUtils';

const PAGE_SIZE = 1000;
const SOURCE_TABLE = 'as_management_log';
const TARGET_TABLE = 'as_management_log';

/** Supabase 테이블 생성·이관용 컬럼 정의 */
const MIGRATION_COLUMNS = [
  { name: 'log_id', type: 'bigint', nullable: false, primaryKey: true },
  { name: 'work_type', type: 'text', nullable: false },
  { name: 'work_date', type: 'timestamptz', nullable: false },
  { name: 'category', type: 'text', nullable: true },
  { name: 'detail_category', type: 'text', nullable: true },
  { name: 'model_name', type: 'text', nullable: true },
  { name: 'employee_workspace', type: 'text', nullable: true },
  { name: 'employee_department', type: 'text', nullable: true },
  { name: 'employee_name', type: 'text', nullable: true },
  { name: 'serial_number', type: 'text', nullable: true },
  { name: 'security_code', type: 'text', nullable: true },
  { name: 'new_security_code', type: 'text', nullable: true },
  { name: 'question', type: 'text', nullable: true },
  { name: 'detail_description', type: 'text', nullable: true },
  { name: 'solution_detail', type: 'text', nullable: true },
  { name: 'created_by', type: 'text', nullable: false },
  { name: 'created_at', type: 'timestamptz', nullable: true },
  { name: 'format', type: 'text[]', nullable: true },
] as const;

export interface SupabaseMigrationExport {
  meta: {
    version: string;
    exported_at: string;
    source_table: string;
    suggested_target_table: string;
    row_count: number;
    import_steps: string[];
  };
  schema: {
    columns: typeof MIGRATION_COLUMNS;
    create_table_sql: string;
  };
  /** supabase.from('table').insert(rows) 에 바로 사용 가능 */
  rows: Record<string, unknown>[];
}

function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

export async function fetchAllTableRows<T>(
  table: string,
  orderColumn: string,
  ascending = false,
  onProgress?: (loaded: number, total: number | null) => void
): Promise<T[]> {
  const { count, error: countError } = await supabase
    .from(table)
    .select('*', { count: 'exact', head: true });

  if (countError) throw new Error(`${table} 건수 조회 실패: ` + countError.message);

  const total = count ?? 0;
  const allData: T[] = [];
  let from = 0;

  while (from < total) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(orderColumn, { ascending })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw new Error(`${table} 조회 실패: ` + error.message);
    if (!data?.length) break;

    allData.push(...(data as T[]));
    onProgress?.(allData.length, total);
    from += PAGE_SIZE;
  }

  onProgress?.(allData.length, total);
  return allData;
}

export async function fetchAllAsManagementLogs(
  onProgress?: (loaded: number, total: number | null) => void
): Promise<IAsManagementLog[]> {
  return fetchAllTableRows<IAsManagementLog>('as_management_log', 'work_date', false, onProgress);
}

export function exportAsLogsToJson(data: IAsManagementLog[], filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  triggerDownload(blob, `${filename}.json`);
}

export function exportAsLogsToCsv(data: IAsManagementLog[], filename: string): void {
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const escape = (val: unknown) => {
    if (val == null) return '';
    const str = Array.isArray(val) ? val.join(', ') : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = data.map((row) =>
    headers.map((h) => escape((row as Record<string, unknown>)[h])).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `${filename}.csv`);
}

export function exportAsLogsFullExcel(data: IAsManagementLog[], filename: string): void {
  exportAsLogsToExcel(data, filename);
}

export function getExportFilename(): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `KET_작업이력_전체_${today}`;
}

export interface ReportLogRow {
  no: number;
  logId: string;
  author: string;
  workDate: string;
  workType: string;
  category: string;
  modelName: string;
  department: string;
  employeeName: string;
  question: string;
  detailDescription: string;
  solutionDetail: string;
}

function getMonthKey(workDate?: string): string {
  if (!workDate) return '날짜 없음';
  const date = new Date(workDate);
  return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월`;
}

/** 작업이력을 월별로 그룹화 (최신 월 우선) */
export function groupAsLogsByMonth(data: IAsManagementLog[]): { monthKey: string; logs: IAsManagementLog[] }[] {
  const logsByMonth: Record<string, IAsManagementLog[]> = {};

  data.forEach((log) => {
    const monthKey = getMonthKey(log.work_date);
    if (!logsByMonth[monthKey]) logsByMonth[monthKey] = [];
    logsByMonth[monthKey].push(log);
  });

  return Object.keys(logsByMonth)
    .sort((a, b) => {
      if (a === '날짜 없음') return 1;
      if (b === '날짜 없음') return -1;
      return b.localeCompare(a);
    })
    .map((monthKey) => ({ monthKey, logs: logsByMonth[monthKey] }));
}

/** 보고서 테이블용 행 변환 */
export function toReportRows(logs: IAsManagementLog[]): ReportLogRow[] {
  return logs.map((log, index) => ({
    no: index + 1,
    logId: log.log_id?.toString() || '',
    author: formatAuthorName(log.created_by),
    workDate: log.work_date ? new Date(log.work_date).toLocaleDateString('ko-KR') : '',
    workType: log.work_type || '',
    category: log.category || '없음',
    modelName: log.model_name || '',
    department: log.employee_department || '',
    employeeName: log.employee_name || '',
    question: log.question || '',
    detailDescription: log.detail_description || '',
    solutionDetail: log.solution_detail || '',
  }));
}

function emptyToNull(value: unknown): unknown {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  return value;
}

/** 원본 레코드를 Supabase INSERT 형식으로 정규화 */
export function normalizeLogForMigration(log: Record<string, unknown>): Record<string, unknown> {
  const format = log.format;
  return {
    log_id: log.log_id ?? null,
    work_type: log.work_type ?? null,
    work_date: log.work_date ?? null,
    category: emptyToNull(log.category),
    detail_category: emptyToNull(log.detail_category ?? log.detailed_category),
    model_name: emptyToNull(log.model_name),
    employee_workspace: emptyToNull(log.employee_workspace),
    employee_department: emptyToNull(log.employee_department),
    employee_name: emptyToNull(log.employee_name),
    serial_number: emptyToNull(log.serial_number),
    security_code: emptyToNull(log.security_code),
    new_security_code: emptyToNull(log.new_security_code),
    question: emptyToNull(log.question),
    detail_description: emptyToNull(log.detail_description ?? log.detailed_description),
    solution_detail: emptyToNull(log.solution_detail),
    created_by: log.created_by ?? null,
    created_at: log.created_at ?? null,
    format: Array.isArray(format) ? format : null,
  };
}

function buildCreateTableSql(tableName: string): string {
  const lines = MIGRATION_COLUMNS.map((col) => {
    let def = `  ${col.name} ${col.type}`;
    if (col.primaryKey) def += ' GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY';
    else if (!col.nullable) def += ' NOT NULL';
    if (col.name === 'created_at') def += ' DEFAULT now()';
    return def;
  });

  return [
    `-- Supabase 마이그레이션용 DDL`,
    `-- 테이블명은 필요에 따라 변경하세요`,
    `CREATE TABLE IF NOT EXISTS public.${tableName} (`,
    lines.join(',\n'),
    ');',
    '',
    `-- RLS 사용 시 예시 (필요에 따라 수정)`,
    `-- ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;`,
  ].join('\n');
}

export function buildSupabaseMigrationPayload(data: IAsManagementLog[]): SupabaseMigrationExport {
  const rows = data.map((log) => normalizeLogForMigration(log as unknown as Record<string, unknown>));

  return {
    meta: {
      version: '1.0',
      exported_at: new Date().toISOString(),
      source_table: SOURCE_TABLE,
      suggested_target_table: TARGET_TABLE,
      row_count: rows.length,
      import_steps: [
        '1. Supabase SQL Editor에서 schema.create_table_sql 을 실행해 테이블을 생성합니다.',
        '2-A. JSON: rows 배열을 supabase.from("테이블명").insert(rows) 로 삽입합니다.',
        '2-B. SQL: migration.sql 파일을 SQL Editor에서 실행합니다.',
        '3. log_id를 유지한 경우 시퀀스를 재설정합니다 (SQL 파일 하단 참고).',
        '4. 테이블명·컬럼명이 다르면 rows 키를 새 스키마에 맞게 매핑하세요.',
      ],
    },
    schema: {
      columns: MIGRATION_COLUMNS,
      create_table_sql: buildCreateTableSql(TARGET_TABLE),
    },
    rows,
  };
}

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  if (Array.isArray(value)) {
    if (!value.length) return 'NULL';
    return `ARRAY[${value.map((v) => sqlLiteral(v)).join(', ')}]::text[]`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

function buildMigrationSql(data: IAsManagementLog[], tableName: string): string {
  const rows = data.map((log) => normalizeLogForMigration(log as unknown as Record<string, unknown>));
  const columnNames = MIGRATION_COLUMNS.map((c) => c.name);
  const lines: string[] = [
    `-- Supabase 마이그레이션 SQL`,
    `-- 생성일: ${new Date().toISOString()}`,
    `-- 건수: ${rows.length}`,
    '',
    buildCreateTableSql(tableName),
    '',
  ];

  const BATCH_SIZE = 50;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const valueLines = batch.map((row) => {
      const values = columnNames.map((col) => sqlLiteral(row[col])).join(', ');
      return `  (${values})`;
    });
    lines.push(
      `INSERT INTO public.${tableName} (${columnNames.join(', ')})`,
      'VALUES',
      valueLines.join(',\n') + ';',
      ''
    );
  }

  if (rows.some((r) => r.log_id != null)) {
    lines.push(
      `-- log_id 유지 시 시퀀스 재설정`,
      `SELECT setval(`,
      `  pg_get_serial_sequence('public.${tableName}', 'log_id'),`,
      `  COALESCE((SELECT MAX(log_id) FROM public.${tableName}), 1)`,
      `);`,
    );
  }

  return lines.join('\n');
}

export function exportAsLogsMigrationJson(data: IAsManagementLog[], filename: string): void {
  const payload = buildSupabaseMigrationPayload(data);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
  triggerDownload(blob, `${filename}_supabase_migration.json`);
}

export function exportAsLogsMigrationSql(data: IAsManagementLog[], filename: string): void {
  const sql = buildMigrationSql(data, TARGET_TABLE);
  const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
  triggerDownload(blob, `${filename}_supabase_migration.sql`);
}

/** Supabase Table Editor CSV import용 (고정 컬럼 순서) */
export function exportAsLogsMigrationCsv(data: IAsManagementLog[], filename: string): void {
  if (!data.length) return;

  const columnNames = MIGRATION_COLUMNS.map((c) => c.name);
  const escape = (val: unknown) => {
    if (val === null || val === undefined) return '';
    const str = Array.isArray(val) ? val.join('|') : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = data.map((log) => {
    const normalized = normalizeLogForMigration(log as unknown as Record<string, unknown>);
    return columnNames.map((col) => escape(normalized[col])).join(',');
  });

  const csv = [columnNames.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `${filename}_supabase_migration.csv`);
}
