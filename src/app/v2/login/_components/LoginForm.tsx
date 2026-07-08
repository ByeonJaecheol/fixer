'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { v2Login, v2RequestPasswordReset } from '@/v2/auth/actions';
import { V2_SIGNUP_PATH } from '@/v2/auth/constants';
import AuthCard from '../../_components/AuthCard';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get('error');
  const [error, setError] = useState(
    callbackError === 'auth_callback_failed'
      ? '이메일 인증 링크가 만료되었거나 유효하지 않습니다.'
      : ''
  );
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const [showReset, setShowReset] = useState(false);

  async function handleLogin(formData: FormData) {
    setPending(true);
    setError('');
    setMessage('');
    const result = await v2Login(formData);
    if (result && 'error' in result) {
      setError(result.error);
      setPending(false);
    }
  }

  async function handleReset(formData: FormData) {
    setPending(true);
    setError('');
    setMessage('');
    const result = await v2RequestPasswordReset(formData);
    setPending(false);
    if ('error' in result) {
      setError(result.error);
    } else {
      setMessage(result.message ?? '비밀번호 재설정 메일을 보냈습니다.');
    }
  }

  return (
    <AuthCard
      title={showReset ? '비밀번호 재설정' : '로그인'}
      description={
        showReset
          ? '가입한 이메일로 재설정 링크를 보내드립니다.'
          : '이메일 인증을 완료한 계정만 V2에 접근할 수 있습니다.'
      }
      footer={
        <>
          {showReset ? (
            <button
              type="button"
              onClick={() => {
                setShowReset(false);
                setError('');
                setMessage('');
              }}
              className="text-indigo-600 font-medium hover:underline"
            >
              로그인으로 돌아가기
            </button>
          ) : (
            <>
              계정이 없으신가요?{' '}
              <Link href={V2_SIGNUP_PATH} className="text-indigo-600 font-medium hover:underline">
                회원가입
              </Link>
            </>
          )}
        </>
      }
    >
      {showReset ? (
        <form action={handleReset} className="space-y-4">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="reset-email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {message && <p className="text-sm text-green-700">{message}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {pending ? '발송 중…' : '재설정 메일 보내기'}
          </button>
        </form>
      ) : (
        <form action={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {message && <p className="text-sm text-green-700">{message}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
          >
            {pending ? '로그인 중…' : '로그인'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowReset(true);
              setError('');
              setMessage('');
            }}
            className="w-full text-sm text-gray-500 hover:text-gray-700"
          >
            비밀번호를 잊으셨나요?
          </button>
        </form>
      )}
    </AuthCard>
  );
}
