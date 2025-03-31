
import SupabaseService, { IPcManagementLog } from '@/api/supabase/supabaseApi';
import { supabase } from '@/app/utils/supabase';
import { formatToKoreanTime, truncateDescription } from '@/utils/utils';
import SecurityCode from './_components/list/SecurityCode';
import BasicList from './_components/list/BasicList';
import PcType from './_components/list/PcType';
import ModelName from './_components/list/ModelName';
import UsageType from './_components/list/UsageType';
import DetailDescription from './_components/list/DetailDescription';
import SerialNumber from './_components/list/SerialNumber';
import Link from 'next/link';



export default async function PcHistoryPage() {
  const gridStyle = {
    gridTemplateColumns: "8% 8% 8% 8% 5% 8% 8% 8% 8% 25%"
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
      order: { column: 'created_at', ascending: false }
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
            <div className="grid bg-gray-50 border-b border-gray-200" style={gridStyle}>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업일</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업유형</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PC타입</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">모델명</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">제조번호</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">코드번호</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">용도</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업내용</div>
            </div>
              {/* 데이터 행 */}
              {pcManagementLog.map((log: IPcManagementLog) => (
                <div 
                  key={log.log_id}
                  style={gridStyle}
                  className="grid border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                >
                <BasicList log={log} />
                <PcType pcType={log.pc_assets.pc_type} />
                <ModelName modelName={log.pc_assets.model_name} />
                <SerialNumber serialNumber={log.pc_assets.serial_number} />
                <SecurityCode securityCode={log.security_code} />
                <UsageType usageType={log.usage_type} />
                <Link href={`/private/pc-history/${log.work_type==="입고"?"in":log.work_type==="설치"?"install":log.work_type==="폐기"?"disposal":log.work_type==="반납"?"return":log.work_type==="변경"?"change":"other"}/detail/${log.log_id}`}>
                  <DetailDescription description={log.detailed_description} />
                </Link>
               </div> 
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}
