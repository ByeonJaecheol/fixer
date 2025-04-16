import { formatToKoreanTime, truncateDescription } from "@/utils/utils";
import { getPcManagementLog } from "@/api/supabase/supabaseTempApi";
import Link from "next/link";
import SupabaseService, { IPcManagementLog, IAsManagementLog } from "@/api/supabase/supabaseApi";
import AsLogInput from "../_components/AsLogInput";
import DataTable, { Column } from "@/components/shared/DataTable";

export default async function DevicePage() {
  const getHardWareManagementLog = async (): Promise<any> => {
    const supabaseService = SupabaseService.getInstance();
    const { success, error, data } = await supabaseService.select({
      table: 'as_management_log',
      columns: '*',
      match: { work_type: '장비관리' },
      order: { column: 'work_date', ascending: false }
    });
    
    if (success) {
      return data;
    } else {
      console.error('Error fetching as_management_log:', error);
      return [];
    }
  };
  
  const asManagementLog = await getHardWareManagementLog();

  // 테이블 열 정의
  const columns: Column[] = [
    { key: "log_id", header: "ID" },
    { key: "created_by", header: "작성자", type: "email" },
    { key: "work_date", header: "작업일", type: "date" },
    { key: "model_name", header: "모델명", type: "truncate", truncateLength: 9 },
    { key: "employee_department", header: "부서" },
    { key: "employee_name", header: "사용자" },
    { key: "category", header: "카테고리" },
    { key: "detailed_category", header: "상세" },
    { key: "question", header: "문의내용", type: "truncate", truncateLength: 30 },
    { key: "solution_detail", header: "조치내용", type: "truncate", truncateLength: 30 }
  ];

  return (
    <div>
      <AsLogInput workType={"장비관리"} />
      <div className="p-6">
        <DataTable
          columns={columns}
          data={asManagementLog}
          gridTemplateColumns="8% 8% 8% 8% 8% 12% 6% 6% 15% 15%"
          detailUrlPrefix="/private/as-request/device/detail"
        />
      </div>
    </div>
  );
}
