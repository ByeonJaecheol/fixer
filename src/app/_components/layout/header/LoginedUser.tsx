'use client';

import { useAuthorName, useUser } from '@/context/UserContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftStartOnRectangleIcon,
  ChevronDownIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import LoginErrorModal from '@/app/private/_components/LoginErrorModal';
import { signOut } from '@/app/login/action';
import { updateProfile } from '@/app/private/profile/actions';

export default function LoginedUser() {
  const router = useRouter();
  const { user, nickname, setNickname, refreshProfile } = useUser();
  const displayName = useAuthorName();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!user) {
    return <LoginErrorModal />;
  }

  if (!user?.email) return null;

  const initials = displayName.slice(0, 1).toUpperCase();
  const currentNickname = nickname || displayName;

  const openProfileEditor = () => {
    setNicknameInput(currentNickname);
    setEmailInput(user.email ?? '');
    setError(null);
    setSuccessMessage(null);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    const result = await updateProfile(nicknameInput, emailInput);

    if (result.error) {
      setError(result.error);
      setIsSaving(false);
      return;
    }

    if (result.nickname) {
      setNickname(result.nickname);
    }

    await refreshProfile();
    setIsEditingProfile(false);
    setIsSaving(false);

    if (result.emailConfirmationRequired) {
      setSuccessMessage('이메일 변경 확인 메일이 발송되었습니다. 메일을 확인해주세요.');
    }

    router.refresh();
  };

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
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {displayName}
            </span>
            <span className="text-xs text-gray-500 group-hover:text-gray-600">Online</span>
          </div>
          <ChevronDownIcon
            className={`w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setIsEditingProfile(false);
              setError(null);
            }}
          />

          <div className="absolute right-0 mt-2 w-72 py-2 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>

            {successMessage && !isEditingProfile && (
              <div className="px-4 py-2 text-xs text-green-700 bg-green-50 border-b border-green-100">
                {successMessage}
              </div>
            )}

            {isEditingProfile ? (
              <div className="px-4 py-3 border-b border-gray-100 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">닉네임</label>
                  <input
                    type="text"
                    value={nicknameInput}
                    onChange={(e) => setNicknameInput(e.target.value)}
                    maxLength={20}
                    className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="닉네임 입력"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-600">이메일</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="mt-1 w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="이메일 입력"
                    disabled={isSaving}
                  />
                </div>

                {error && <p className="text-xs text-red-600">{error}</p>}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex-1 px-2 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isSaving ? '저장 중...' : '저장'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setError(null);
                    }}
                    disabled={isSaving}
                    className="flex-1 px-2 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    취소
                  </button>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  닉네임 변경 시 기존 작성 글의 작성자명도 함께 변경됩니다. 이메일 변경 시
                  확인 메일이 발송될 수 있습니다.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={openProfileEditor}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span>프로필 수정</span>
              </button>
            )}

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
  );
}
