import { UserProvider } from "@/context/UserContext";
import PrivateHeader from "../_components/layout/header/PrivateHeader";
import TopMenu from "../_components/layout/header/TopMenu";
import LoginErrorModal from "./_components/LoginErrorModal";
import { createClient } from "../utils/server";
import { getDefaultNickname } from "@/utils/userProfile";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    return <LoginErrorModal />
  }

  let initialNickname: string | undefined;
  if (data.user.email) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('nickname')
      .eq('id', data.user.id)
      .maybeSingle();

    initialNickname = profile?.nickname ?? getDefaultNickname(data.user.email);
  }

  return (
    <UserProvider user={data.user} initialNickname={initialNickname}>
      <div className="flex-1 min-h-screen bg-slate-100 text-slate-900">
        <div className="flex flex-col min-h-screen">
          {/* <Header /> */}
          <PrivateHeader/>
          <TopMenu/>
          <main className="flex-1 flex ">
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
