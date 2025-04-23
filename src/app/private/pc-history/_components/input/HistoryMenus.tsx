'use client'
import { ComputerDesktopIcon,PlusIcon,CpuChipIcon, XMarkIcon,ArrowUturnDownIcon, ViewColumnsIcon,GlobeAltIcon,PrinterIcon,WrenchScrewdriverIcon,BriefcaseIcon} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
export interface IHistoryCategory {
    id: string;
    name: string;
    value: string;
    icon: React.ElementType;
    color: string;
    href: string;
}
export const pcHistoryCategories: IHistoryCategory[] = [
    {
      id: 'all',
      name: '전체보기',
      value: 'all',
      icon: ViewColumnsIcon,
      color: 'text-gray-600',
      href: '/private/pc-history'
    },
    {
      id: 'pc-in',
      name: '등록',
      value: 'in',
      icon: PlusIcon,
      color: 'text-green-600',
      href: '/private/pc-history/in'
    },
    {
      id: 'pc-new-install',
      name: '출고',
      value: 'install',
      icon: ComputerDesktopIcon,
      color: 'text-blue-600',
      href: '/private/pc-history/install'
    },
    {
      id: 'pc-return',
      name: '반납',
      value: 'return',
      icon: ArrowUturnDownIcon,
      color: 'text-blue-600',
      href: '/private/pc-history/return'
    },
    {
      id: 'pc-disposal',
      name: '폐기',
      value: 'disposal',
      icon: XMarkIcon,
      color: 'text-red-600',
      href: '/private/pc-history/disposal'
    },
    
  ];
 export const asHistoryCategories = [
    {
      id: 'all',
      name: '전체보기',
      value: 'all',
      icon: ViewColumnsIcon,
      color: 'text-gray-600',
      href: '/private/as-request'
    },
    {
      id: 'as-hw',
      name: 'H/W',
      value: 'hardware',
      icon: CpuChipIcon,
      color: 'text-blue-600',
      href: '/private/as-request/hardware'
    },
    {
      id: 'as-sw',
      name: 'S/W',
      value: 'software',
      icon: ComputerDesktopIcon,
      color: 'text-blue-600',
      href: '/private/as-request/software'
    },
    {
      id: 'as-network',
      name: '네트워크',
      value: 'network',
      icon: GlobeAltIcon,
      color: 'text-blue-600',
      href: '/private/as-request/network'
    },
    {
      id: 'as-device',
      name: '장비관리',
      value: 'device',
      icon: WrenchScrewdriverIcon,
      color: 'text-blue-600',
      href: '/private/as-request/device'
    },
    {
      id: 'as-other',
      name: '기타',
      value: 'other',
      icon: BriefcaseIcon,
      color: 'text-blue-600',
      href: '/private/as-request/other'
    },
  ];
export default function HistoryMenus({categories}:{categories:IHistoryCategory[]}) {
  const pathname = useSelectedLayoutSegment();
    return (
      // 반응형 모바일 뷰 대응
        <div className="flex flex-wrap gap-x-4 ">
          {categories.map((category : IHistoryCategory) => (
            <Link
              key={category.id}
              href={category.href}
              className={`group flex-shrink-0 flex flex-col items-center p-2 md:px-4 border-b-2 border-transparent hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors duration-200
              ${category.value===pathname ? 'text-blue-600 font-bold' : 'text-gray-700 font-medium'}
              `}
            >
              <div className={`p-3 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors duration-200 ${category.value===pathname ? 'bg-blue-200' : 'bg-gray-50'}`}>
                <category.icon className={`w-6 h-6 ${category.color} group-hover:text-blue-600`} />
              </div>
              <span className={`mt-2 text-sm group-hover:text-blue-600 ${category.value===pathname ? 'text-blue-600 font-bold text-lg ' : 'text-gray-700 font-medium'}`}>
                {category.name}
              </span>
            </Link>
          ))}
        </div>
    )
}

