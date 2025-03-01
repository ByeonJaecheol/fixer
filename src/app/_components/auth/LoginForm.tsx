'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Cookies from 'js-cookie';

export default function LoginForm() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('login_id', loginId)
        .single();

      if (error || !data) {
        throw new Error('로그인 정보가 올바르지 않습니다.');
      }

      if (data.password !== password) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }

      // 쿠키에 세션 저장 (7일 유효)
      Cookies.set('session', JSON.stringify({
        login_id: data.login_id,
        user_id: data.id
      }), { 
        expires: 7,
        secure: true,
        sameSite: 'strict'
      });

      // last_login 업데이트
      await supabase
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);

      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-lg">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Digital Koras Solution</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="loginId" className="block text-sm font-medium text-gray-700">
            아이디
          </label>
          <input
            id="loginId"
            type="text"
            required
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
            placeholder="아이디를 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

   
    </div>
  );
} 