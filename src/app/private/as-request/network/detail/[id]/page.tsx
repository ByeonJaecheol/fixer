import SupabaseService from "@/api/supabase/supabaseApi";
import AsLogDetailInput from "../../../_components/AsLogDetailInput";

export default async function NetworkDetailPage({params}:{params: {id: string}}) {
  const id = params.id as string;
  const supabaseService = SupabaseService.getInstance();
  const {data: log, error} = await supabaseService.select({table: "as_management_log", match: {log_id: id}});
  console.log("★★★★★★★★★",log);
  if (error) {
    console.error(error);
  }
  if (!log) {
    return <div>존재하지 않는 로그입니다.</div>;
  } 
  return (  
    <div>
        <AsLogDetailInput log={log[0]} />
    </div>
  );
}



