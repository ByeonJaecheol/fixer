'use client'

import { APP_NAME } from "@/app/constants/constNames";
import { login, signup } from "@/app/login/action";
import { useState } from "react";

export default function LoginForm() {
  const [remember, setRemember] = useState(false)
  const [email, setEmail] = useState(localStorage.getItem('email') || '')
  const handleRemember = () => {
    setRemember(!remember)
    console.log(remember)
  }
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get('email')
    const password = formData.get('password')
    const remember = formData.get('remember')
    console.log(email,password,remember)
    if(remember){
      localStorage.setItem('email',email as string)
      
    console.log(remember)
  }
  }
  
  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-lg">
      <div className="mb-8 text-center">
  <h2 className="text-2xl font-bold text-violet-700">{APP_NAME}</h2>
</div>
  <form>
      <label htmlFor="email">이메일</label>
      <input id="email" name="email" type="email" required  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2" />
      <label className="mt-2 block" htmlFor="password">비밀번호</label>
      <input id="password" name="password" type="password" required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"  />
      <div className="flex flex-col gap-2 mt-4">
      <button formAction={login} className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors">로그인</button>
      <div className="flex items-center">
        <input type="checkbox" id="remember" name="remember" className="mr-2" checked={remember} onChange={handleRemember} />
        <label htmlFor="remember">아이디 저장</label>
      </div>

      {/* <button formAction={signup} className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors">Sign up</button> */}
      </div>
  </form>
    </div>
  );
}
