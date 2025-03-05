import { ComputerDesktopIcon,PlusIcon,ArrowPathIcon, XMarkIcon,ArrowUturnDownIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import Container from '@/app/_components/Container';
import { supabase } from '@/app/utils/supabase';
import InputPcIn from './_components/input/InputPcIn';

const categories = [
  {
    id: 'all',
    name: '전체보기',
    icon: ViewColumnsIcon,
    color: 'text-gray-600'
  },
  {
    id: 'pc-in',
    name: 'PC입고',
    icon: PlusIcon,
    color: 'text-green-600'
  },
  {
    id: 'pc-new-install',
    name: 'PC신규설치',
    icon: ComputerDesktopIcon,
    color: 'text-blue-600'
  },
  {
    id: 'pc-replace',
    name: 'PC교체',
    icon: ArrowPathIcon,
    color: 'text-blue-600'
  },
  {
    id: 'pc-return',
    name: 'PC반납',
    icon: ArrowUturnDownIcon,
    color: 'text-blue-600'
  },
  {
    id: 'pc-disposal',
    name: 'PC폐기',
    icon: XMarkIcon,
    color: 'text-red-600'
  },
  
];



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
    <Container title="이력관리" description="카테고리별 이력을 확인하실 수 있습니다.">
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              className="group flex-shrink-0 flex flex-col items-center px-6 py-4 border-b-2 border-transparent hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
            >
              <div className={`p-3 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors duration-200`}>
                <category.icon className={`w-6 h-6 ${category.color} group-hover:text-blue-600`} />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">
                {category.name}
              </span>
            </button>
          ))}
        </div>
        {/* {pcHistory?.map((pc) => (
          <div key={pc.id}>
            {pc.pc_type}
            {pc.pc_model}
            {pc.pc_serial}
            {pc.pc_status}
            {pc.created_at}
            {pc.received_at}
          </div>
        ))} */}
        {/* 입력폼 */}
        {/* <div className="max-w-7xl mx-auto space-y-4 p-4"> */}
              <InputPcIn />
        {/* </div> */}
        {/* <InputHistory /> */}
        {/* 컨텐츠 영역 */}
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
      </div>
    </Container>
  );
}
