import HistoryMenus from "@/app/private/pc-history/_components/input/HistoryMenus";
import Container from "@/app/private/pc-inquiry/_components/Container";

export default function BaseLayout({children}:{children:React.ReactNode}) {
    return (
        <Container title="이력관리" description="카테고리별 이력을 확인하실 수 있습니다.">
      
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <HistoryMenus />
          {children}
          
        </div>
      </Container>
    )
}
