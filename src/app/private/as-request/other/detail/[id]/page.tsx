import AsLogForm from "../../../_components/AsLogForm";
import SupabaseService from "@/api/supabase/supabaseApi";

export default async function OtherDetailPage({ params }: { params: { id: string } }) {
    const getOtherManagementLog = async (): Promise<any> => {
        const supabaseService = SupabaseService.getInstance();
        const { success, error, data } = await supabaseService.select({
            table: 'as_management_log',
            columns: '*',
            match: { log_id: params.id },
        });
        if (success) {
            return data;
        } else {
            console.error('Error fetching as_management_log:', error);
            return [];
        }
    }
    const log = await getOtherManagementLog();
    
    return <AsLogForm mode="edit" log={log[0]} />;
}



