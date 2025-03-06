import BaseLayout from "@/app/_components/layout/header/BaseLayout";

export default function Layout({children}:{children:React.ReactNode}) {
    return (
        <BaseLayout>
            {children}
        </BaseLayout>
    )
}
