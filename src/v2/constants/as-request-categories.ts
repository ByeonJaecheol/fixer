import {
  BriefcaseIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ViewColumnsIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import type { IHistoryCategory } from '@/app/private/pc-history/_components/input/HistoryMenus';
import { V2_AS_REQUEST_PATH } from './as-request';

export const v2AsHistoryCategories: IHistoryCategory[] = [
  {
    id: 'all',
    name: '전체보기',
    value: 'all',
    icon: ViewColumnsIcon,
    color: 'text-gray-600',
    href: V2_AS_REQUEST_PATH,
  },
  {
    id: 'as-device',
    name: 'H/W',
    value: 'hardware',
    icon: WrenchScrewdriverIcon,
    color: 'text-blue-600',
    href: `${V2_AS_REQUEST_PATH}/hardware`,
  },
  {
    id: 'as-sw',
    name: 'S/W',
    value: 'software',
    icon: ComputerDesktopIcon,
    color: 'text-blue-600',
    href: `${V2_AS_REQUEST_PATH}/software`,
  },
  {
    id: 'as-network',
    name: '네트워크',
    value: 'network',
    icon: GlobeAltIcon,
    color: 'text-blue-600',
    href: `${V2_AS_REQUEST_PATH}/network`,
  },
  {
    id: 'as-other',
    name: '기타',
    value: 'other',
    icon: BriefcaseIcon,
    color: 'text-blue-600',
    href: `${V2_AS_REQUEST_PATH}/other`,
  },
];
