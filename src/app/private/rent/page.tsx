import SupabaseService, { IPcManagementLog, IRentResultAsset } from "@/api/supabase/supabaseApi";
import { supabase } from "@/app/utils/supabase";
import Image from "next/image";

import Container from "../pc-inquiry/_components/Container";
import RentModal from "./_component/RentModal";
import { useState } from "react";
import RentPcInfo from "./_component/RentPcInfo";
import RentTypeNav from "./_component/RentTypeButton";
// 쿼리값을 매개변수로 받아오기
export default async function RentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {    
  const { type } = await searchParams;
  console.log(type,'rent_type');

  const getRentAssetResult = async () : Promise<IRentResultAsset[]> => {
    const supabaseService = SupabaseService.getInstance();
    const { success, error, data } = await supabaseService.selectWithRelations({
      table: 'rent_assets',
      columns: '*',
      relations: [
        { 
          table: 'pc_assets',
          columns: '*'  // 필요한 컬럼만 지정할 수도 있습니다 (예: 'asset_id,name,model')
        }
      ],
      // match: { is_rented: false },
      // 필요에 따라 추가 조건 설정
      match: { rent_type: type },
      order: { column: 'id', ascending: true },
    });
    if (success) {
      console.log(data,'임대 목록');
      return data;
    } else {
      console.error('Error fetching rent_assets:', error);
      return [];
    }
  }

  const rentResult = await getRentAssetResult();
  console.log(rentResult,'임대 목록');


  return (
    <>
    
    <Container title="임대 PC 목록" description="임대 PC 목록을 확인할 수 있습니다.">
    <div className="w-full">
      <div className="w-full flex flex-col "> 
          <RentTypeNav />
          {/* <RentTypeButton type="design">설계용</RentTypeButton> */}
          {/* <RentTypeButton type="other">기타</RentTypeButton> */}
        <div className="w-full flex flex-col gap-x-4">
          <RentPcInfo rentResultAsset={rentResult} />
        </div>
    </div>
    </div>
    </Container>
    </>
  );
}
