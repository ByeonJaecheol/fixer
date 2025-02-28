'use client';

import Link from 'next/link';

export default function Header() {

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              Koras solution
            </Link>
          </div>
          
          {/* {user && (
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-500">{user.department}</span>
                <span className="mx-2 text-gray-300">|</span>
                <span className="font-medium text-gray-900">{user.name}</span>
                <span className="ml-2 text-xs text-indigo-600">({user.role})</span>
              </div>
              <button
                onClick={() => logout()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                로그아웃
              </button>
            </div>
          )} */}
        </div>
      </div>
    </header>
  );
} 