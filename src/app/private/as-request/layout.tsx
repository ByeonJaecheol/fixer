import BaseLayout from "@/app/_components/layout/header/BaseLayout";
import { asHistoryCategories } from "../pc-history/_components/input/HistoryMenus";

export default function Layout({children}:{children:React.ReactNode}) {
    return (
        <BaseLayout title="수리 이력관리" description="수리 이력에 대한 이력을 확인하실 수 있습니다." categories={asHistoryCategories}>
            {children}
        </BaseLayout>
    )
}
