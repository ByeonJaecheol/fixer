import Link from 'next/link';
import { listAsLogs } from '@/v2/services/as-log.service';
import { formatAuthorName } from '@/utils/userProfile';
import { formatToKoreanTime, truncateDescription } from '@/utils/utils';
import { V2_AS_REQUEST_PATH } from '@/v2/constants/as-request';

interface AsLogListProps {
  workType?: string;
  title?: string;
}

export default async function AsLogList({ workType, title }: AsLogListProps) {
  const { data: logs, error } = await listAsLogs({
    workType,
    limit: 100,
    sortField: 'work_date',
    ascending: false,
  });

  if (error) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium mb-1">데이터를 불러올 수 없습니다</p>
          <p className="text-amber-800">{error}</p>
          <p className="mt-2 text-amber-700">
            Supabase에서{' '}
            <code className="bg-amber-100 px-1 rounded">supabase/migrations/001_v2_as_logs.sql</code>
            을 실행했는지 확인하세요.
          </p>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          레거시는{' '}
          <Link href="/private/as-request" className="text-blue-600 hover:underline">
            /private/as-request
          </Link>
          에서 계속 사용할 수 있습니다.
        </p>
      </div>
    );
  }

  const items = logs ?? [];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {title ?? '전체'} · {items.length}건 (최대 100건)
        </p>
        <div className="flex gap-2">
          <Link
            href={`${V2_AS_REQUEST_PATH}/write`}
            className="px-3 py-1.5 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            작성
          </Link>
          <Link
            href="/private/as-request"
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            레거시 보기
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          등록된 작업이력이 없습니다.
          <br />
          마이그레이션 SQL(002)로 레거시 데이터를 이전하거나, 작성 페이지에서 새로 등록하세요.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-600">
                <th className="py-2 px-3 font-medium">ID</th>
                <th className="py-2 px-3 font-medium">작업일</th>
                <th className="py-2 px-3 font-medium">유형</th>
                <th className="py-2 px-3 font-medium">분류</th>
                <th className="py-2 px-3 font-medium">모델명</th>
                <th className="py-2 px-3 font-medium">부서</th>
                <th className="py-2 px-3 font-medium">작성자</th>
                <th className="py-2 px-3 font-medium">문의</th>
              </tr>
            </thead>
            <tbody>
              {items.map((log) => (
                <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-900">{log.id}</td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {formatToKoreanTime(log.work_date, 'date')}
                  </td>
                  <td className="py-2 px-3">{log.work_type}</td>
                  <td className="py-2 px-3">{log.category ?? '-'}</td>
                  <td className="py-2 px-3">{log.model_name ?? '-'}</td>
                  <td className="py-2 px-3">{log.employee_department ?? '-'}</td>
                  <td className="py-2 px-3">{formatAuthorName(log.created_by)}</td>
                  <td className="py-2 px-3 max-w-xs truncate">
                    {truncateDescription(log.question ?? undefined, 40)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
