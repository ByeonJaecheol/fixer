import { IPcManagementLog } from "@/api/supabase/supabaseApi";
import { formatToKoreanTime } from "@/utils/utils";

export default function BasicList({log}: {log: IPcManagementLog}) {
  return (
    <>
           {/* id */}
           <div className="px-2 py-4 text-sm  text-gray-500 text-center bg-gray-50">{log.log_id === null ? "-" : log.log_id}</div>
                {/* 작성자 */}
                  <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.created_by === null ? "-" : log.created_by.split("@")[0]}</div>
                {/* 입고일 */}
                  <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.work_date === null ? "-" : formatToKoreanTime(log.work_date, 'date')}</div>
                {/* 작업유형 */}
                  <div className="px-2 py-4 text-sm text-gray-500 text-center">
                    {/* work_type 에 따라 색상 변경 */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${log.work_type === "입고" ? "bg-blue-100 text-blue-800" : 
                        log.work_type === "설치" ? "bg-orange-100 text-orange-800" : 
                        log.work_type === "반납" ? "bg-green-100 text-green-800" : 
                        log.work_type === "폐기" ? "bg-red-100 text-red-800" : 
                        "bg-gray-100 text-gray-800"}`}>
                      {log.work_type === null ? "-" : log.work_type}
                    </span>
            </div>
    </>
  );
}
