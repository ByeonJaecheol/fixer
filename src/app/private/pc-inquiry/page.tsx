import { ComputerDesktopIcon, WrenchScrewdriverIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import Notification from './_components/Notification';
import Container from './_components/Container';
import BodyMenu from './_components/BodyMenu';

const inquiryOptions = [
  {
    title: '신규PC요청',
    icon: ComputerDesktopIcon,
    description: '새로운 PC가 필요한 경우',
    bgColor: 'from-blue-50 to-indigo-50',
    hoverColor: 'group-hover:from-blue-100 group-hover:to-indigo-100',
    iconColor: 'text-blue-600',
    link: '/private/pc-inquiry/new-pc-request',
    href: '/private/pc-inquiry/new-pc-request'
  },
  {
    title: 'PC수리',
    icon: WrenchScrewdriverIcon,
    description: 'PC 고장 및 수리가 필요한 경우',
    bgColor: 'from-emerald-50 to-teal-50',
    hoverColor: 'group-hover:from-emerald-100 group-hover:to-teal-100',
    iconColor: 'text-emerald-600',
    link: '/private/pc-inquiry/pc-repair',
    href: '/private/pc-inquiry/pc-repair'
  },
  {
    title: 'PC교체',
    icon: ArrowPathIcon,
    description: '기존 PC의 교체가 필요한 경우',
    bgColor: 'from-purple-50 to-fuchsia-50',
    hoverColor: 'group-hover:from-purple-100 group-hover:to-fuchsia-100',
    iconColor: 'text-purple-600',
    link: '/private/pc-inquiry/pc-replacement',
    href: '/private/pc-inquiry/pc-replacement'
  }
];

export default function PCInquiryPage() {
  return (
    <>
    <Container title="PC 문의접수" description="필요한 서비스를 선택해주세요.">
      <BodyMenu InquiryOption={inquiryOptions} />
      <Notification />
    </Container>
        {/* 안내사항 */}
    </>
  );
} 


