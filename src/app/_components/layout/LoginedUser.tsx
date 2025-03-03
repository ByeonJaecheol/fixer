'use client';

import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginedUser({ isLogined }: { isLogined?: boolean }) {
const logined_id = localStorage.getItem('userID') ||'';
const router = useRouter();
  useEffect(() => {
    if (!isLogined) {
      router.push('/login');
    }
  }, []);
  return (
    // <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
    // <div className="max-w-2xl mx-a0uto bg00-white rounded-lg shadow-lg p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {logined_id}님 환영합니다!
        </h1>
        <p className="text-gray-600">
          오늘도 좋은 하루 되세요 ✨
        </p>
      </div>
    // </div>
//   </div>
  );
}
