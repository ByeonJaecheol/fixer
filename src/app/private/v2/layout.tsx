import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/utils/server';
import { V2_BASE_PATH } from '@/v2/constants/as-request';
import { V2_CHECK_EMAIL_PATH, V2_LOGIN_PATH } from '@/v2/auth/constants';

export default async function V2Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(V2_LOGIN_PATH);
  }

  if (!user.email_confirmed_at) {
    return (
      <div className="flex-1 w-full min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl border border-amber-200 p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">이메일 인증이 필요합니다</h2>
          <p className="text-sm text-gray-600 mb-4">
            V2는 본인 이메일 인증 후 이용할 수 있습니다.
            <br />
            <span className="font-medium text-gray-800">{user.email}</span>
          </p>
          <Link
            href={`${V2_CHECK_EMAIL_PATH}?email=${encodeURIComponent(user.email ?? '')}`}
            className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
          >
            인증 메일 다시 받기
          </Link>
          <div className="mt-4">
            <Link
              href={V2_LOGIN_PATH}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              다른 계정으로 로그인
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full">
      <div className="bg-indigo-600 text-white px-4 py-2 text-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wide">FIXER V2</span>
          <span className="text-indigo-200">이메일 인증 계정 · {user.email}</span>
        </div>
        <Link
          href={V2_BASE_PATH}
          className="text-indigo-100 hover:text-white underline-offset-2 hover:underline"
        >
          V2 홈
        </Link>
      </div>
      {children}
    </div>
  );
}
