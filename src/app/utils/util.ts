import SupabaseService, { IAssetLog, IPcAsset } from "@/api/supabase/supabaseApi";
import { EmployeeData } from "../private/_components/EmployeesSelectModal";

 // 제조 중복 체크 함수, 
//  pc_assets 테이블에서 제조 번호가 일치하는 자산 조회 후 일치하는 자산 리턴
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


  // 사원명으로 사원 정보 조회 함수
  export const fetchEmployeeDataByName = async (employeeName: string) => {
    const supabaseService = SupabaseService.getInstance();
    const { data, error } = await supabaseService.select({
      table: 'employees_data',
      columns: '*',
      match: { 이름 : employeeName },
    });
    // 아이뒤, 이름, 부서 가 모두 동일할 경우 중복 제거
    const uniqueData = data.filter((item:EmployeeData, index:number, self:EmployeeData[]) =>
      index === self.findIndex((t:EmployeeData) => t.아이뒤 === item.아이뒤 && t.이름 === item.이름 && t.부서 === item.부서)    
    );
    return uniqueData;
  }


  /**
   * 제조일자를 기반으로 보안 코드를 생성합니다.
   * YYYY-MM 형식의 날짜를 받아 XNYN 형식의 코드를 반환합니다.
   * X: 연도 세번째 자리를 알파벳으로 변환 (0=A, 1=B, 2=C...)
   * N: 원래 숫자 그대로 사용
   * Y: 월의 첫번째 자리를 알파벳으로 변환 (0=A, 1=B...)
   * 
   * 예시:
   * 2024-01 => C4A1 (2[C]4[A]1)
   * 2018-06 => B1A6 (1[B]8[A]6)
   * 2019-11 => B1B1 (1[B]9[B]1)
   * 
   * @param manufactureDate YYYY-MM 형식의 제조일자
   * @returns 생성된 보안 코드
   */
  export const generateSecurityCode = (manufactureDate: string): string => {
    // 날짜가 없는 경우 빈 문자열 반환
    if (!manufactureDate) return '';

    const [year, month] = manufactureDate.split('-');
    
    // 연도의 세번째 자리 숫자를 알파벳으로 변환 (0=A, 1=B, 2=C...)
    const thirdDigitYear = parseInt(year[2]);
    const yearAlphabet = String.fromCharCode(65 + thirdDigitYear); // 65는 'A'의 ASCII 코드

    // 월의 첫번째 자리 숫자를 알파벳으로 변환 (0=A, 1=B...)
    const firstDigitMonth = parseInt(month[0]);
    const monthAlphabet = String.fromCharCode(65 + firstDigitMonth);

    // 최종 코드 생성: [연도알파벳][연도마지막자리][월알파벳][월마지막자리]
    const securityCode = `${yearAlphabet}${year[3]}${monthAlphabet}${month[1]}`;

    return securityCode;
  }

  // 테스트 코드
  const testDates = [
    '2024-01', // 예상: C4A1
    '2018-06', // 예상: B1A6
    '2019-11', // 예상: B1B1
  ];

  testDates.forEach(date => {
    console.log(`${date} => ${generateSecurityCode(date)}`);
  });

