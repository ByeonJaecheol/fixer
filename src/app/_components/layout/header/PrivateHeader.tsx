
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
      className="text-3xl font-bold tracking-tight text-slate-800 hover:text-slate-600 transition-colors"
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