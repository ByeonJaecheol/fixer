import { getPcManagementLogWithId } from "@/api/supabase/supabaseTempApi";
import DetailPcInput from "../../../_components/input/DetailPcInput";

export default async function InDetailPage({ params }: { params: { id: string } }) {
    const gridStyle = {
       gridTemplateColumns: "8% 8% 8% 8% 12% 10% 5% 5% 5% 10% 30%"
      //  id,작업유형,pc타입,모델명,제조번호,상태,가동,횟수,용도,입고일,작업내용
      }
    // asset_id 에 대한 pc_asset 수정
    const { id } = await params;
    // const pcAsset = await getPcAsset(id);
    // console.log(pcAsset);

    const pcManagementLog = await getPcManagementLogWithId("pc_management_log","pc_assets","입고","log_id",false,id);
    console.log(pcManagementLog);
  return (
    <div>
        <DetailPcInput workType={"입고"} pcManagementLog={pcManagementLog} />
    </div>
        )
    }
    