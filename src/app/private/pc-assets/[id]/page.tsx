import { IAsManagementLog, IPcAsset, IPcManagementLog } from '@/api/supabase/supabaseApi'
import { createClient } from '@/app/utils/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import BasicList from '../../pc-history/_components/list/BasicList'
import DetailDescription from '../../pc-history/_components/list/DetailDescription'
import SecurityCode from '../../pc-history/_components/list/SecurityCode'
import UsageType from '../../pc-history/_components/list/UsageType'
import PcImage from '../_components/PcImage'


async function getPcAssetDetails(serialNumber: string) {
  try {
    const supabase = await createClient()
    
    // Promise.all을 사용하여 병렬로 데이터 조회
    const [assetResult] = await Promise.all([
      // PC 자산 정보 조회
      supabase
        .from('pc_assets')
        .select('*')
        .eq('serial_number', serialNumber)
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
    const pcLogsResult = await supabase
      .from('pc_management_log')
      .select('*')
      .eq('asset_id', assetResult.data.asset_id)
      .order('created_at', { ascending: false })
    // as_management_log 조회
    const asLogsResult = await supabase
      .from('as_management_log')
      .select('*')
      .eq('asset_id', assetResult.data.id)
      .order('created_at', { ascending: false })

    return {
      asset: assetResult.data as IPcAsset,
      pcLogs: pcLogsResult.data as IPcManagementLog[],
      asLogs: asLogsResult.data as IAsManagementLog[]
    }
  } catch (error) {
    console.error('데이터 조회 중 오류:', error)
    throw error
  }
}



export default async function PcAssetPage({
  params
}: {
  params: { id: string }
}) {
  const gridStyle = {
    gridTemplateColumns: "8% 8% 8% 8% 8% 8% 5% 8% 5% 25%"
    
   //  id,작업유형,pc타입,모델명,제조번호,상태,가동,횟수,용도,입고일,작업내용
   }
  try {
    const { asset, pcLogs, asLogs } = await getPcAssetDetails(params.id)
    console.log('asset', asset)
    console.log('pcLogs', pcLogs)
    console.log('asLogs', asLogs)

   

    return (
      <div className="container mx-auto px-4 py-8">
        {/* PC 자산 정보 섹션 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 이미지 영역 */}
            <div className="relative h-72 bg-gray-100 rounded-lg overflow-hidden">
                <PcImage brand={asset.brand} pcType={asset.pc_type} modelName={asset.model_name} />
           
            </div>
            {/* 상세 정보 테이블 */}
            <div className="overflow-hidden">
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(asset).map(([key, value]) => (
                    key !== 'image_url' && (
                      <tr key={key}>
                        <th className="px-4 py-2 bg-gray-50 text-left text-sm font-medium text-gray-500">
                          {/* 한글로 변환 */}
                          {key ==='asset_id'? '자산 ID' : key ==='brand'? '브랜드' : key ==='first_stock_date'? '최초 입고일' : key ==='is_disposed'? '폐기 여부' : key ==='pc_type' ? 'PC 타입' : key === 'model_name' ? '모델명' : key === 'manufacturer' ? '제조사' : key === 'serial_number' ? '시리얼 번호' : key === 'manufacture_date' ? '제조일자' : key === 'security_code' ? '보안 코드' : key}
                        </th>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </td>
                      </tr>
                    )
                  ))}
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
                      <h2 className="text-lg font-semibold text-gray-900">PC 관리 이력</h2>
                    </div>
        {/* 헤더 부분 */}
            <div className="grid bg-gray-50 border-b border-gray-200" style={gridStyle}>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업일</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업유형</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">코드번호</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">용도</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">사업장</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">부서</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</div>
              <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업내용</div>
            </div>
             {/* 데이터 행 */}
             {pcLogs.length > 0 ? (
              <> 
              {pcLogs.map((log: IPcManagementLog) => (
                <div 
                  key={log.log_id}
                  style={gridStyle}
                  className="grid border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                >
                  {/* ID,작성자,작업일,작업유형 */}
                <BasicList log={log} />
                <SecurityCode securityCode={log.security_code} />
                <UsageType usageType={log.usage_type} />
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{log.employee_workspace}</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{log.employee_department}</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{log.employee_name}</div>
                <DetailDescription description={log.detailed_description} />
               </div> 
              ))}
              </>
              ) : (
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  정비 이력이 없습니다.
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

