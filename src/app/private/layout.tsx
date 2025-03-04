import PrivateHeader from "../_components/layout/header/PrivateHeader";
import TopMenu from "../_components/layout/header/TopMenu";


export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 text-black">
          <div className="flex flex-col min-h-screen">
            {/* <Header /> */}
            <PrivateHeader/>
            <TopMenu/>
            <main className="flex-1 flex ">
              {children}
            </main>
          </div>
      </div>
  );
}
