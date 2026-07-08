'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/app/utils/server';
import {
  CREATED_BY_TABLES,
  getAuthorAliases,
  getDefaultNickname,
} from '@/utils/userProfile';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function updateProfile(nickname: string, email: string) {
  const trimmedNickname = nickname.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedNickname) {
    return { error: '닉네임을 입력해주세요.' };
  }

  if (trimmedNickname.length > 20) {
    return { error: '닉네임은 20자 이하로 입력해주세요.' };
  }

  if (trimmedNickname.includes('@')) {
    return { error: '닉네임에 @를 사용할 수 없습니다.' };
  }

  if (!trimmedEmail) {
    return { error: '이메일을 입력해주세요.' };
  }

  if (!isValidEmail(trimmedEmail)) {
    return { error: '올바른 이메일 형식이 아닙니다.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user?.email) {
    return { error: '로그인이 필요합니다.' };
  }

  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('nickname, email')
    .eq('id', user.id)
    .maybeSingle();

  const previousNickname = existingProfile?.nickname ?? getDefaultNickname(user.email);
  const previousEmail = existingProfile?.email ?? user.email;
  const nicknameChanged = trimmedNickname !== previousNickname;
  const emailChanged = trimmedEmail !== user.email;

  if (emailChanged) {
    const { error: emailError } = await supabase.auth.updateUser({
      email: trimmedEmail,
    });

    if (emailError) {
      return { error: `이메일 변경 실패: ${emailError.message}` };
    }
  }

  const { error: profileError } = await supabase.from('user_profiles').upsert({
    id: user.id,
    email: trimmedEmail,
    nickname: trimmedNickname,
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    return { error: `프로필 저장 실패: ${profileError.message}` };
  }

  if (nicknameChanged) {
    const aliases = getAuthorAliases(previousEmail, previousNickname).filter(
      (value) => value !== trimmedNickname
    );

    for (const table of CREATED_BY_TABLES) {
      for (const oldValue of aliases) {
        const { error } = await supabase
          .from(table)
          .update({ created_by: trimmedNickname })
          .eq('created_by', oldValue);

        if (error) {
          return { error: `${table} 작성자 업데이트 실패: ${error.message}` };
        }
      }
    }
  }

  revalidatePath('/private', 'layout');
  return {
    success: true,
    nickname: trimmedNickname,
    email: trimmedEmail,
    emailConfirmationRequired: emailChanged,
  };
}

// 하위 호환
export async function updateNickname(nickname: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: '로그인이 필요합니다.' };
  return updateProfile(nickname, user.email);
}
