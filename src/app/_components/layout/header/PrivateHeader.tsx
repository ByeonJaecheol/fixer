import { createClient } from '@/app/utils/server'
import LoginErrorModal from '../../../private/_components/LoginErrorModal'
import LoginedUser from './LoginedUser'
import { APP_NAME } from '@/app/constants/constNames'
import LogoutButton from './LogoutButton'
import Link from 'next/link'
export default async function PrivateHeader() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.log('error', error)
    return <LoginErrorModal/>
  }

  return (
    <div className='flex justify-between items-center p-4 gap-x-2'>
       <Link
      href="/private"
      className="text-5xl font-bold bg-gradient-to-r from-purple-700 to-purple-500 bg-clip-text text-transparent 
                 transition-transform duration-300 ease-in-out hover:scale-105"
    >
      {APP_NAME}
    </Link>
      <div className='flex justify-between items-center'>
        <LoginedUser data={data.user} />
        <LogoutButton />
      </div>
    </div>
  )
}   