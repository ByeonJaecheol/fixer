import { createClient } from '@/app/utils/server'
import { signOut } from '../../../login/action'
import LoginErrorModal from '../../../private/_components/LoginErrorModal'
import LoginedUser from './LoginedUser'
import { APP_NAME } from '@/app/constants/constNames'
import { PowerIcon } from '@heroicons/react/24/solid'
import LogoutButton from './LogoutButton'
export default async function PrivateHeader() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.log('error', error)
    return <LoginErrorModal/>
  }

  return (
    <div className='flex justify-between items-center p-4 gap-x-2'>
      <div className='text-5xl font-bold'>
        {APP_NAME}
      </div>
      <div className='flex justify-between items-center'>
        <LoginedUser data={data.user} />
        <LogoutButton />
      </div>
    </div>
  )
}   