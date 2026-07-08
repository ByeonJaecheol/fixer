'use client';

import { User } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ensureUserProfile, getDefaultNickname } from '@/utils/userProfile';

type UserContextType = {
  user: User | null;
  nickname: string;
  profileLoading: boolean;
  setNickname: (nickname: string) => void;
  refreshProfile: () => Promise<void>;
};

export const UserContext = createContext<UserContextType>({
  user: null,
  nickname: '',
  profileLoading: true,
  setNickname: () => {},
  refreshProfile: async () => {},
});

export function useUser() {
  return useContext(UserContext);
}

export function useAuthorName(): string {
  const { user, nickname } = useUser();
  if (nickname) return nickname;
  if (user?.email) return getDefaultNickname(user.email);
  return '';
}

export function UserProvider({
  children,
  user,
  initialNickname,
}: {
  children: React.ReactNode;
  user: User | null;
  initialNickname?: string;
}) {
  const [nickname, setNickname] = useState(initialNickname ?? '');
  const [profileLoading, setProfileLoading] = useState(!initialNickname);

  const refreshProfile = useCallback(async () => {
    if (!user?.email) {
      setNickname('');
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    try {
      const profile = await ensureUserProfile(user);
      setNickname(profile.nickname);
    } catch {
      setNickname(getDefaultNickname(user.email));
    } finally {
      setProfileLoading(false);
    }
  }, [user, initialNickname]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <UserContext.Provider
      value={{ user, nickname, profileLoading, setNickname, refreshProfile }}
    >
      {children}
    </UserContext.Provider>
  );
}
