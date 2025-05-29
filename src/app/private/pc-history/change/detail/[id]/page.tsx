import { getPcManagementLogWithId } from "@/api/supabase/supabaseTempApi";
import PcLogForm from "../../../_components/PcLogForm";

export default async function ChangeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const pcManagementLog = await getPcManagementLogWithId("pc_management_log","pc_assets","변경","log_id",false,id);
    
    return (
        <PcLogForm mode="edit" log={pcManagementLog[0]} />
    );
}
    