import HistoryMenus, { IHistoryCategory } from "@/app/private/pc-history/_components/input/HistoryMenus";
import Container from "@/app/private/pc-inquiry/_components/Container";

export default function BaseLayout({children,title,description,categories}:{children:React.ReactNode,title:string,description:string,categories:IHistoryCategory[]}) {
    return (
        <Container title={title} description={description}>
      
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <HistoryMenus categories={categories} />
          {children}
          
        </div>
      </Container>
    )
}
