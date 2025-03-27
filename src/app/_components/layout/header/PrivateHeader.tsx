
import LoginedUser from './LoginedUser'
import { APP_NAME } from '@/app/constants/constNames'
import LogoutButton from './LogoutButton'
import Link from 'next/link'
import HeaderSearchBar from './HeaderSearchBar'

export default function PrivateHeader() {

  return (
    <div className='flex justify-between items-center p-4 gap-x-2'>
       <Link
      href="/private"
      className="text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent 
                 transition-transform duration-300 ease-in-out hover:scale-105"
    >
      {APP_NAME}
    </Link>
    {/* 자산검색 추가 */}
    <div className='flex flex-row items-center gap-x-2'>
      <HeaderSearchBar />
        <LoginedUser />
    </div>
    </div>
  )
}   