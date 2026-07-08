
import LoginedUser from './LoginedUser'
import Link from 'next/link'
import Image from 'next/image'
import HeaderSearchBar from './HeaderSearchBar'

export default function PrivateHeader() {

  return (
    <div className='flex justify-between items-center p-4 gap-x-2'>
       <Link
      href="/private"
      className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity"
    >
      <Image
        src="/FixerLogo.png"
        alt="FIXER"
        width={140}
        height={48}
        className="h-10 w-auto"
        priority
      />
      <span className="text-2xl font-bold tracking-wide text-gray-900">
        FIXER
      </span>
    </Link>
    {/* 자산검색 추가 */}
    <div className='flex flex-row items-center gap-x-2'>
      <HeaderSearchBar />
        <LoginedUser />
    </div>
    </div>
  )
}   