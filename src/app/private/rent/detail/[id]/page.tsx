import { IAsManagementLog, IPcAsset, IPcManagementLog, IRentAsset, IRentManagementLog } from '@/api/supabase/supabaseApi'
import PcImage from '@/app/private/pc-assets/_components/PcImage'
import BasicList from '@/app/private/pc-history/_components/list/BasicList'
import UsageType from '@/app/private/pc-history/_components/list/UsageType'
import SecurityCode from '@/app/private/pc-history/_components/list/SecurityCode'
import { createClient } from '@/app/utils/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import DetailDescription from '@/app/private/pc-history/_components/list/DetailDescription'
import { formatToKoreanTime } from '@/utils/utils'
import HPG5 from '../../../../../../public/pcImage/G5.jpg'
import LG from '../../../../../../public/pcImage/LG.jpg'

async function getPcAssetDetails(id: string) {
  try {
    const supabase = await createClient()
    
    // Promise.all을 사용하여 병렬로 데이터 조회
    const [assetResult] = await Promise.all([
      // PC 자산 정보 조회
      supabase
        .from('rent_assets')
        .select('*')
        .eq('id', id)
        .single(),
    ])

    // 에러 체크
    if (assetResult.error) throw assetResult.error
    // if (pcLogsResult.error) throw pcLogsResult.error
    // if (asLogsResult.error) throw asLogsResult.error

    // 자산이 없는 경우
    if (!assetResult.data) {
      return notFound()
    }
    console.log('assetResult.data', assetResult.data)
    // pc_management_log 조회
    const rentLogsResult = await supabase
      .from('rent_management_log')
      .select('*')
      .eq('rent_id', assetResult.data.id)
      .order('created_at', { ascending: false })
    // as_management_log 조회
    const rentAsLogsResult = await supabase
      .from('rent_as_management_log')
      .select('*')
      .eq('rent_id', assetResult.data.id)
      .order('created_at', { ascending: false })

    return {
      asset: assetResult.data as IRentAsset,
      rentLogs: rentLogsResult.data as IRentManagementLog[],
      rentAsLogs: rentAsLogsResult.data as IAsManagementLog[]
    }
  } catch (error) {
    console.error('데이터 조회 중 오류:', error)
    throw error
  }
}



