import SupabaseService, { IAssetLog, IPcAsset } from "@/api/supabase/supabaseApi";

 // 제조 중복 체크 함수, 
export const checkSerialNumber = async (supabaseService:SupabaseService,serial?: string,) => {
    const { data: existingAsset, error: existingAssetError } = await supabaseService.select({
      table: 'pc_assets',
      columns: '*',
      match: { serial_number: serial },
      limit: 1
    });
    return existingAsset;
  }

// PC 자산 생성, 
export const createPcAsset = async (assetData : IPcAsset,isNew ?: boolean) => {
const supabaseService = SupabaseService.getInstance();
    const result = await supabaseService.insert({
        table: 'pc_assets',
        data: { 
        brand: assetData.brand, 
        model_name: assetData.model_name, 
        serial_number: assetData.serial_number, 
        pc_type: assetData.pc_type, 
        first_stock_date: assetData.first_stock_date,
        manufacture_date: assetData.manufacture_date,
        usage_count: isNew?0:1,
        }
    });
return result;
}

  // 보안코드로 로그 및 자산 정보 조회 함수
  export const fetchDataBySecurityCode = async (securityCode: string,setEmployeeWorkspace: (value: string) => void,setEmployeeDepartment: (value: string) => void,setEmployeeName: (value: string) => void,setModelName: (value: string) => void,setSerial: (value: string) => void) => {
    if (!securityCode.trim()) {
      alert('보안코드를 입력해주세요.');
      return;
    }
    
    try {
      // SupabaseService 인스턴스 가져오기
      const supabaseService = SupabaseService.getInstance();
      
      // selectWithRelations 함수를 사용하여 관계 데이터 함께 조회
      const { success, error, data } = await supabaseService.selectWithRelations({
        table: 'pc_management_log',
        columns: '*',
        relations: [
          { 
            table: 'pc_assets',
            columns: '*'  // 필요한 컬럼만 지정할 수도 있음
          }
        ],
        match: { security_code: securityCode },
        order: { column: 'created_at', ascending: false },
        limit: 1
      });
      
      console.log(`보안코드 ${securityCode} 조회 결과:`, success, data);
      
      if (!success || !data || data.length === 0) {
        alert('해당 보안코드의 자산을 찾을 수 없습니다.');
        return null;
      }
      
      // 조회된 데이터 (첫 번째 결과)
      const result: IAssetLog = data[0];
      
      // 폼 필드 자동 채우기
      setEmployeeWorkspace(result.employee_workspace ?? "-");
      setEmployeeDepartment(result.employee_department ?? "-");
      setEmployeeName(result.employee_name ?? "-");
      
      // pc_assets 관계 데이터 확인 및 설정
      if (result.pc_assets) {
        setModelName(result.pc_assets.model_name ?? "-");
        setSerial(result.pc_assets.serial_number ?? "-");
        
        // 추가 필드 설정 (필요에 따라)
        // setBrand(result.pc_assets.brand ?? "-");
        // setPcType(result.pc_assets.pc_type ?? "-");
        // setStatus(result.pc_assets.status ?? "-");
      } else {
        console.warn('PC 자산 정보가 없습니다.');
      }
      
      return result;
    } catch (error) {
      console.error('데이터 조회 중 오류 발생:', error);
      alert('데이터를 불러오는 중 오류가 발생했습니다.');
      return null;
    }
  };