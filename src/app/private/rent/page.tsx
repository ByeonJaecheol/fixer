import SupabaseService, { IPcManagementLog } from "@/api/supabase/supabaseApi";
import { supabase } from "@/app/utils/supabase";
import Image from "next/image";
import Z4G5 from "../../../../public/pcImage/z4g5.png"
import HPG10 from "../../../../public/pcImage/hpg10.png"
import Container from "../pc-inquiry/_components/Container";

export default async function RentPage() {
  
  const getPcManagementLog = async () : Promise<IPcManagementLog[]> => {
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
      match: { usage_type: '임대' },
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
  console.log(pcManagementLog,'임대 목록');

  return (
    <Container title="임대 현황" description="임대 현황을 확인할 수 있습니다.">
    <div className="w-full">
      <div className="w-full flex flex-row "> 
        <div className="w-full flex flex-col gap-x-4">
          <div>
            <h2 className="text-2xl font-bold">대여 현황</h2>
          </div>
          <div className="w-full flex flex-row gap-x-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {pcManagementLog?.map((item: IPcManagementLog) => (
                <div 
                  key={item.log_id} 
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  {/* 이미지 섹션 */}
                  <div className="relative group flex items-center justify-center">
                    <Image 
                      src={item.pc_assets.pc_type === '데스크탑' ? Z4G5 : HPG10} 
                      alt="PC 이미지" 
                      width={160} 
                      height={160} 
                      className="w-40 h-40" 
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                        대여중
                      </span>
                    </div>
                  </div>

                  {/* 정보 섹션 */}
                  <div className="p-5">
                    {/* PC 정보 */}
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {item.pc_assets.brand} {item.pc_assets.model_name}
                      </h3>
                      <div className="space-y-2">
                        <div className="flex flex-col text-sm text-gray-600">
                          <div className="flex flex-row">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                            <span className="font-medium">대여기간</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="ml-">2025-03-11 ~ 2025-03-17</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 구분선 */}
                    <div className="border-t border-gray-200 my-4"></div>

                    {/* 대여자 정보 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                            <span className="text-sm font-medium text-gray-600">
                              {item.employee_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.employee_name}</p>
                            <p className="text-xs text-gray-500">{item.employee_department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{item.employee_workspace}</p>
                        </div>
                      </div>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="mt-5 flex gap-2">
                      <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200">
                        상세정보
                      </button>
                      <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200">
                        반납하기
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
    </div>
    </div>
    </Container>
  );
}
