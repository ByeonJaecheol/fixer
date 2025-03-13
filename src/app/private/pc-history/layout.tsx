import BaseLayout from "@/app/_components/layout/header/BaseLayout";
import { pcHistoryCategories } from "./_components/input/HistoryMenus";

export default function Layout({children}:{children:React.ReactNode}) {
    return (
        <BaseLayout title="장비 이력관리" description="장비에 대한 이력을 확인하실 수 있습니다." categories={pcHistoryCategories}>
            {children}
        </BaseLayout>
    )
}
