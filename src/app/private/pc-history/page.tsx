
import { supabase } from '@/app/utils/supabase';



export default async function InventoryPage() {

  
  // fetchWorkHistory 함수 수정
  const fetchWorkHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("pc_assets")
        .select("*")
      console.log(data,"data---")
      if (error) {
        throw error;
      }

    } catch (error) {
      console.error("작업 내역을 불러오는 중 오류 발생:", error);
    } finally {
      console.log("fetchWorkHistory")
    }
  };

  const pcAsset = await fetchWorkHistory();

  
      
  
  
    
  console.log(pcAsset,"pcAsset")
  return (
    <div className="p-6">
    <div className="space-y-4">
      {/* 임시 데이터 테이블 */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구분</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">내용</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-03-14</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">H/W</td>
            <td className="px-6 py-4 text-sm text-gray-500">메모리 증설 요청</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">완료</span>
            </td>
          </tr>
          {/* 더 많은 행 추가 가능 */}
        </tbody>
      </table>
    </div>
  </div>
  );
}
