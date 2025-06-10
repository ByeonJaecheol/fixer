'use client';
import SupabaseService, { IRentResultAsset } from "@/api/supabase/supabaseApi";
import Image from "next/image";
import HP from "../../../../../public/pcImage/G5.jpg"
import LG from "../../../../../public/pcImage/LG.jpg"
import { useState } from "react";
import RentModal from "./RentModal";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function RentPcInfo({ rentResultAsset }: { rentResultAsset: IRentResultAsset[] }) {
    const router = useRouter();
    const [rentId, setRentId] = useState<number>(0);
    const [rentType, setRentType] = useState<string>('');
    const [rentName, setRentName] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const UpdateIsRented = async (rent_id: number) => {
      console.log('RentPcInfo - 반납 - rent_id ',rent_id);
        const supabaseService = SupabaseService.getInstance();
        // asset_id 에 해당하는 데이터를 조회
        const rentAssetResultData = await supabaseService.select({
            table: 'rent_assets',
            columns: '*',
            match: { id: rent_id }
        });
        // console.log('RentPcInfo - 반납 - rentAssetResult ',rentAssetResultData);
        if(rentAssetResultData.success){
            const selectedAsset = rentAssetResultData.data[0];
            const result = await supabaseService.update({
              table: 'rent_assets',
              data: { 
                  is_rented: false,
                  rent_end_date: new Date().toISOString().split('T')[0],
                  return_date: new Date().toISOString().split('T')[0],
                  rent_reason: selectedAsset.asset_id,
                  employee_name: selectedAsset.employee_name,
                  employee_department: selectedAsset.employee_department,
                  employee_workspace: selectedAsset.employee_workspace
               },
              match: { id: rent_id }
          });
          if(result.success){  
            console.log('RentPcInfo - 반납 - rentResultAsset ',rentAssetResultData.data[0]);
              const rentLogResult = await supabaseService.insert({
                  table: 'rent_management_log',
                  data: {
                      rent_id: rentAssetResultData.data[0].id,
                      rent_type: '반납',
                      rent_start_date: rentAssetResultData.data[0].rent_start_date,
                      rent_end_date: new Date().toISOString().split('T')[0],
                      rent_reason: rentAssetResultData.data[0].rent_reason,
                      employee_name: rentAssetResultData.data[0].employee_name,
                      employee_department: rentAssetResultData.data[0].employee_department,
                      employee_workspace: rentAssetResultData.data[0].employee_workspace
                  }
              });
              if(rentLogResult.success){
                  alert('반납 신청 성공');
                  router.refresh();
              }else{
                  alert('반납 신청 실패');
              }
          }else{
              alert('반납 신청 실패');
          }

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

  if(rentResultAsset.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center h-96">
        <h1 className="text-2xl font-bold">등록된 PC가 없습니다.</h1>
        {/* 뒤로가기 */}
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200" onClick={() => router.back()}>
          뒤로가기
        </button>
      </div>
    )
  }
  return (
    <div className="w-full flex flex-row gap-x-4">
      <RentModal id={rentId} rentType={rentType} rentName={rentName} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 p-6">
      {rentResultAsset?.map((item: IRentResultAsset) => (
        <div 
        key={item.id} 
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
        >
          {/* 이미지 섹션 */}
          <div className="relative group flex items-center justify-center">
            <Link href={`/private/rent/detail/${item.id}`} className="cursor-pointer">
              {/* 마우스 호버 상태일때만 이미지 위에 '이력보기' 표시 */}
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"> 
                <span className="text-white bg-black/50 px-2 py-1 rounded-md text-sm font-medium">이력보기</span>
              </div>  
              {item.pc_assets?.brand === 'HP' ? (
                <Image 
                  src={HP} 
                  alt="PC 이미지" 
                  width={160} 
                  height={160} 
                  className="w-40 h-40" 
                />
              ) : (
                <Image 
                  src={LG} 
                alt="PC 이미지" 
                width={160} 
                height={160} 
                className="w-40 h-40" 
              />
              )}
            </Link>
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
                <button className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors duration-200" onClick={() =>{console.log(item.id); UpdateIsRented(item.id)}}  >
                반납
              </button>
              </>
              ) : (
                <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors duration-200" onClick={() => {setRentId(item.id); setRentType(item.rent_type); setRentName(item.rent_name); setIsModalOpen(true)}}>
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

