import { getPcManagementLogWithId } from "@/api/supabase/supabaseTempApi";
import PcLogForm from "../../../_components/PcLogForm";

export default async function ReturnDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    
    const pcManagementLog = await getPcManagementLogWithId("pc_management_log","pc_assets","반납","log_id",false,id);
    
    return (
        <PcLogForm mode="edit" log={pcManagementLog[0]} />
    );
}
    