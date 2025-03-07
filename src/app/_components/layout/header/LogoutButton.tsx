'use client';

import { signOut } from "@/app/login/action";

export default function LogoutButton() {
  
    return (
      <div>
        
          <button
            className="ml-2 bg-red-500 border-2 shadow-lg text-white px-2 py-1 rounded-md text-md hover:bg-red-600 transition-colors duration-300 text-center"
            onClick={signOut}
          >
            로그아웃
          </button>
      </div>
    );
  }