import Link from 'next/link';
import { APP_NAME } from '@/app/constants/constNames';

export default function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <p className="text-xs font-semibold tracking-widest text-indigo-600 uppercase mb-2">
            FIXER V2
          </p>
          <h1 className="text-3xl font-bold text-gray-900">{APP_NAME}</h1>
          <h2 className="mt-2 text-lg font-medium text-gray-700">{title}</h2>
          {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {children}
        </div>
        {footer && <div className="mt-6 text-center text-sm text-gray-600">{footer}</div>}
        <p className="mt-8 text-center text-xs text-gray-400">
          레거시 로그인은{' '}
          <Link href="/" className="text-gray-500 hover:text-gray-700 underline">
            기존 홈
          </Link>
          에서 이용할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
