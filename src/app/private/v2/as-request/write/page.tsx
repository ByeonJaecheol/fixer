import Link from 'next/link';
import { V2_AS_REQUEST_PATH } from '@/v2/constants/as-request';

export default function V2AsRequestWritePage() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">작업이력 작성 (V2)</h2>
      <p className="text-sm text-gray-600 mb-6">
        작성 폼은 다음 단계에서 레거시 AsLogForm을 v2 스키마에 맞게 이전합니다.
      </p>
      <Link
        href={V2_AS_REQUEST_PATH}
        className="text-sm text-indigo-600 hover:underline"
      >
        목록으로 돌아가기
      </Link>
    </div>
  );
}
