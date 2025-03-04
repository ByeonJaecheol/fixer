import { redirect } from 'next/navigation'

import { createClient } from '@/app/utils/server'
import { signOut } from '../login/action'
import LoginErrorModal from './_components/LoginErrorModal'

export default async function PrivatePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    console.log('error', error)
    return <LoginErrorModal error={error} />
    // redirect('/login')
  }

  return (
    <div>
      <p>Hello {data.user.email}</p>
      <p>{data.user.user_metadata.name}</p>
      <button onClick={signOut}>로그아웃</button>
    </div>
  )
}