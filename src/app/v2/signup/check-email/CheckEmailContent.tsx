'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { v2ResendConfirmation } from '@/v2/auth/actions';
import { V2_LOGIN_PATH, V2_SIGNUP_PATH } from '@/v2/auth/constants';
import AuthCard from '../../_components/AuthCard';

export default function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleResend() {
    if (!email) {
      setError('이메일 정보가 없습니다. 회원가입을 다시 진행해주세요.');
      return;
    }
    setPending(true);
    setError('');
    setMessage('');
    const result = await v2ResendConfirmation(email);
    setPending(false);
    if ('error' in result) {
      setError(result.error);
    } else {
      setMessage(result.message ?? '인증 메일을 다시 보냈습니다.');
    }
  }

  return (
    <AuthCard
      title="이메일을 확인해주세요"
      description={
        email
          ? `${email}(으)로 인증 메일을 보냈습니다.`
          : '가입하신 이메일로 인증 메일을 보냈습니다.'
      }
      footer={
        <Link href={V2_LOGIN_PATH} className="text-indigo-600 font-medium hover:underline">
          로그인으로 돌아가기
        </Link>
      }
    >
      <div className="space-y-4 text-sm text-gray-600">
        <p>메일함에서 FIXER 인증 링크를 클릭하면 V2 서비스를 이용할 수 있습니다.</p>
        <ul className="list-disc list-inside space-y-1 text-gray-500">
          <li>스팸함도 확인해주세요.</li>
          <li>링크는 보통 24시간 내 유효합니다.</li>
        </ul>
        {message && (
          <p className="text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleResend}
          disabled={pending || !email}
          className="w-full rounded-lg border border-gray-300 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
        >
          {pending ? '발송 중…' : '인증 메일 다시 보내기'}
        </button>
        {!email && (
          <Link
            href={V2_SIGNUP_PATH}
            className="block text-center text-indigo-600 hover:underline"
          >
            회원가입 다시 하기
          </Link>
        )}
      </div>
    </AuthCard>
  );
}
