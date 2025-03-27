import { MagnifyingGlassIcon, ComputerDesktopIcon, DeviceTabletIcon, DocumentTextIcon, Cog6ToothIcon, ChatBubbleBottomCenterIcon,WrenchIcon, CalendarIcon, ChartBarIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const navigationItems = [
  {
    icon: ChatBubbleBottomCenterIcon,
    text: '문의접수',
    href: '/private/pc-inquiry'
  },
  {
    icon: MagnifyingGlassIcon,
    text: '자산검색',
    href: '/private/pc-assets'
  },
  {
    icon: ComputerDesktopIcon,
    text: '장비이력',
    href: '/private/pc-history'
  },
  {
    icon: WrenchIcon,
    text: '작업이력',
    href: '/private/as-request'
  },
  {
    icon: DeviceTabletIcon,
    text: '장비대여',
    href: '/private/rent'
  },
  {
    icon: CalendarIcon,
    text: '일정',
    href: '/private/schedule'
  },
  {
    icon: ChartBarIcon,
    text: '보고서',
    href: '/private/report'
  },
  {
    icon: QrCodeIcon,
    text: 'QR코드',
    href: '/private/qrcode'
  },
  {
    icon: DocumentTextIcon,
    text: '자료실',
    href: 'http://192.168.108.66/redmine'
  },
  {
    icon: Cog6ToothIcon,
    text: '설정',
    href: '/private/setting'
  }
];

export default function TopMenu() {
  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex p-2">
          
          {/* 네비게이션 메뉴 */}
          <div className="flex flex-wrap gap-x-2">
            {navigationItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.href}
                className="group inline-flex items-center px-4 py-2 border-b-2 border-transparent hover:border-blue-500 transition-colors duration-200"
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors duration-200 hidden md:block" />
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