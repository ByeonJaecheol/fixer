'use client';

import { User } from "@supabase/supabase-js";

export default function LoginedUser({ data }: { data: User }) {
// const logined_id = localStorage.getItem('userID') ||'';
// const router = useRouter();
  // useEffect(() => {
  //   if (!isLogined) {
  //     router.push('/');
  //   }
  // }, []);
  return (
    // <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
    // <div className="max-w-2xl mx-a0uto bg00-white rounded-lg shadow-lg p-6">
      <div className="text-center">
        <h1 className="text-lg font-bold text-gray-800 ">
          {data.email}
        </h1>
      </div>
    // </div>
//   </div>
  );
}
