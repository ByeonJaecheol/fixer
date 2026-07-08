'use client';

import { useState } from 'react';
import Link from 'next/link';
import { v2SignUp } from '@/v2/auth/actions';
import { V2_LOGIN_PATH } from '@/v2/auth/constants';
import AuthCard from '../../_components/AuthCard';

export default function SignupForm() {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError('');
    const result = await v2SignUp(formData);
    if (result && 'error' in result) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <AuthCard
      title="회원가입"
      description="회사 이메일로 가입 후, 메일 인증을 완료해야 이용할 수 있습니다."
      footer={
        <>
          이미 계정이 있으신가요?{' '}
          <Link href={V2_LOGIN_PATH} className="text-indigo-600 font-medium hover:underline">
            로그인
          </Link>
        </>
      }
    >
      <form action={handleSubmit} className="space-y-4">
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
            placeholder="name@company.com"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
            닉네임 (표시 이름)
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            required
            maxLength={20}
            placeholder="홍길동"
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
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">8자 이상</p>
        </div>
        <div>
          <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호 확인
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
        >
          {pending ? '가입 중…' : '가입하고 이메일 인증하기'}
        </button>
      </form>
    </AuthCard>
  );
}
