import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest } from 'next/server'

import { createClient } from '@/app/utils/server'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // 사용자를 지정된 리디렉션 URL 또는 앱의 루트로 리디렉션합니다.
      redirect(next)
    }
  }

  // 몇 가지 지침이 포함된 오류 페이지로 사용자를 리디렉션합니다.
  redirect('/error')
}