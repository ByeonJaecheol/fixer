import SupabaseService, { IPcManagementLog } from "@/api/supabase/supabaseApi";
import PcLogInput from "../_components/input/PcLogInput";
import DataTable, { Column } from "@/components/shared/DataTable";

export default async function AddPcHistory() {
  const getPcManagementLog = async (): Promise<IPcManagementLog[]> => {
    const supabaseService = SupabaseService.getInstance();
    const { success, error, data } = await supabaseService.selectWithRelations({
      table: 'pc_management_log',
      columns: '*',
      relations: [
        { 
          table: 'pc_assets',
          columns: '*'
        }
      ],
      match: { work_type: '입고' },
      order: { column: 'created_at', ascending: false },
    });
    if (success) {
      return data;
    } else {
      console.error('Error fetching pc_management_log:', error);
      return [];
    }
  };
  
  const pcManagementLog = await getPcManagementLog();

  // 테이블 열 정의
  const columns: Column[] = [
    { key: "log_id", header: "ID" },
    { key: "created_by", header: "작성자", type: "email" },
    { key: "work_date", header: "입고일", type: "date" },
    { key: "work_type", header: "작업유형", type: "work_type" },
    { key: "pc_type", header: "PC타입", type: "pc_type", accessor: "pc_assets.pc_type" },
    { key: "model_name", header: "모델명", accessor: "pc_assets.model_name" },
    { key: "serial_number", header: "제조번호", accessor: "pc_assets.serial_number" },
    { key: "security_code", header: "코드번호" },
    { key: "usage_type", header: "용도" },
    { key: "detailed_description", header: "작업내용", type: "truncate", truncateLength: 30 }
  ];

  return (
    <div>
      <PcLogInput workType={"입고"} />
      <div className="p-6">
        {pcManagementLog && pcManagementLog.length > 0 && (
          <DataTable
            columns={columns}
            data={pcManagementLog}
            gridTemplateColumns="8% 8% 6% 8% 10% 12% 5% 5% 10% 30%"
            detailUrlPrefix="/private/pc-history/in/detail"
          />
        )}
      </div>
    </div>
  );
}