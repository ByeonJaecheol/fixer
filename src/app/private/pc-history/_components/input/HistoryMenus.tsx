import { ComputerDesktopIcon,PlusIcon,CpuChipIcon, XMarkIcon,ArrowUturnDownIcon, ViewColumnsIcon,GlobeAltIcon,PrinterIcon,WrenchScrewdriverIcon,BriefcaseIcon} from '@heroicons/react/24/outline';
import Link from 'next/link';
export interface IHistoryCategory {
    id: string;
    name: string;
    icon: React.ElementType;
    color: string;
    href: string;
}
export const pcHistoryCategories: IHistoryCategory[] = [
    {
      id: 'all',
      name: '전체보기',
      icon: ViewColumnsIcon,
      color: 'text-gray-600',
      href: '/private/pc-history'
    },
    {
      id: 'pc-in',
      name: '등록',
      icon: PlusIcon,
      color: 'text-green-600',
      href: '/private/pc-history/in'
    },
    {
      id: 'pc-new-install',
      name: '출고',
      icon: ComputerDesktopIcon,
      color: 'text-blue-600',
      href: '/private/pc-history/install'
    },
    {
      id: 'pc-return',
      name: '반납',
      icon: ArrowUturnDownIcon,
      color: 'text-blue-600',
      href: '/private/pc-history/return'
    },
    {
      id: 'pc-disposal',
      name: '폐기',
      icon: XMarkIcon,
      color: 'text-red-600',
      href: '/private/pc-history/disposal'
    },
    
  ];
 export const asHistoryCategories = [
    {
      id: 'all',
      name: '전체보기',
      icon: ViewColumnsIcon,
      color: 'text-gray-600',
      href: '/private/as-request'
    },
    {
      id: 'as-hw',
      name: 'H/W',
      icon: CpuChipIcon,
      color: 'text-blue-600',
      href: '/private/as-request/hardware'
    },
    {
      id: 'as-sw',
      name: 'S/W',
      icon: ComputerDesktopIcon,
      color: 'text-blue-600',
      href: '/private/as-request/software'
    },
    {
      id: 'as-network',
      name: '네트워크',
      icon: GlobeAltIcon,
      color: 'text-blue-600',
      href: '/private/as-request/network'
    },
    {
      id: 'as-device',
      name: '장비관리',
      icon: WrenchScrewdriverIcon,
      color: 'text-blue-600',
      href: '/private/as-request/device'
    },
    {
      id: 'as-other',
      name: '기타',
      icon: BriefcaseIcon,
      color: 'text-blue-600',
      href: '/private/as-request/other'
    },
  ];
export default function HistoryMenus({categories}:{categories:IHistoryCategory[]}) {
    return (
        <div className="flex overflow-x-auto scrollbar-hide">
          {categories.map((category : IHistoryCategory) => (
            <Link
              key={category.id}
              href={category.href}
              className="group flex-shrink-0 flex flex-col items-center px-6 py-4 border-b-2 border-transparent hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
            >
              <div className={`p-3 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors duration-200`}>
                <category.icon className={`w-6 h-6 ${category.color} group-hover:text-blue-600`} />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
    )
}

