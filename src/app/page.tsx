import Image from "next/image";
import LoginForm from "./_components/auth/LoginForm";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 ">
      <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-4rem)]">
        {/* 왼쪽: 회사 소개 섹션 */}
        <div className="space-y-8 lg:pr-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 py-2">
              Digital Koras
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              혁신적인 기술로 더 나은 미래를 만들어갑니다
            </p>
          </div>
          
          {/* 특징 섹션 */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-black">빠른 처리</h3>
              <p className="text-gray-600">신속하고 정확한 업무 처리</p>
            </div>
            
            <div className="p-4 bg-white/50 backdrop-blur-sm rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-black">보안 강화</h3>
              <p className="text-gray-600">철저한 보안 관리</p>
            </div>
          </div>

          {/* 애니메이션 이미지 */}
          {/* <div className="relative h-48 rounded-xl overflow-hidden">
            <Image
              src="/innovation.svg" // 적절한 이미지 필요
              alt="Innovation Illustration"
              fill
              className="object-cover"
            />
          </div> */}
        </div>

        {/* 오른쪽: 로그인 폼 */}
        <div className="lg:pl-12">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
