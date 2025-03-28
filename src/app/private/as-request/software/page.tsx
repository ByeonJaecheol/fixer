import { formatToKoreanTime } from "@/utils/utils";
import { getPcManagementLog } from "@/api/supabase/supabaseTempApi";
import Link from "next/link";
import SupabaseService, { IAssetLog, IHardWareLog } from "@/api/supabase/supabaseApi";
import AsLogInput from "../_components/AsLogInput";


export default async function SoftwarePage() {
    const gridStyle = {
       gridTemplateColumns: "8% 8% 8% 8% 12% 12% 18% 18%"
      //  id,작업유형,pc타입,모델명,제조번호,상태,가동,횟수,용도,입고일,작업내용
      }
      const getHardWareManagementLog = async () : Promise<any> => {
        const supabaseService = SupabaseService.getInstance();
        const { success, error, data } = await supabaseService.select({
          table: 'as_management_log',
          columns: '*',
          // 필요에 따라 추가 조건 설정
          match: { work_type: 'S/W' },
          order: { column: 'created_at', ascending: false }
        });
        if (success) {
          return data;
        } else {
          console.error('Error fetching pc_management_log:', error);
          return [];
        }
      }
      const asManagementLog = await getHardWareManagementLog();

  return (
    <div>
        <AsLogInput workType={"S/W"} />
    
        <div className="p-6">
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {/* 헤더 부분 */}
              <div className="grid border-b border-gray-200" style={gridStyle}>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업일</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">모델명</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">부서</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">문의내용</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">조치내용</div>
              </div>
                {/* 데이터 행 */}
                {asManagementLog.map((log: IHardWareLog) => (
                  <Link 
                    href={`/private/as-request/hardware/detail/${log.log_id}`}
                    key={log.log_id}
                    style={gridStyle}
                    className="grid border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                  >
                  {/* id */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center bg-gray-50">{log.log_id}</div>
                    {/* 입고일 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{formatToKoreanTime(log.work_date, 'date')}</div>
                  {/* 모델명 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.model_name ?? '-'}</div>
                
                  {/* 부서 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.employee_department ?? '-'}</div>
                  {/* 사용자 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.employee_name ?? '-'}</div>
                  {/* 카테고리 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.category ?? '-'}</div>

                  {/* 문의내용 */}
                  <div className="px-2 py-4 text-sm text-gray-500 line-clamp-1 border-l border-gray-200"  title={log.question}>
                      {log.question ?? '-//'}
                      </div>
                  {/* 작업내용 */}
                    <div className="px-2 py-4 text-sm text-gray-500 line-clamp-1 border-l border-gray-200"  title={log.detailed_description}>
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
