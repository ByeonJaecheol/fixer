import { formatToKoreanTime, truncateDescription } from "@/utils/utils";
import { getPcManagementLog } from "@/api/supabase/supabaseTempApi";
import Link from "next/link";
import SupabaseService, { IPcManagementLog, IAsManagementLog } from "@/api/supabase/supabaseApi";
import AsLogInput from "../_components/AsLogInput";
import DataTable, { Column } from "@/components/shared/DataTable";

export default async function SoftwarePage() {
  const getSoftwareManagementLog = async (): Promise<any> => {
    const supabaseService = SupabaseService.getInstance();
    const { success, error, data } = await supabaseService.select({
      table: 'as_management_log',
      columns: '*',
      match: { work_type: 'S/W' },
      order: { column: 'work_date', ascending: false }
    });
    
    if (success) {
      return data;
    } else {
      console.error('Error fetching as_management_log:', error);
      return [];
    }
  };
  
  const asManagementLog = await getSoftwareManagementLog();

  // 테이블 열 정의
  const columns: Column[] = [
    { key: "log_id", header: "ID" },
    { key: "created_by", header: "작성자", type: "email" },
    { key: "work_date", header: "작업일", type: "date" },
    { key: "model_name", header: "모델명", type: "truncate", truncateLength: 9 },
    { key: "employee_department", header: "부서" },
    { key: "employee_name", header: "사용자" },
    { key: "category", header: "카테고리" },
    { key: "question", header: "문의내용", type: "truncate", truncateLength: 30 },
    { key: "solution_detail", header: "조치내용", type: "truncate", truncateLength: 30 }
  ];

  return (
    <div>
      <AsLogInput defaultWorkType={"S/W"} />
      <div className="p-6">
        <DataTable
          columns={columns}
          data={asManagementLog}
          gridTemplateColumns="8% 8% 8% 8% 8% 12% 12% 18% 18%"
          detailUrlPrefix="/private/as-request/software/detail"
        />
      </div>
    </div>
  );
}
