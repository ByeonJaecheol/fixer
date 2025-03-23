'use server';

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '../utils/server'

export async function login(formData: FormData) {
  console.log('로그인 시작')
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  console.log('로그인 시작')
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  console.log(data, 'data')
  const { error } = await supabase.auth.signInWithPassword(data)
  if (error) {
    console.log(error, 'error에러발생 진입')
    return { error: error.code }
  }
  console.log('로그인 성공')
 

  revalidatePath('/','layout')
  redirect('/private')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signOut() {
  console.log('로그아웃 시작')
  const supabase = await createClient()
  console.log('로그아웃 중')
  const { error } = await supabase.auth.signOut()
  console.log('로그아웃 완료',error)
  if (error) {
    redirect('/error')
  }
  console.log('로그아웃 성공')
  redirect('/')
}