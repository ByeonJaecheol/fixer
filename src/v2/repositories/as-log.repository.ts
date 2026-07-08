import { createClient } from '@/v2/lib/supabase/server';
import type { AsLog, AsLogInsert, AsLogListOptions, AsLogUpdate } from '@/v2/types/as-log';

const TABLE = 'as_logs';

export async function findAllAsLogs(options: AsLogListOptions = {}): Promise<AsLog[]> {
  const supabase = await createClient();
  const {
    workType,
    limit = 500,
    offset = 0,
    sortField = 'work_date',
    ascending = false,
  } = options;

  let query = supabase
    .from(TABLE)
    .select('*')
    .order(sortField, { ascending })
    .range(offset, offset + limit - 1);

  if (workType) {
    query = query.eq('work_type', workType);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AsLog[];
}

export async function findAsLogById(id: number): Promise<AsLog | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as AsLog | null;
}

export async function insertAsLog(payload: AsLogInsert): Promise<AsLog> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AsLog;
}

export async function updateAsLog(id: number, payload: AsLogUpdate): Promise<AsLog> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(TABLE)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as AsLog;
}

export async function deleteAsLog(id: number): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from(TABLE).delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function countAsLogs(workType?: string): Promise<number> {
  const supabase = await createClient();

  let query = supabase.from(TABLE).select('*', { count: 'exact', head: true });

  if (workType) {
    query = query.eq('work_type', workType);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
