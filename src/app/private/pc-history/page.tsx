import SupabaseService, { IPcManagementLog } from '@/api/supabase/supabaseApi';
import DataTable, { Column } from "@/components/shared/DataTable";

export default async function PcHistoryPage() {
  const getPcManagementLog = async () : Promise<any> => {
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
      order: { column: 'created_at', ascending: false }
    });
    if (success) {
      return data;
    } else {
      console.error('Error fetching pc_management_log:', error);
      return [];
    }
  };
  
  const pcManagementLog = await getPcManagementLog();
  
  // 작업유형에 따른 상세 페이지 URL 접두사 결정 함수
  const getDetailUrlPrefix = (workType: string) => {
    switch(workType) {
      case '입고': return '/private/pc-history/in/detail';
      case '설치': return '/private/pc-history/install/detail';
      case '폐기': return '/private/pc-history/disposal/detail';
      case '반납': return '/private/pc-history/return/detail';
      case '변경': return '/private/pc-history/change/detail';
      default: return '/private/pc-history/other/detail';
    }
  };

  // 테이블 열 정의
  const columns: Column[] = [
    { key: "log_id", header: "ID" },
    { key: "created_by", header: "작성자", type: "email" },
    { key: "work_date", header: "작업일", type: "date" },
    { key: "work_type", header: "작업유형", type: "work_type" },
    { key: "pc_type", header: "PC타입", type: "pc_type", accessor: "pc_assets.pc_type" },
    { key: "model_name", header: "모델명", accessor: "pc_assets.model_name" },
    { key: "serial_number", header: "제조번호", accessor: "pc_assets.serial_number" },
    { key: "security_code", header: "코드번호" },
    { key: "usage_type", header: "용도" },
    { key: "detailed_description", header: "작업내용", type: "truncate", truncateLength: 30 }
  ];

  // 작업유형에 따른 동적 URL 처리를 위해 데이터를 확장
  const enhancedData = pcManagementLog.map((log: IPcManagementLog) => ({
    ...log,
    detailUrl: `${getDetailUrlPrefix(log.work_type)}/${log.log_id}`
  }));

  return (
    <div className="p-6">
      <DataTable
        columns={columns}
        data={enhancedData}
        gridTemplateColumns="8% 8% 8% 8% 5% 8% 8% 8% 8% 25%"
        detailUrlPrefix="/private/pc-history"
        idField="detailUrl" // URL 처리를 위해 idField를 customField로 변경
      />
    </div>
  );
}
