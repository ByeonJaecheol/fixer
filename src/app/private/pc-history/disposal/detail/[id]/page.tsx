import { getPcManagementLogWithId } from "@/api/supabase/supabaseTempApi";
import PcLogForm from "../../../_components/PcLogForm";

export default async function DisposalDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params;
    
    const pcManagementLog = await getPcManagementLogWithId("pc_management_log","pc_assets","폐기","log_id",false,id);
    
    return (
        <PcLogForm mode="edit" log={pcManagementLog[0]} />
    );
}
    