import { createClient } from '@/app/utils/server'
import LoginErrorModal from './_components/LoginErrorModal'

export default async function PrivatePage() {
  // const supabase = await createClient()

  // const { data, error } = await supabase.auth.getUser()
  // if (error || !data?.user) {
  //   console.log('error', error)
  //   return <LoginErrorModal/>
  //   // redirect('/login')
  // }

  return (
    <div>
      <div>본문</div>
    </div>
  )
}