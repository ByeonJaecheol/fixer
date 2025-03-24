
import SupabaseService, { IAssetLog, IHardWareLog } from '@/api/supabase/supabaseApi';
import { supabase } from '@/app/utils/supabase';
import { formatToKoreanTime, truncateDescription } from '@/utils/utils';
import Link from 'next/link';



export default async function AsRequestPage() {
  const gridStyle = {
    gridTemplateColumns: "8% 8% 8% 8% 8% 10% 5%  15% 30%"
  }

  
  const getPcManagementLog = async () : Promise<any> => {
    const supabaseService = SupabaseService.getInstance();
    const { success, error, data } = await supabaseService.selectWithRelations({
      table: 'as_management_log',
      columns: '*',
      
      // 필요에 따라 추가 조건 설정
      // match: { some_column: 'some_value' }
      order: { column: 'created_at', ascending: false }
    });
    if (success) {
      return data;
    } else {
      console.error('Error fetching pc_management_log:', error);
      return [];
    }
  }
  const asManagementLog = await getPcManagementLog();

  return (
    <div className="p-6">
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* 헤더 부분 */}
          <div className="grid border-b border-gray-200" style={gridStyle}>
          <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</div>
          <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</div>
          <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업유형</div>
            <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업일</div>
            <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">모델명</div>
            <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">부서</div>
            <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</div>
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
                {/* 작성자 */}
                <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.created_by?log.created_by.split("@")[0]:"-"}</div>
                {/* 입고일 */}
                <div className="px-2 py-4 text-sm text-gray-500 text-center">{formatToKoreanTime(log.work_date, 'date')}</div>
                 {/* 작업유형 */}
                 <div className="px-2 py-4 text-sm text-gray-500 text-center">
                    {/* work_type 에 따라 색상 변경 */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${log.work_type === "H/W" ? "bg-blue-100 text-blue-800" : 
                        log.work_type === "S/W" ? "bg-orange-100 text-orange-800" : 
                        log.work_type === "네트워크" ? "bg-green-100 text-green-800" : 
                        log.work_type === "장비관리" ? "bg-purple-100 text-purple-800" : 
                        "bg-gray-100 text-gray-800"}`}>
                      {log.work_type}
                    </span>
                  </div>
              {/* 모델명 */}
                <div className="px-2 py-4 text-sm text-gray-500 text-center">
                {truncateDescription(log.model_name,9)}
                </div>
            
              {/* 부서 */}
                <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.employee_department ?? '-'}</div>
              {/* 사용자 */}
                <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.employee_name ?? '-'}</div>

              {/* 문의내용 */}
              <div className="px-2 py-4 text-sm text-gray-500 border-l border-gray-200"  title={log.question}>
                {truncateDescription(log.question,30)}
              </div>
              {/* 작업내용 */}
                <div className="px-2 py-4 text-sm text-gray-500 overflow-hidden border-l border-gray-200"  title={log.detailed_description}>
                  {truncateDescription(log.detailed_description,30)}
                </div>
              </Link>
            ))}
          </div>
        </div>
    </div>
  </div>
</div>
  );
}
