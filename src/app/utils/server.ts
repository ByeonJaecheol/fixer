
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers"

export async function createClient() {
    const cookieStore = await cookies();
    // const session = cookieStore.get('session')?.value||''; 세션 미사용으로 일단 주석처리
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        cookies : {
            getAll(){
                return cookieStore.getAll();
            },
            setAll(cookiesToSet: any){
                try{
                cookiesToSet.forEach(({name, value, options}:{name:string, value:string, options:any})=>{
                    cookieStore.set(name, value, options);
                })
            }catch(error){
                console.error('Error setting cookies:', error);
            }
            }
            
        }
    }
    )
}