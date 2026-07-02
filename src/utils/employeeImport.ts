import Papa from 'papaparse';
import { supabase } from '@/utils/supabase';
import { Database } from '../../types_db';

const TABLE = 'employees_data';
const BATCH_SIZE = 500;

export type EmployeeRow = Database['public']['Tables']['employees_data']['Insert'];

export interface ParseResult {
  rows: EmployeeRow[];
  errors: string[];
  skipped: number;
}

export interface ImportProgress {
  phase: 'deleting' | 'inserting';
  loaded: number;
  total: number;
}

const REQUIRED_HEADERS = ['이름', '아이뒤', '사번', '회사', '부서', '직위', '직책', '성별'];

function normalizeHeader(header: string): string {
  return header.trim().replace(/^"|"$/g, '');
}

function normalizeValue(value: unknown): string {
  if (value == null) return '';
  return String(value).trim();
}

function mapCsvRow(raw: Record<string, unknown>): EmployeeRow | null {
  const 이름 = normalizeValue(raw['이름']);
  const 아이뒤 = normalizeValue(raw['아이뒤']);

  if (!이름 && !아이뒤) return null;

  const 퇴사 = normalizeValue(raw['퇴사']);

  return {
    이름: 이름 || null,
    아이뒤: 아이뒤 || null,
    사번: normalizeValue(raw['사번']) || null,
    회사: normalizeValue(raw['회사']) || null,
    부서: normalizeValue(raw['부서']) || null,
    직위: normalizeValue(raw['직위']) || null,
    직책: normalizeValue(raw['직책']) || null,
    성별: normalizeValue(raw['성별']) || null,
    퇴사: 퇴사 || null,
  };
}

export function parseEmployeeCsvText(text: string): ParseResult {
  const parsed = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const errors: string[] = [];

  if (parsed.errors.length > 0) {
    parsed.errors.slice(0, 5).forEach((err) => {
      errors.push(`CSV 파싱 오류 (행 ${err.row ?? '?'}): ${err.message}`);
    });
  }

  const headers = (parsed.meta.fields ?? []).map(normalizeHeader).filter(Boolean);
  const missingHeaders = REQUIRED_HEADERS.filter((h) => !headers.includes(h));

  if (missingHeaders.length > 0) {
    errors.push(`필수 컬럼이 없습니다: ${missingHeaders.join(', ')}`);
    return { rows: [], errors, skipped: 0 };
  }

  const rows: EmployeeRow[] = [];
  let skipped = 0;

  parsed.data.forEach((raw, index) => {
    const row = mapCsvRow(raw);
    if (!row) {
      skipped += 1;
      return;
    }
    if (!row.이름) {
      errors.push(`${index + 2}행: 이름이 비어 있습니다.`);
      return;
    }
    if (!row.아이뒤) {
      errors.push(`${index + 2}행: 아이뒤가 비어 있습니다.`);
      return;
    }
    rows.push(row);
  });

  return { rows, errors, skipped };
}

export function parseEmployeeCsvFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      resolve(parseEmployeeCsvText(text));
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsText(file, 'UTF-8');
  });
}

export async function fetchEmployeeCount(): Promise<number> {
  const { count, error } = await supabase
    .from(TABLE)
    .select('*', { count: 'exact', head: true });

  if (error) throw new Error(`현재 사원 수 조회 실패: ${error.message}`);
  return count ?? 0;
}

export async function refreshEmployeeData(
  rows: EmployeeRow[],
  onProgress?: (progress: ImportProgress) => void
): Promise<{ inserted: number }> {
  onProgress?.({ phase: 'deleting', loaded: 0, total: rows.length });

  const { error: deleteError } = await supabase
    .from(TABLE)
    .delete()
    .gte('id', 0);

  if (deleteError) {
    throw new Error(`기존 사원 데이터 삭제 실패: ${deleteError.message}`);
  }

  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase.from(TABLE).insert(batch);

    if (insertError) {
      throw new Error(
        `사원 데이터 저장 실패 (${inserted + 1}~${inserted + batch.length}행): ${insertError.message}`
      );
    }

    inserted += batch.length;
    onProgress?.({ phase: 'inserting', loaded: inserted, total: rows.length });
  }

  return { inserted };
}

export function summarizeEmployees(rows: EmployeeRow[]) {
  const retired = rows.filter((r) => r.퇴사 === 'O').length;
  return {
    total: rows.length,
    active: rows.length - retired,
    retired,
  };
}
