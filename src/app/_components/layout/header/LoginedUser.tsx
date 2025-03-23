'use client';

import { useUser } from '@/context/UserContext'
import { useState } from 'react'
import { ChevronDownIcon, ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/app/utils/server'
import LoginErrorModal from '@/app/private/_components/LoginErrorModal';
import { signOut } from '@/app/login/action';

export default function LoginedUser() {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  
  if (!user) {
    return <LoginErrorModal />
  }

  if (!user?.email) return null

  const initials = user.email
    .split('@')[0]
    .slice(0, 1)
    .toUpperCase()

  // const handleLogout = async () => {
  //   const supabase = await createClient()
  //   await supabase.auth.signOut()
  //   window.location.href = '/' // 로그아웃 후 홈으로 리다이렉트
  // }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-3 px-3 py-2 hover:bg-black/5 rounded-xl transition-all duration-200"
      >
        <div className="relative">
          <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg text-white font-medium text-sm">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {user.email.split('@')[0]}
            </span>
            <span className="text-xs text-gray-500 group-hover:text-gray-600">
              Online
            </span>
          </div>
          <ChevronDownIcon 
            className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay to close dropdown when clicking outside */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                {user.email.split('@')[0]}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
            
            <button
              onClick={signOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <ArrowLeftStartOnRectangleIcon className="w-4 h-4" />
              <span>로그아웃</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
