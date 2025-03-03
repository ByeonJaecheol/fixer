import { APP_NAME } from '../constants/constNames'
import { login, signup } from './action'

export default function LoginPage() {
  return (
    <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-lg">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-violet-700">{APP_NAME}</h2>
      </div>
        <form>
            <label htmlFor="email">Email:</label>
            <input id="email" name="email" type="email" required  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2" />
            <label htmlFor="password">Password:</label>
            <input id="password" name="password" type="password" required className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"  />
            <div className="flex flex-col gap-2 mt-4">
            <button formAction={login} className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors">Log in</button>
            <button formAction={signup} className="bg-violet-700 text-white px-4 py-2 rounded-lg hover:bg-violet-800 transition-colors">Sign up</button>
            </div>
        </form>
    </div>

  )
}