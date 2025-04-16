import { getPcManagementLog } from "@/api/supabase/supabaseTempApi";
import PcLogInput from "../_components/input/PcLogInput";
import DataTable, { Column } from "@/components/shared/DataTable";

export default async function DisposalPage() {
  const pcManagementLog = await getPcManagementLog("pc_management_log", "pc_assets", "폐기", "work_date", false);

  // 테이블 열 정의
  const columns: Column[] = [
    { key: "log_id", header: "ID" },
    { key: "created_by", header: "작성자", type: "email" },
    { key: "work_date", header: "폐기일", type: "date" },
    { key: "work_type", header: "작업유형", type: "work_type" },
    { key: "pc_type", header: "PC타입", type: "pc_type", accessor: "pc_assets.pc_type" },
    { key: "model_name", header: "모델명", type: "truncate", truncateLength: 9, accessor: "pc_assets.model_name" },
    { key: "serial_number", header: "제조번호", accessor: "pc_assets.serial_number" },
    { 
      key: "is_disposed", 
      header: "폐기여부", 
      type: "availability", 
      accessor: "pc_assets.is_disposed" 
    },
    { key: "usage_type", header: "용도" },
    { key: "detailed_description", header: "작업내용", type: "truncate", truncateLength: 30 }
  ];

  return (
    <div>
      <PcLogInput workType={"폐기"} />
      <div className="p-6">
        <DataTable
          columns={columns}
          data={pcManagementLog}
          gridTemplateColumns="8% 8% 8% 8% 8% 12% 10% 6% 5% 30%"
          detailUrlPrefix="/private/pc-history/disposal/detail"
        />
      </div>
    </div>
  );
}
