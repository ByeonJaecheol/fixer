import { getPcManagementLog, getPcManagementLogWithId } from "@/api/supabase/supabaseTempApi";
import DetailPcInput from "../../../_components/input/DetailPcInput";

export default async function InstallDetailPage({ params }: { params: { id: string } }) {
  const { id } = await params;
    const gridStyle = {
       gridTemplateColumns: "8% 8% 8% 8% 12% 10% 5% 5% 5% 10% 30%"
      //  id,작업유형,pc타입,모델명,제조번호,상태,가동,횟수,용도,입고일,작업내용
      }
    const pcManagementLog = await getPcManagementLogWithId("pc_management_log","pc_assets","설치","log_id",false,id);
    console.log(pcManagementLog);
  return (
    <div>
        <DetailPcInput workType={"설치"} pcManagementLog={pcManagementLog} />
    </div>
        )
    }
    