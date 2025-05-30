import BaseLayout from "@/app/_components/layout/header/BaseLayout";
import { asHistoryCategories } from "../pc-history/_components/input/HistoryMenus";

export default function Layout({children}:{children:React.ReactNode}) {
    return (
        <BaseLayout title="작업 이력관리" description="작업 이력에 대한 모든 내역을 기록 및 확인하실 수 있습니다." categories={asHistoryCategories}>
            {children}
        </BaseLayout>
    )
}
