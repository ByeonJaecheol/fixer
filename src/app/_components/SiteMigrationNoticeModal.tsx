'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MegaphoneIcon } from '@heroicons/react/24/outline';

const NEW_SITE_URL = 'https://fixer2.vercel.app/';
const STORAGE_KEY = 'fixer_migration_notice_dismissed';

function shouldShowNotice(pathname: string): boolean {
  if (pathname.startsWith('/private/v2') || pathname.startsWith('/v2')) {
    return false;
  }
  return pathname === '/' || pathname.startsWith('/private');
}

export default function SiteMigrationNoticeModal() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!shouldShowNotice(pathname)) {
      setOpen(false);
      return;
    }
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setOpen(true);
    }
  }, [pathname]);

  function handleDismiss() {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />

      <div className="flex min-h-full items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="migration-notice-title"
          className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <MegaphoneIcon className="h-7 w-7 text-amber-600" />
          </div>

          <h2
            id="migration-notice-title"
            className="text-center text-xl font-bold text-gray-900"
          >
            사이트 이전 안내
          </h2>

          <div className="mt-4 space-y-3 text-sm leading-relaxed text-gray-600">
            <p>
              이 사이트는 <strong className="text-gray-900">더 이상 일반 사용을 권장하지 않습니다.</strong>
            </p>
            <p>
              앞으로는 새로 만들어진{' '}
              <a
                href={NEW_SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
              >
                fixer2.vercel.app
              </a>
              로 접속해 주세요.
            </p>
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
              현재 사이트는 <strong>조회용으로만</strong> 이용해 주세요. 신규 작성·수정은 새 사이트에서
              진행해 주시기 바랍니다.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <a
              href={NEW_SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              새 사이트로 이동
            </a>
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              확인 (조회 계속)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
