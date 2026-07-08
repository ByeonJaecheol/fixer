import BaseLayout from '@/app/_components/layout/header/BaseLayout';
import { v2AsHistoryCategories } from '@/v2/constants/as-request-categories';

export default function V2AsRequestLayout({ children }: { children: React.ReactNode }) {
  return (
    <BaseLayout
      title="작업 이력관리 (V2)"
      description="신규 as_logs 테이블 기반 작업 이력입니다."
      categories={v2AsHistoryCategories}
    >
      {children}
    </BaseLayout>
  );
}
