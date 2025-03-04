// components/AuthModal.tsx
'use client';

import { AuthError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginErrorModal() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* 배경 오버레이 */}
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

            {/* 모달 컨텐츠 */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                    {/* 아이콘 */}
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <svg
                            className="h-6 w-6 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                            />
                        </svg>
                    </div>

                    {/* 메시지 */}
                    <div className="mt-3 text-center sm:mt-5">
                        <h3 className="text-lg font-semibold leading-6 text-gray-900">
                            접근 권한이 없습니다
                        </h3>
                        <div className="mt-2">
                            <p className="text-sm text-gray-500">
                                {countdown}초 후 로그인 페이지로 이동합니다...
                            </p>
                        </div>
                    </div>

                    {/* 카운트다운 원형 프로그레스 */}
                    <div className="mt-4 flex justify-center">
                        <div className="relative h-16 w-16">
                            <svg className="h-full w-full" viewBox="0 0 36 36">
                                {/* 배경 원 */}
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#E5E7EB"
                                    strokeWidth="3"
                                />
                                {/* 프로그레스 원 */}
                                <path
                                    d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#EF4444"
                                    strokeWidth="3"
                                    strokeDasharray={`${(countdown / 3) * 100}, 100`}
                                    className="transform -rotate-90 origin-center"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-semibold text-gray-900">
                                    {countdown}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="mt-5 sm:mt-6">
                        <button
                            type="button"
                            onClick={() => router.push('/login')}
                            className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        >
                            로그인 페이지로 이동
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}