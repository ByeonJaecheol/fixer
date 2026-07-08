import { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
}

export const CREATED_BY_TABLES = [
  'as_management_log',
  'pc_management_log',
  'image',
  'imageInfo',
  'todos',
] as const;

export function getDefaultNickname(email: string): string {
  return email.split('@')[0] || email;
}

export function getAuthorAliases(email: string, nickname?: string | null): string[] {
  const localPart = email.split('@')[0];
  return [...new Set([nickname, email, localPart].filter(Boolean))] as string[];
}

export function formatAuthorName(createdBy: string | null | undefined): string {
  if (!createdBy) return '-';
  if (createdBy.includes('@')) return createdBy.split('@')[0];
  return createdBy;
}

export function getAuthorInitials(author: string | null | undefined): string {
  const name = formatAuthorName(author);
  if (name === '-') return '?';
  return name.length > 1 ? name.substring(0, 2).toUpperCase() : name.toUpperCase();
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, email, nickname')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function ensureUserProfile(user: User): Promise<UserProfile> {
  if (!user.email) {
    throw new Error('사용자 이메일이 없습니다.');
  }

  const existing = await fetchUserProfile(user.id);
  if (existing) return existing;

  const nickname = getDefaultNickname(user.email);
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      email: user.email,
      nickname,
      updated_at: new Date().toISOString(),
    })
    .select('id, email, nickname')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCreatedByInAllTables(
  oldValues: string[],
  newNickname: string
): Promise<void> {
  const targets = [...new Set(oldValues)].filter((value) => value && value !== newNickname);

  for (const table of CREATED_BY_TABLES) {
    for (const oldValue of targets) {
      const { error } = await supabase
        .from(table)
        .update({ created_by: newNickname })
        .eq('created_by', oldValue);

      if (error) {
        throw new Error(`${table} 작성자 업데이트 실패: ${error.message}`);
      }
    }
  }
}
