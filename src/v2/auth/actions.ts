'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/server';
import {
  AUTH_CALLBACK_PATH,
  getAuthCallbackUrl,
  V2_CHECK_EMAIL_PATH,
  V2_LOGIN_PATH,
  V2_PRIVATE_PATH,
} from './constants';
import { validateEmail, validateNickname, validatePassword } from './validators';

type ActionResult = { error: string } | { success: true; message?: string };

export async function v2SignUp(formData: FormData): Promise<ActionResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const passwordConfirm = formData.get('passwordConfirm') as string;
  const nickname = (formData.get('nickname') as string)?.trim();

  const emailError = validateEmail(email);
  if (emailError) return { error: emailError };

  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };

  if (password !== passwordConfirm) {
    return { error: '비밀번호 확인이 일치하지 않습니다.' };
  }

  const nicknameError = validateNickname(nickname);
  if (nicknameError) return { error: nicknameError };

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthCallbackUrl(V2_PRIVATE_PATH),
      data: { nickname },
    },
  });

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: '이미 가입된 이메일입니다. 로그인하거나 비밀번호 재설정을 이용해주세요.' };
    }
    return { error: error.message };
  }

  // 이메일 확인 필요 (일반적인 production 설정)
  if (data.user && !data.session) {
    redirect(`${V2_CHECK_EMAIL_PATH}?email=${encodeURIComponent(email)}`);
  }

  revalidatePath('/', 'layout');
  redirect(V2_PRIVATE_PATH);
}

export async function v2Login(formData: FormData): Promise<ActionResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  const emailError = validateEmail(email);
  if (emailError) return { error: emailError };

  if (!password) return { error: '비밀번호를 입력해주세요.' };

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return {
        error: '이메일 인증이 완료되지 않았습니다. 가입 시 받은 메일의 링크를 확인해주세요.',
      };
    }
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }

  if (data.user && !data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    return {
      error: '이메일 인증이 완료되지 않았습니다. 가입 시 받은 메일의 링크를 확인해주세요.',
    };
  }

  revalidatePath('/', 'layout');
  redirect(V2_PRIVATE_PATH);
}

export async function v2ResendConfirmation(email: string): Promise<ActionResult> {
  const emailError = validateEmail(email);
  if (emailError) return { error: emailError };

  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: getAuthCallbackUrl(V2_PRIVATE_PATH),
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: '인증 메일을 다시 보냈습니다.' };
}

export async function v2SignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect(V2_LOGIN_PATH);
}

export async function v2RequestPasswordReset(formData: FormData): Promise<ActionResult> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const emailError = validateEmail(email);
  if (emailError) return { error: emailError };

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${base}${AUTH_CALLBACK_PATH}?next=${encodeURIComponent('/v2/login')}`,
  });

  if (error) return { error: error.message };
  return { success: true, message: '비밀번호 재설정 메일을 보냈습니다.' };
}
