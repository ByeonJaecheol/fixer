import { ClockIcon, WrenchIcon } from '@heroicons/react/24/outline';

export default function UnderConstructionPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-12 ">
      <div className="text-center max-w-md mx-auto">
        {/* 아이콘 영역 */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <WrenchIcon className="h-20 w-20 text-blue-500 animate-pulse" />
            <ClockIcon className="h-10 w-10 text-orange-500 absolute -bottom-2 -right-2" />
          </div>
        </div>
        
        {/* 제목 */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          페이지 준비중입니다
        </h1>
        
        {/* 설명 */}
        <div className="text-lg text-gray-600 mb-8 flex flex-col">
            <span>
                현재 이 페이지는 개발 예정중인 페이지입니다. 
            </span>
            <span>
                빠른 시일 내에 새로운 기능으로 찾아뵙겠습니다.
            </span>
        </div>
        
        {/* 추가 정보 */}
        {/* <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">
            개발 일정 안내
          </h2>
          <ul className="text-left text-gray-600 space-y-2">
            <li className="flex items-start">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
              <span>예상 개발 완료일: 2024년 6월 예정</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
              <span>문의사항은 관리자에게 연락해 주세요</span>
            </li>
          </ul>
        </div> */}
        
        {/* 버튼 */}
        <div className="mt-8">
          <a 
            href="/private"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            메인으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}

