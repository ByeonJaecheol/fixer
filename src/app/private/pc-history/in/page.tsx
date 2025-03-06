import SupabaseService from "@/api/supabase/supabaseApi";
import InputPcIn from "../_components/input/InputPcIn";
import { formatToKoreanTime } from "@/utils/utils";

interface IPcAsset {
  asset_id: number;
  brand: string;
  model_name: string;
  serial_number: string;
  pc_type: string;
  first_stock_date: string;
  manufacture_date: string;
}
export default async function AddPcHistory() {

  const getPcAsset = async () : Promise<IPcAsset[]> => {
    const supabaseService = SupabaseService.getInstance();
    // const pcAsset = await supabaseService.select({ table: "pc_assets",order: { column: "asset_id", ascending: false } });
    const pcAsset = await supabaseService.selectWithRelations({ table: "pc_assets",relations: [{ table: "pc_management_log", columns: "*" }],order: { column: "asset_id", ascending: false } });
    console.log(pcAsset,"pcAsset")
    return pcAsset.data;
  }
  const pcAsset = await getPcAsset();
  console.log(pcAsset,"pcAsset")
  return (
    <div>
        <InputPcIn workType={"입고"} />
        <div className="p-6">
      <div className="space-y-4">
        {/* 임시 데이터 테이블 */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">브랜드</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">모델명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시리얼번호</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PC타입</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">입고일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제조일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용여부</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용횟수</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용유형</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사업장</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자 소속</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사용자 이름</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* {pcAsset.map((asset) => (
              <tr key={asset.asset_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.asset_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.brand}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.model_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.serial_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.pc_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatToKoreanTime(asset.first_stock_date, 'date')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatToKoreanTime(asset.manufacture_date, 'month')}</td>
              </tr>
            ))} */}
            {/* 더 많은 행 추가 가능 */}
          </tbody>
        </table>
      </div>
    </div>
    </div>
  );
}