export default async function RentAssetPage({
  params
}: {
  params: { id: string }
}) {
  const gridStyle = {
    gridTemplateColumns: "8% 8% 8% 8% 8% 8% 8% 8% 25%"
    
   //  id,작업유형,pc타입,모델명,제조번호,상태,가동,횟수,용도,입고일,작업내용
   }
  try {
    const { asset: RentAsset, rentLogs: RentLogs, rentAsLogs: RentAsLogs } = await getPcAssetDetails(params.id)
    console.log('RentAsset', RentAsset)
    console.log('RentLogs', RentLogs)

   

    return (
      <div className="container mx-auto px-4 py-8">
        {/* PC 자산 정보 섹션 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 이미지 영역 */}
            <div className="relative h-72 bg-gray-100 rounded-lg overflow-hidden">
                {/* <PcImage brand={RentAsset.brand} pcType={RentAsset.pc_type} modelName={RentAsset.model_name} /> */}
                <Image src={RentAsset.rent_type ==="설계용" ? HPG5 : LG} alt="PC 이미지" fill className="object-contain w-20 h-20"  />
           
            </div>
            {/* 상세 정보 테이블 */}
            <div className="overflow-hidden">
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-200">
                <tr className="bg-gray-100">
                    <td colSpan={2} className="px-4 py-2 text-sm font-medium text-gray-500">PC 정보</td>
                  </tr>
                  {/* 필드를 논리적인 순서로 정의하고 그룹화 */}
                  {renderFieldGroup(RentAsset, [
                    // 기본 정보 그룹
                    { field: 'id', label: '대여 ID' },
                    { field: 'rent_name', label: '대여PC명' },
                    { field: 'rent_type', label: '타입' },
                    { field: 'asset_id', label: '자산 ID' },
                    { field: 'rent_id', label: '대여 ID' },
                    { field: 'host', label: '라이센스' },
                    // { field: 'is_rented', label: '대여 여부' },
                  ])}
                  
                
                  
                  {renderFieldGroup(RentAsset, [
                    // PC 정보 그룹
                    { field: 'model_name', label: '모델명' },
                    { field: 'manufacturer', label: '제조사' },
                    { field: 'brand', label: '브랜드' },
                    { field: 'pc_type', label: 'PC 타입' },
                    { field: 'serial_number', label: '시리얼 번호' },
                    { field: 'manufacture_date', label: '제조일자' },
                    { field: 'first_stock_date', label: '최초 입고일' },
                  ])}
                  
                  <tr className="bg-gray-100">
                    <td colSpan={2} className="px-4 py-2 text-sm font-medium text-gray-500">대여 정보</td>
                  </tr>
                  
                  {renderFieldGroup(RentAsset, [
                    // 대여 정보 그룹
                    { field: 'rent_start_date', label: '대여일' },
                    { field: 'return_date', label: '반납예정일' },
                    { field: 'rent_end_date', label: '반납일' },
                  ])}
                  <tr className="bg-gray-100">
                    <td colSpan={2} className="px-4 py-2 text-sm font-medium text-gray-500">마지막 사용자 정보</td>
                  </tr>
                  {renderFieldGroup(RentAsset, [
                    // 대여 정보 그룹
                    { field: 'employee_workspace', label: '사업장' },
                    { field: 'employee_department', label: '사용 부서' },
                    { field: 'employee_name', label: '사용자' },
                    { field: 'requester', label: '의뢰인' },
                    { field: 'rent_reason', label: '대여사유' },
                  ])}
                  
                  {/* <tr className="bg-gray-100">
                    <td colSpan={2} className="px-4 py-2 text-sm font-medium text-gray-500">관리 정보</td>
                  </tr>
                  
                  {renderFieldGroup(RentAsset, [
                    // 관리 정보 그룹
                    { field: 'creat_at', label: '등록일' },
                    { field: 'is_disposed', label: '폐기 여부' },
                  ])} */}
                </tbody>
              </table>
            </div>
            
       
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                  <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">PC 대여 이력</h2>
                    </div>
        {/* 헤더 부분 */}
            <div className="grid bg-gray-50 border-b border-gray-200" style={gridStyle}>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">대여유형</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">대여일</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">반납예정일</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">반납일</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">부서</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">의뢰인</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">대여사유</div>
            </div>
             {/* 데이터 행 */}
             {RentLogs.length > 0 ? (
              <> 
              {RentLogs.map((log: IRentManagementLog) => (
                <div 
                  key={log.id}
                  style={gridStyle}
                  className="grid border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* ID,작성자,작업일,작업유형 */}
                  <div className="px-2 py-4 text-sm  text-gray-500 text-center bg-gray-50">{log.id === null ? "-" : log.id}</div>
                {/* 작성자 */}
                  {/* <div className="px-2 py-4 text-sm text-gray-500 text-center">{log. === null ? "-" : log.employee_name}</div> */}
                {/* 작업유형 */}
                  <div className="px-2 py-4 text-sm text-gray-500 text-center">
                        {/* work_type 에 따라 색상 변경 */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${log.rent_type === "대여" ? "bg-blue-100 text-blue-800" : 
                            log.rent_type === "반납" ? "bg-green-100 text-green-800" : 
                            "bg-gray-100 text-gray-800"}`}>
                        {log.rent_type === null ? "-" : log.rent_type}
                        </span>
                   </div>
                {/* 대여일 */}
                  <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.rent_start_date === null ? "-" : formatToKoreanTime(log.rent_start_date, 'date')}</div>
                {/* 반납예정일 */}
                  <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.return_date === null ? "-" : formatToKoreanTime(log.return_date, 'date')}</div>
                {/* 반납일 */}
                  <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.rent_end_date === null ? "-" : formatToKoreanTime(log.rent_end_date, 'date')}</div>
                    {/* 부서 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.employee_department === null ? "-" : log.employee_department}</div>
                    {/* 사용자 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.employee_name === null ? "-" : log.employee_name}</div>
                    {/* 의뢰인 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.requester === null ? "-" : log.requester}</div>
                    {/* 대여사유 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.rent_reason === null ? "-" : log.rent_reason}</div>
                {/* <SecurityCode securityCode={log.security_code} /> */}
                {/* <UsageType usageType={log.usage_type} />
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{log.employee_workspace}</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{log.employee_department}</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{log.employee_name}</div>
                <DetailDescription description={log.detailed_description} /> */}
               </div> 
              ))}
              </>
              ) : (
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  대여 이력이 없습니다.
                </div>
              )}

              </div>
          </div>
        </div>
      </div>

      </div>
    )
  } catch (error) {
    console.error('페이지 렌더링 중 오류:', error)
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                데이터를 불러오는 중 오류가 발생했습니다
              </h3>
              <div className="mt-2 text-sm text-red-700">
                잠시 후 다시 시도해주세요.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

// 필드 그룹 렌더링 함수
function renderFieldGroup(data: any, fields: any) {
  return fields.map(({ field, label }: { field: string, label: string }) => {
    const value = data[field];
    
    // 값이 없거나 image_url인 경우 렌더링하지 않음
    if (value === undefined || field === 'image_url') {
      return null;
    }
    
    return (
      <tr key={field}>
        <th className="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-500">
          {label}
        </th>
        <td className="px-4 py-2 text-sm text-gray-900">
          {Array.isArray(value) ? value.join(', ') : value}
        </td>
      </tr>
    );
  }).filter(Boolean);
}

