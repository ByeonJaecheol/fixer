'use client'

import { User } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

type UserContextType = {
  user: User | null
}

export const UserContext = createContext<UserContextType>({ user: null })

export function useUser() {
  return useContext(UserContext)
}

export function UserProvider({
  children,
  user,
}: {
  children: React.ReactNode
  user: User | null
}) {
  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  )
} 