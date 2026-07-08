import Link from 'next/link';
import Container from '@/app/private/pc-inquiry/_components/Container';
import { V2_AS_REQUEST_PATH } from '@/v2/constants/as-request';

const modules = [
  {
    title: '작업이력 (AS)',
    description: 'AS 작업이력 목록·작성·수정 — v2 as_logs 테이블',
    href: V2_AS_REQUEST_PATH,
    status: '개발 중',
  },
];

export default function V2HomePage() {
  return (
    <Container title="FIXER V2" description="레거시와 분리된 신규 모듈입니다. 기능별로 점진 전환합니다.">
      <div className="p-6 grid gap-4 sm:grid-cols-2">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="block rounded-xl border border-gray-200 p-5 hover:border-indigo-400 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">{mod.title}</h2>
              <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                {mod.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">{mod.description}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
