import AsLogForm from "../../../_components/AsLogForm";
import SupabaseService from "@/api/supabase/supabaseApi";

export default async function SoftwareDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    
    const getSoftwareManagementLog = async (): Promise<any> => {
        const supabaseService = SupabaseService.getInstance();
        const { success, error, data } = await supabaseService.select({
            table: 'as_management_log',
            columns: '*',
            match: { log_id: id },
        });
        if (success) {
            return data;
        } else {
            console.error('Error fetching as_management_log:', error);
            return [];
        }
    }
    const log = await getSoftwareManagementLog();
    
    return <AsLogForm mode="edit" log={log[0]} />;
}



