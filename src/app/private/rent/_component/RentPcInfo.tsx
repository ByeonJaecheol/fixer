'use client';
import SupabaseService, { IRentResultAsset } from "@/api/supabase/supabaseApi";
import Image from "next/image";
import HP from "../../../../../public/pcImage/G5.jpg"
import LG from "../../../../../public/pcImage/LG.jpg"
import { useState } from "react";
import RentModal from "./RentModal";
import { useRouter } from "next/navigation";
export default function RentPcInfo({ rentResultAsset }: { rentResultAsset: IRentResultAsset[] }) {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const UpdateIsRented = async (asset_id: number) => {
        const supabaseService = SupabaseService.getInstance();
        const result = await supabaseService.update({
            table: 'rent_assets',
            data: { 
                is_rented: false,
                rent_end_date: new Date().toISOString().split('T')[0],
                return_date: new Date().toISOString().split('T')[0],
                rent_reason: rentResultAsset[0].rent_reason,
                employee_name: rentResultAsset[0].employee_name,
                employee_department: rentResultAsset[0].employee_department,
                employee_workspace: rentResultAsset[0].employee_workspace
             },
            match: { asset_id: asset_id }
        });
        if(result.success){  
            const rentLogResult = await supabaseService.insert({
                table: 'rent_management_log',
                data: {
                    rent_id: rentResultAsset[0].id,
                    rent_type: '반납',
                    rent_start_date: rentResultAsset[0].rent_start_date,
                    rent_end_date: new Date().toISOString().split('T')[0],
                    rent_reason: rentResultAsset[0].rent_reason,
                    employee_name: rentResultAsset[0].employee_name,
                    employee_department: rentResultAsset[0].employee_department,
                    employee_workspace: rentResultAsset[0].employee_workspace
                }
            });
            if(rentLogResult.success){
                alert('반납 신청 성공');
                router.replace('/private/rent');
            }else{
                alert('반납 신청 실패');
            }
        }else{
            alert('반납 신청 실패');
        }
    }

    const getRentPcInfo = async (rent_id: number) => {
        const supabaseService = SupabaseService.getInstance();
        const result = await supabaseService.select({
            table: 'rent_management_log',
            columns: '*',
            match: { rent_id: rent_id }
        });
        return result.data;
    }
  return (
    <div className="w-full flex flex-row gap-x-4">
     <RentModal rentResultAsset={rentResultAsset} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 p-6">
      {rentResultAsset?.map((item: IRentResultAsset) => (
        <div 
          key={item.id} 
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
        >
          {/* 이미지 섹션 */}
          <div className="relative group flex items-center justify-center">
            <Image 
              src={item.pc_assets.brand === 'HP' ? HP : LG} 
              alt="PC 이미지" 
              width={160} 
              height={160} 
              className="w-40 h-40" 
            />
            <div className="absolute top-2 right-3">
            {item.is_rented ? (
              <span className="px-3 py-1 bg-blue-500 text-white text-sm font-medium rounded-full">
                대여중
              </span>
            ) : (
              <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full">
                대여가능
              </span>
            )}  
            </div>
          </div>

          {/* 정보 섹션 */}
          <div className="p-2">
            {/* PC 정보 */}
            <div className="mb-2">
              <h3 className="text-base font-bold text-gray-900 text-right px-2">
                {item.rent_type} {item.rent_name}
              </h3>
              
              <div className="space-y-2 px-2">
                <div className="flex flex-col text-sm text-gray-600">
                  <div className="flex flex-row">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                    <span className="font-medium text-xs">대여기간</span>
                  </div>
                  {item.is_rented ? (
                    <div className="flex flex-col">
                      <span className="ml-2text-xs text-right">{item.rent_start_date} ~ {item.return_date.slice(5,10)}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="ml-2 text-xs text-right">대여준비중</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 구분선 */}
            {/* <div className="border-t border-gray-200 my-4"></div> */}

            {/* 대여자 정보 */}
            {/* <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                    <span className="text-sm font-medium text-gray-600">
                      {item.pc_assets.brand?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.pc_assets.model_name}</p>
                    <p className="text-xs text-gray-500">{item.pc_assets.pc_type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{item.pc_assets.pc_type}</p>
                </div>
              </div>
            </div> */}

            {/* 버튼 영역 */}
            <div className="mt-5 flex gap-2">
              {item.is_rented ? (
                <>
                <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200" onClick={() => UpdateIsRented(item.pc_assets.asset_id)}  >
                반납
              </button>
              </>
              ) : (
                <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200" onClick={() => setIsModalOpen(true)}>
                신청
              </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
}

