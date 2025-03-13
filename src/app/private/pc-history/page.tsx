
import SupabaseService, { IAssetLog } from '@/api/supabase/supabaseApi';
import { supabase } from '@/app/utils/supabase';
import { formatToKoreanTime } from '@/utils/utils';



export default async function InventoryPage() {
  const gridStyle = {
    gridTemplateColumns: "8% 8% 8% 8% 10% 5% 5% 5% 10% 30%"
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
      // 필요에 따라 추가 조건 설정
      // match: { some_column: 'some_value' }
      // order: { column: 'created_at', ascending: false }
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
    <div className="space-y-4">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* 헤더 부분 */}
            <div className="grid border-b border-gray-200" style={gridStyle}>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">일자</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업유형</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PC타입</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">모델명</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">가동</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">횟수</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">용도</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업내용</div>
            </div>
              {/* 데이터 행 */}
              {pcManagementLog.map((log: IAssetLog) => (
                <div 
                  key={log.log_id}
                  style={gridStyle}
                  className="grid border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                >
                {/* id */}
                  <div className="px-2 py-4 text-sm  text-gray-500 text-center bg-gray-50">{log.log_id}</div>
                {/* 입고일 */}
                  <div className="px-2 py-4 text-sm text-gray-500 text-center">{formatToKoreanTime(log.work_date, 'date')}</div>
                {/* 작업유형 */}
                  <div className="px-2 py-4 text-sm text-gray-500 text-center">
                    {/* work_type 에 따라 색상 변경 */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${log.work_type === "입고" ? "bg-blue-100 text-blue-800" : 
                        log.work_type === "설치" ? "bg-orange-100 text-orange-800" : 
                        log.work_type === "반납" ? "bg-green-100 text-green-800" : 
                        log.work_type === "폐기" ? "bg-red-100 text-red-800" : 
                        "bg-gray-100 text-gray-800"}`}>
                      {log.work_type}
                    </span>
                  </div>
                {/* pc타입 */}
                  <div className="px-2 py-4 text-sm text-gray-500 text-center">
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
                  <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.pc_assets.model_name}</div>
                {/* 가동 */}
                  <div className="px-2 py-4 text-sm text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${log.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {log.is_available===null ? "-" : log.is_available ? "Y" : "N"}
                    </span>
                  </div>
                {/* 횟수 */}
                  <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.pc_assets.usage_count ?? '-'}</div>
                {/* 용도 */}
                  <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.usage_type ?? '-'}</div>
                
                {/* 작업내용 */}
                  <div className="px-2 py-4 text-sm text-gray-500 line-clamp-1 border-l border-gray-200" title={log.detailed_description}>
                    {log.detailed_description ?? '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
          </div>
  );
}
