import { ComputerDesktopIcon, QueueListIcon, DeviceTabletIcon, DocumentTextIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const navigationItems = [
  {
    icon: ComputerDesktopIcon,
    text: 'PC문의접수',
    href: '/pc-inquiry'
  },
  {
    icon: QueueListIcon,
    text: '이력관리',
    href: '/history'
  },
  {
    icon: DeviceTabletIcon,
    text: '장비대여',
    href: '/equipment'
  },
  {
    icon: DocumentTextIcon,
    text: '자료실',
    href: '/resources'
  },
  {
    icon: Cog6ToothIcon,
    text: '설정',
    href: '/settings'
  }
];

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* 로고나 사이트 제목 */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">FIXER</span>
            </div>
          </div>
          
          {/* 네비게이션 메뉴 */}
          <div className="flex">
            {navigationItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.href}
                className="group inline-flex items-center px-4 py-2 border-b-2 border-transparent hover:border-blue-500 transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-500 transition-colors duration-200">
                    {item.text}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
} 