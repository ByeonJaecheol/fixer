import { formatToKoreanTime, truncateDescription } from "@/utils/utils";
import { getPcManagementLog } from "@/api/supabase/supabaseTempApi";
import Link from "next/link";
import SupabaseService, { IPcManagementLog, IAsManagementLog } from "@/api/supabase/supabaseApi";
import AsLogInput from "../_components/AsLogInput";
import DataTable, { Column } from "@/components/shared/DataTable";

export default async function NetworkPage() {
    const gridStyle = {
       gridTemplateColumns: "8% 8% 8% 8% 10% 10% 20% 35%"
      //  id,작업유형,pc타입,모델명,제조번호,상태,가동,횟수,용도,입고일,작업내용
      }
      const getNetworkManagementLog = async () : Promise<any> => {
        const supabaseService = SupabaseService.getInstance();
        const { success, error, data } = await supabaseService.select({
          table: 'as_management_log',
          columns: '*',
          // 필요에 따라 추가 조건 설정
          match: { work_type: '네트워크' },
          order: { column: 'work_date', ascending: false }
        });
        if (success) {
          return data;
        } else {
          console.error('Error fetching as_management_log:', error);
          return [];
        }
      }
      const asManagementLog = await getNetworkManagementLog();

      // 테이블 열 정의
      const columns: Column[] = [
        { key: "log_id", header: "ID" },
        { key: "created_by", header: "작성자", type: "email" },
        { key: "work_date", header: "작업일", type: "date" },
        { key: "model_name", header: "모델명", type: "truncate", truncateLength: 9 },
        { key: "employee_department", header: "부서" },
        { key: "employee_name", header: "사용자" },
        { key: "question", header: "문의내용", type: "truncate", truncateLength: 30 },
        { key: "solution_detail", header: "조치내용", type: "truncate", truncateLength: 30 }
      ];

  return (
    <div>
        <AsLogInput defaultWorkType={"네트워크"} />
    
        <div className="p-6">
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <DataTable
                columns={columns}
                data={asManagementLog}
                gridTemplateColumns="8% 8% 8% 8% 10% 10% 20% 35%"
                detailUrlPrefix="/private/as-request/network/detail"
              />
            </div>
        </div>
      </div>
    </div>
    </div>
  );
}
