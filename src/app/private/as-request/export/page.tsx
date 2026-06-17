import { redirect } from 'next/navigation';

/**
 * 기존 전체 데이터 보내기 페이지 — 보고서(/private/report)로 통합됨
 * @see src/app/private/report/page.tsx
 */
export default function AsRequestExportPage() {
  redirect('/private/report');
}

/* ─── 기존 전체 데이터 보내기 UI (임시 비활성화) ───
 * 기능이 /private/report 로 이동되었습니다.
 * 복원 시 git history 또는 아래 파일 참고:
 * - src/app/private/as-request/export/page.tsx (이전 커밋)
 * - src/utils/asLogExport.ts (JSON/CSV/마이그레이션 export)
 */
