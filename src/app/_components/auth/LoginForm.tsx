'use client'

import { APP_NAME } from "@/app/constants/constNames";
import { login } from "@/app/login/action";
import { useEffect, useState } from "react";

export default function LoginForm() {
  const [remember, setRemember] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  useEffect(()=>{
    const remember = localStorage.getItem('remember')
    const email = localStorage.getItem('email')
    if(remember){
      setRemember(remember === 'true')
      setEmail(email || '')
    }
  },[])

  useEffect(()=>{
    if(remember){
      localStorage.setItem('remember', remember.toString())
      localStorage.setItem('email', email)
    }else{
      localStorage.removeItem('remember')
      localStorage.removeItem('email')
    }
  },[remember,email])
 
  const handleLogin = async (formData: FormData) => {
    const result = await login(formData)
    if(result.error){
      console.log(result.error)
      setError(result.error)
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-lg">
      <div className="mb-8 text-center">
  <h2 className="text-5xl font-bold text-violet-700">{APP_NAME}</h2>
</div>
  <form>
      <label htmlFor="email">이메일</label>
      <input id="email" name="email" type="email" required defaultValue={email} autoFocus={true}  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
      onChange={(e)=>{
        setEmail(e.target.value)
      }}
      />
      <label className="mt-2 block" htmlFor="password">비밀번호</label>
      <input id="password" name="password" type="password" required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2" />
      <div className="flex flex-col gap-2 mt-4">
      <button formAction={handleLogin} className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors">로그인</button>
      <div className="flex items-center">
        <input type="checkbox" id="remember" name="remember" className="mr-2" checked={remember} onChange={()=>{setRemember(!remember)}} />
        <label htmlFor="remember">아이디 저장</label>
      </div>
      {error && <div className="text-red-500">{'아이디 또는 비밀번호가 일치하지 않습니다.'}</div>}

      {/* <div>{localStorage.getItem('remember')}</div> */}
      {/* <div>{localStorage.getItem('email')}</div> */}

      {/* <button formAction={signup} className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors">Sign up</button> */}
      </div>
  </form>
    </div>
  );
}
