import BaseLayout from "@/app/_components/layout/header/BaseLayout";
import { imageCategories } from "./_components/ImageMenus";

export default function Layout({children}:{children:React.ReactNode}) {
    return (
        <BaseLayout title="윈도우 이미지 관리" description="윈도우 이미지의 생성, 수정, 버전 관리를 할 수 있습니다." categories={imageCategories}>
            {children}
        </BaseLayout>
    )
} 