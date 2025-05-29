'use client';

import BaseLayout from "@/app/_components/layout/header/BaseLayout";
import { pcHistoryCategories } from "./_components/input/HistoryMenus";

export default function Layout({children}:{children:React.ReactNode}) {
    return (
        <BaseLayout 
            title="장비 이력관리" 
            description="장비에 대한 모든 유동(변경) 이력을 기록." 
            categories={pcHistoryCategories}
        >
            {children}
        </BaseLayout>
    )
}
