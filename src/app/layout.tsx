import type { Metadata } from "next";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME } from "./constants/constNames";


export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 text-black">
          <div className="flex flex-col min-h-screen">
            {/* <Header /> */}
            
            <main className="flex-1 flex justify-center items-center">
              {children}
            </main>
            
          </div>
      </body>
    </html>
  );
}
