// 'use client'
// import { useEffect, useState } from 'react'
// import { supabase } from "@/app/utils/supabase"
// import { User } from '@supabase/supabase-js'

// export default function AuthTestPage() {
//   const [user, setUser] = useState<User | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [email, setEmail] = useState('pcsub1@ket.com')
//   const [password, setPassword] = useState('7776')
//   const [authStatus, setAuthStatus] = useState<string>('')

//   // 초기 로그인 상태 확인
//   useEffect(() => {
//     checkUser()
    
//     // 인증 상태 변경 구독
//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null)
//       setAuthStatus(`Auth State Changed: ${_event}`)
//     })

//     return () => subscription.unsubscribe()
//   }, [])

//   const checkUser = async () => {
//     try {
//       const { data: { user }, error } = await supabase.auth.getUser()
//       if (error) throw error
//       setUser(user)
//     } catch (error) {
//       console.error('Error checking user:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleLogin = async () => {
//     try {
//       setLoading(true)
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password
//       })
//       if (error) throw error
//       setAuthStatus('Login successful')
//     } catch (error: any) {
//       setAuthStatus(`Login error: ${error.message}`)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleLogout = async () => {
//     try {
//       setLoading(true)
//       const { error } = await supabase.auth.signOut()
//       if (error) throw error
//       setAuthStatus('Logout successful')
//     } catch (error: any) {
//       setAuthStatus(`Logout error: ${error.message}`)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const checkSession = async () => {
//     const { data: { session }, error } = await supabase.auth.getSession()
//     if (error) {
//       setAuthStatus(`Session check error: ${error.message}`)
//     } else {
//       setAuthStatus(`Session exists: ${!!session}`)
//     }
//   }

//   return (
//     <div className="max-w-2xl mx-auto p-6 space-y-6">
//       {/* 상태 표시 */}
//       <div className="bg-gray-100 p-4 rounded-lg">
//         <h2 className="text-lg font-semibold mb-2">현재 상태</h2>
//         <div className="space-y-2">
//           <p>로딩 상태: {loading ? '로딩중' : '완료'}</p>
//           <p>로그인 상태: {user ? '로그인됨' : '로그아웃됨'}</p>
//           <p>최근 상태 변경: {authStatus}</p>
//         </div>
//       </div>

//       {/* 로그인 폼 */}
//       <div className="bg-white p-4 rounded-lg border">
//         <h2 className="text-lg font-semibold mb-4">로그인 테스트</h2>
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">이메일</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700">비밀번호</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//             />
//           </div>
//         </div>
//       </div>

//       {/* 작업 버튼들 */}
//       <div className="flex flex-wrap gap-4">
//         <button
//           onClick={handleLogin}
//           disabled={loading}
//           className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
//         >
//           로그인
//         </button>
//         <button
//           onClick={handleLogout}
//           disabled={loading}
//           className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
//         >
//           로그아웃
//         </button>
//         <button
//           onClick={checkSession}
//           className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
//         >
//           세션 확인
//         </button>
//       </div>

//       {/* 사용자 정보 */}
//       {user && (
//         <div className="bg-green-50 p-4 rounded-lg">
//           <h2 className="text-lg font-semibold mb-2">사용자 정보</h2>
//           <pre className="bg-white p-4 rounded overflow-auto text-sm">
//             {JSON.stringify(user, null, 2)}
//           </pre>
//         </div>
//       )}

//       {/* 쿠키 정보 */}
//       <div className="bg-blue-50 p-4 rounded-lg">
//         <h2 className="text-lg font-semibold mb-2">쿠키 정보</h2>
//         <pre className="bg-white p-4 rounded overflow-auto text-sm">
//           {document.cookie}
//         </pre>
//       </div>

//       {/* localStorage 정보 */}
//       <div className="bg-yellow-50 p-4 rounded-lg">
//         <h2 className="text-lg font-semibold mb-2">localStorage 정보</h2>
//         <pre className="bg-white p-4 rounded overflow-auto text-sm">
//           {JSON.stringify(Object.entries(localStorage), null, 2)}
//         </pre>
//       </div>
//     </div>
//   )
// }
