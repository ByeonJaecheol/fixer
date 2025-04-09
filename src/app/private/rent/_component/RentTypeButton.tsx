'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface RentTypeButtonProps {
  type: '사무용' | '설계용' | '기타';
  children: React.ReactNode;
}


// 네비게이션 컨테이너 컴포넌트 수정
export default function RentTypeNav() {
  return (
    <nav className="p-4 bg-white rounded-xl shadow-sm">
      <div className="flex justify-start items-center space-x-2">
        <RentNavButton type="사무용">
          사무용 PC
        </RentNavButton>
        <RentNavButton type="설계용">
          설계용 PC
        </RentNavButton>
        <RentNavButton type="기타">
          기타 PC
        </RentNavButton>
      </div>
    </nav>
  );
}


export  function RentNavButton({ type, children }: RentTypeButtonProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentType = searchParams.get('type');
    
    const handleClick = () => {
      router.push(`/private/rent?type=${type}`);
    };
  
    // 현재 선택된 메뉴 스타일
    const isActive = currentType === type;
  
    // 타입별 스타일 변경
    const getNavStyle = () => {
      const baseStyle = 'flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 border';
      const activeStyle = {
        사무용: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
        설계용: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
        기타: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
      };
      const inactiveStyle = {
        사무용: 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-blue-600',
        설계용: 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-green-600',
        기타: 'text-gray-600 border-transparent hover:bg-gray-50 hover:text-gray-700'
      };
  
      return `${baseStyle} ${isActive ? activeStyle[type as keyof typeof activeStyle] : inactiveStyle[type as keyof typeof inactiveStyle]}`;
    };
  
    // 아이콘 컴포넌트
    const getIcon = () => {
      switch (type) {
        case '사무용':
          return (
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          );
        case '설계용':
          return (
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          );
        case '기타':
          return (
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          );
      }
    };
  
    return (
      <button
        onClick={handleClick}
        className={getNavStyle()}
      >
        {getIcon()}
        <span>{children}</span>
        {isActive && (
          <span className="ml-2 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        )}
      </button>
    );
  }
  