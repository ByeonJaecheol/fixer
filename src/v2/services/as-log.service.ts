import * as asLogRepository from '@/v2/repositories/as-log.repository';
import type { AsLog, AsLogInsert, AsLogListOptions, AsLogUpdate } from '@/v2/types/as-log';

type ServiceResult<T> = { data: T; error: null } | { data: null; error: string };

export async function listAsLogs(
  options?: AsLogListOptions
): Promise<ServiceResult<AsLog[]>> {
  try {
    const data = await asLogRepository.findAllAsLogs(options);
    return { data, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : '목록을 불러오지 못했습니다.';
    return { data: null, error: message };
  }
}

export async function getAsLog(id: number): Promise<ServiceResult<AsLog>> {
  try {
    const data = await asLogRepository.findAsLogById(id);
    if (!data) {
      return { data: null, error: '작업이력을 찾을 수 없습니다.' };
    }
    return { data, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : '조회에 실패했습니다.';
    return { data: null, error: message };
  }
}

export async function createAsLog(payload: AsLogInsert): Promise<ServiceResult<AsLog>> {
  try {
    const data = await asLogRepository.insertAsLog(payload);
    return { data, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : '등록에 실패했습니다.';
    return { data: null, error: message };
  }
}

export async function updateAsLog(
  id: number,
  payload: AsLogUpdate
): Promise<ServiceResult<AsLog>> {
  try {
    const data = await asLogRepository.updateAsLog(id, payload);
    return { data, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : '수정에 실패했습니다.';
    return { data: null, error: message };
  }
}

export async function removeAsLog(id: number): Promise<ServiceResult<null>> {
  try {
    await asLogRepository.deleteAsLog(id);
    return { data: null, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : '삭제에 실패했습니다.';
    return { data: null, error: message };
  }
}

export async function getAsLogCount(workType?: string): Promise<ServiceResult<number>> {
  try {
    const data = await asLogRepository.countAsLogs(workType);
    return { data, error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : '건수 조회에 실패했습니다.';
    return { data: null, error: message };
  }
}
