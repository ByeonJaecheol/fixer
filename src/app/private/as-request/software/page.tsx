import { formatToKoreanTime } from "@/utils/utils";
import { getPcManagementLog } from "@/api/supabase/supabaseTempApi";
import Link from "next/link";
import { IAssetLog } from "@/api/supabase/supabaseApi";
import AsLogInput from "../_components/AsLogInput";


export default async function SoftwarePage() {
    const gridStyle = {
       gridTemplateColumns: "8% 8% 8% 8% 12% 12% 5% 5%  35%"
      //  id,작업유형,pc타입,모델명,제조번호,상태,가동,횟수,용도,입고일,작업내용
      }
    const pcManagementLog = await getPcManagementLog("pc_management_log","pc_assets","설치","log_id",false);

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
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">출고일</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업유형</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PC타입</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">모델명</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">제조번호</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">횟수</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">용도</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업내용</div>
              </div>
                {/* 데이터 행 */}
                {pcManagementLog.map((log: IAssetLog) => (
                  <Link 
                    href={`/private/pc-history/install/detail/${log.log_id}`}
                    key={log.log_id}
                    style={gridStyle}
                    className="grid border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                  >
                  {/* id */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center bg-gray-50">{log.log_id}</div>
                    {/* 입고일 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{formatToKoreanTime(log.work_date, 'date')}</div>
                  {/* 작업유형 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                  {/* 제조번호 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.pc_assets.serial_number}</div>
                
                  {/* 횟수 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.pc_assets.usage_count ?? '-'}</div>
                  {/* 용도 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.usage_type ?? '-'}</div>
                  
                  {/* 작업내용 */}
                    <div className="px-2 py-4 text-sm text-gray-500 line-clamp-1 border-l border-gray-200" title={log.detailed_description}>
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
