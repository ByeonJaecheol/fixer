import SupabaseService from "@/api/supabase/supabaseApi";
import InputPcIn from "../_components/input/InputPcIn";
import { formatToKoreanTime } from "@/utils/utils";
import Link from "next/link"; 

export default async function AddPcHistory() {
  const gridStyle = {
    gridTemplateColumns: "8% 8% 6% 8% 10% 12% 5% 5% 10% 30%"
  }
  const getPcManagementLog = async () : Promise<any> => {
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

  return (
    <div>
        <InputPcIn workType={"입고"} />
      <div className="p-6">
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {/* 헤더 부분 */}
              <div className="grid border-b border-gray-200" style={gridStyle}>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</div>
                <div className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">입고일</div>
                <div className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업유형</div>
                <div className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PC타입</div>
                <div className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">모델명</div>
                <div className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제조번호</div>
                <div className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</div>
                <div className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">횟수</div>
                <div className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">용도</div>
                <div className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업내용</div>
              </div>
                {/* 데이터 행 */}
                {pcManagementLog.map((log: any) => (
                  <Link 
                    href={`/private/pc-history/in/detail/${log.log_id}`}
                    key={log.log_id}
                    style={gridStyle}
                    className="grid border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                  >
                  {/* id */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center bg-gray-50">{log.log_id}</div>
                  {/* 입고일 */}
                    <div className="px-2 py-4 text-sm text-gray-500">{formatToKoreanTime(log.work_date, 'date')}</div>
                  {/* 작업유형 */}
                    <div className="px-2 py-4 text-sm text-gray-500">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.work_type}
                      </span>
                    </div>
                  {/* pc타입 */}
                    <div className="px-2 py-4 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${log.pc_assets.pc_type === null ? 
                          "bg-gray-100 text-gray-800" : 
                          log.pc_assets.pc_type === "데스크탑" ? 
                          "bg-purple-100 text-purple-800" : 
                          "bg-green-100 text-green-800"}`}>
                        {log.pc_assets.pc_type === null ? "-" : log.pc_assets.pc_type === "데스크탑" ? "DESKTOP" : "NOTEBOOK"}
                      </span>
                    </div>
                  {/* 모델명 */}
                    <div className="px-2 py-4 text-sm text-gray-500 font-medium">{log.pc_assets.model_name}</div>
                    {/* 제조번호 */}
                    <div className="px-2 py-4 text-sm text-gray-500 font-medium">{log.pc_assets.serial_number}</div>
                  {/* 상태 */}
                    <div className="px-2 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${log.status ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {log.status ?? '-'}
                      </span>
                    </div>
                  
                  {/* 횟수 */}
                    <div className="px-2 py-4 text-sm text-gray-500">{log.pc_assets.usage_count ?? '-'}</div>
                  {/* 용도 */}
                    <div className="px-2 py-4 text-sm text-gray-500">{log.usage_type ?? '-'}</div>
                  
                  {/* 작업내용 */}
                    <div className="px-2 py-4 text-sm text-gray-500 line-clamp-1" title={log.detailed_description}>
                      {log.detailed_description ?? '-'}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
        </div>
      </div>
    </div>
    </div>
  );
}
