import { supabase } from "@/app/utils/supabase";

export default async function CheckAuth() {
    const {data : {session}, error } = await supabase.auth.getSession();
    if(error){
        console.error(error);
        return false;
    }
    console.log('세션 확인',session);   
    return session;
}

