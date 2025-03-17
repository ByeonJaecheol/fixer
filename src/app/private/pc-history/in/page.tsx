import SupabaseService, { IAssetLog } from "@/api/supabase/supabaseApi";
import PcLogInput from "../_components/input/PcLogInput";
import { formatToKoreanTime } from "@/utils/utils";
import Link from "next/link"; 
import { log } from "console";
import LinstIn from "./components/LinstIn";

export default async function AddPcHistory() {
  const gridStyle = {
    gridTemplateColumns: "8% 8% 6% 8% 10% 12% 5% 5% 10% 30%"
  }
  const getPcManagementLog = async () : Promise<IAssetLog[]> => {
    const supabaseService = SupabaseService.getInstance();
    const { success, error, data } = await supabaseService.selectWithRelations({
      table: 'pc_management_log',
      columns: '*',
      relations: [
        { 
          table: 'pc_assets',
          columns: '*'  // 필요한 컬럼만 지정할 수도 있습니다 (예: 'asset_id,name,model')
        }
      ],
      match: { work_type: '입고' },
      // 필요에 따라 추가 조건 설정
      // match: { some_column: 'some_value' }
      order: { column: 'log_id', ascending: false },
    });
    if (success) {
      return data;
    } else {
      console.error('Error fetching pc_management_log:', error);
      return [];
    }
  }
  const pcManagementLog = await getPcManagementLog();
  console.log(pcManagementLog);
  return (
    <div>
        <PcLogInput workType={"입고"} />
        {pcManagementLog && pcManagementLog.length > 0 && (
          <LinstIn pcManagementLog={pcManagementLog} />
        )}
    </div>
  );
}
