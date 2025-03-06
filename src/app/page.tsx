import LoginForm from "./_components/auth/LoginForm";
import { ComputerDesktopIcon, ClockIcon, DeviceTabletIcon, DocumentTextIcon, Cog6ToothIcon ,QueueListIcon} from '@heroicons/react/24/outline';
import Header from './_components/Header';

const menuItems = [
  {
    icon: ComputerDesktopIcon,
    text: 'PC문의접수'
  },
  {
    icon: QueueListIcon,
    text: '이력관리'
  },
  {
    icon: DeviceTabletIcon,
    text: '장비대여'
  },
  {
    icon: DocumentTextIcon,
    text: '자료실'
  },
  {
    icon: Cog6ToothIcon,
    text: '설정'
  }
];

export default function Home() {
  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* 로그인 폼 */}
        <div className="lg:pl-12 max-w-md mx-auto">
          <LoginForm />
        </div>
        {/* 메뉴 버튼 */}
        <div className="mt-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 max-w-4xl mx-auto">
            {menuItems.map((item, index) => (
              <MenuButtonCircle key={index} text={item.text}>
                <item.icon className="w-12 h-12 text-gray-600 group-hover:text-blue-500 transition-colors duration-300" />
              </MenuButtonCircle>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function MenuButtonCircle({children, text}: {children: React.ReactNode, text: string}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <button className="w-20 h-20 rounded-full bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center border border-gray-100 hover:border-blue-200 group">
        {children}
      </button>
      <span className="text-sm font-medium text-gray-700">{text}</span>
    </div>
  )
}