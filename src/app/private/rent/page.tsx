import SupabaseService, { IPcManagementLog, IRentResultAsset } from "@/api/supabase/supabaseApi";
import { supabase } from "@/app/utils/supabase";
import Image from "next/image";

import Container from "../pc-inquiry/_components/Container";
import RentModal from "./_component/RentModal";
import { useState } from "react";
import RentPcInfo from "./_component/RentPcInfo";

export default async function RentPage() {
  
  const getRentResultAsset = async () : Promise<IRentResultAsset[]> => {
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
      // match: { some_column: 'some_value' }
      order: { column: 'id', ascending: true },
    });
    if (success) {
      return data;
    } else {
      console.error('Error fetching rent_assets:', error);
      return [];
    }
  }

  const rentResultAsset = await getRentResultAsset();
  console.log(rentResultAsset,'임대 목록');

  return (
    <>
    
    <Container title="임대 PC 목록" description="임대 PC 목록을 확인할 수 있습니다.">
    <div className="w-full">
      <div className="w-full flex flex-row "> 
        <div className="w-full flex flex-col gap-x-4">
          <div>
            <h2 className="text-2xl font-bold">임대 PC 목록</h2>
          </div>
          <RentPcInfo rentResultAsset={rentResultAsset} />
        </div>
    </div>
    </div>
    </Container>
    </>
  );
}
