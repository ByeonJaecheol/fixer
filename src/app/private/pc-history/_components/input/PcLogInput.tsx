'use client'
import CommonInputOnChange from "@/app/_components/common/input/CommonInputOnChange";
import InputDateLegacy from "@/app/_components/log/InputDateLegacy";
import InputModelName from "@/app/_components/log/InputModelName";
import InputPcType from "@/app/_components/log/InputPcType";
import InputSerial from "@/app/_components/log/InputSerial";
import { useEffect, useRef, useState } from "react";
import OkButton from "@/app/_components/common/input/button/OkButton";
import SupabaseService, { IPcManagementLog } from "@/api/supabase/supabaseApi";
import InputDate from "@/app/_components/log/InputDate";
import { usePathname, useRouter } from "next/navigation";
import InputLog from "@/app/_components/log/new/InputLog";
import InputDropDown from "@/app/_components/log/new/InputDropDown";
import { PC_AVAILABLE_TYPE_OPTIONS, PC_BRAND_OPTIONS, PC_HP_DESKTOP_MODEL_OPTIONS, PC_HP_NOTEBOOK_MODEL_OPTIONS, PC_INSTALL_STATUS_OPTIONS, PC_INSTALL_TYPE_OPTIONS, PC_LG_DESKTOP_MODEL_OPTIONS, PC_LG_NOTEBOOK_MODEL_OPTIONS, PC_LOCATION_TYPE_OPTIONS, PC_SAMSUNG_DESKTOP_MODEL_OPTIONS, PC_SAMSUNG_NOTEBOOK_MODEL_OPTIONS, PC_STATUS_OPTIONS, PC_TYPE_OPTIONS, PC_USAGE_TYPE_OPTIONS } from "@/app/constants/objects";
import InputTextArea from "@/app/_components/log/new/InputTextArea";
import InputToggle from "@/app/_components/log/new/InputToggle";
import CommonRadio from "@/app/_components/common/input/CommonRadio";
import { checkSerialNumber, fetchEmployeeDataByName, generateSecurityCode } from "@/app/utils/util";
import { useUser } from "@/context/UserContext";
import EmployeesSelectModal, { EmployeeData } from "@/app/private/_components/EmployeesSelectModal";



export default function PcLogInput({workType}:{workType:string}) {
  const { user } = useUser();
  const createdBy = user?.email;
  // pc 자산 정보
  const [pcType, setPcType] = useState<string>(PC_TYPE_OPTIONS[0].value);
  const [brand, setBrand] = useState<string>(PC_BRAND_OPTIONS[0].value);
  const [modelName, setModelName] = useState<string>("");  
  const [serial, setSerial] = useState<string|undefined>(undefined);
  const [securityCode, setSecurityCode] = useState<string|undefined>(undefined);
  const [firstStockDate, setFirstStockDate] = useState<string|undefined>(undefined);
  // 제조일자 초기값 세팅 yyyy-mm 타입, mm은 01월로 세팅 
  const [manufactureDate, setManufactureDate] = useState<string|undefined>(undefined);
  const [isNew, setIsNew] = useState<boolean>(false);
  // 관리 로그 정보
  const [workDate, setWorkDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [requester, setRequester] = useState<string|undefined>(undefined);
  const [newSecurityCode, setNewSecurityCode] = useState<string|undefined>();
  const [detailedDescription, setDetailedDescription] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState<string>(PC_AVAILABLE_TYPE_OPTIONS[0].value);
  const [usageType, setUsageType] = useState<string>(PC_USAGE_TYPE_OPTIONS[0].value);
  const [employeeWorkspace, setEmployeeWorkspace] = useState<string|undefined>(undefined);
  const [employeeDepartment, setEmployeeDepartment] = useState<string|undefined>(undefined);
  const [employeeName, setEmployeeName] = useState<string|undefined>(undefined);
  const [location, setLocation] = useState<string>(PC_LOCATION_TYPE_OPTIONS[0].value);
  const [install_type, setInstallType] = useState<string>(PC_INSTALL_TYPE_OPTIONS[0].value);
  const [install_status, setInstallStatus] = useState<string>(PC_INSTALL_STATUS_OPTIONS[0].value);
  // 추가 정보
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const ref = useRef<HTMLSelectElement>(null);

  // 입고 로그 생성 : 신규 pc 만 해당,
  // 제조 번호 중복 체크, 
  // 제조 번호 존재하지 않을시 입고 로그 생성, 
  // 제조 번호 존재할시 입고 로그 생성 안함,
  const handleInLogCreation = async () => {
    const supabaseService = SupabaseService.getInstance();
    //1.제조 조회
    const existingAsset = await checkSerialNumber(supabaseService,serial);
    console.log('existingAsset',existingAsset)
    if (existingAsset&&existingAsset.length>0) {
      alert('이미 존재하는 제조번호 입니다.');
      return;
    }
    //2.pc 자산 생성
    const result = await createPcAsset();
    console.log('pc 자산 생성 결과',result)
    //3.입고 로그 생성
    const logResult = await createPcLog(result.data[0].asset_id,supabaseService);
    console.log('입고 로그 결과',logResult)
  }


  // 설치 로그 생성
  const handleInstallLogCreation = async () => {
    const supabaseService = SupabaseService.getInstance();
    //1. 제조 번호 존재 여부 체크
    const existingAsset = await checkSerialNumber(supabaseService,serial);
    console.log('existingAsset',existingAsset)
    //2. 제조 번호 존재하지 않을 경우 리턴
    // 설치는 pc_assets에 등록된 것만 진행하기때문에 존재하지 않는 경우 리턴
    if(!existingAsset||existingAsset.length===0){
      alert('제조 번호가 존재하지 않습니다. 등록 후 사용하세요');
      return;
    }
   
    //4. 설치 로그 생성 
    const result = await createPcLogInstall(existingAsset[0].asset_id,existingAsset[0].security_code,supabaseService);
    console.log('설치 로그 결과',result)
    //7. 페이지 새로고침
    router.refresh();
  }



  // 반납 로그 생성 : 반납 로그 생성 시 제조 번호 존재 여부 체크, 
  // 제조 번호 존재 시 사용 횟수 증가, 
  // 제조 번호 존재 시 입고 로그 생성, 
  // 제조 번호 존재 시 입고 로그 생성 안함, 
  const handleReturnLogCreation = async () => {
    const supabaseService = SupabaseService.getInstance();
    //1.제조 조회
    const existingAsset = await checkSerialNumber(supabaseService,serial);
    console.log('existingAsset',existingAsset)
    // 제조 번호 존재하지 않을시 pc 자산 생성
    // 반납 로그 생성 - 아직 pc_asset 에 등록되지 않은 반납 pc 일 경우
    if (!existingAsset||existingAsset.length===0) {
      alert('제조 번호가 존재하지 않습니다. 등록 후 시도 하십시오.');
      return;
    }
      const logResult = await createPcLogReturn(existingAsset[0].asset_id,supabaseService);
      console.log('핸들 반납 로그 결과',logResult)
      //4.페이지 새로고침
      router.refresh();
    }

  
  const handleDisposeLogCreation = async () => {
    const supabaseService = SupabaseService.getInstance();
    //1. 제조 번호 존재 여부 체크
    const existingAsset = await checkSerialNumber(supabaseService,serial);
    console.log('existingAsset',existingAsset)
    //2. 제조 번호 존재하지 않을 경우 리턴
    // 설치는 pc_assets에 등록된 것만 진행하기때문에 존재하지 않는 경우 리턴
    if(!existingAsset||existingAsset.length===0){
      alert('제조 번호가 존재하지 않습니다. 반납 혹은 입고 후 시도 하십시오.');
      return;
    }
   
    //4. 폐기 로그 생성 
    const result = await createPcLogDispose(existingAsset[0].asset_id,supabaseService);
    console.log('폐기 로그 결과',result)
    //5. asset_id 의 is_disposed 를 true 로 변경
    await updateIsDisposed(existingAsset[0].asset_id,true,supabaseService);
    //7. 페이지 새로고침
    router.refresh();
  }

  // PC타입 브랜드 자동 입력
  useEffect(()=>{
    if(pcType)
    setModelName(getModelNameOptions()[0]?.value)
  },[pcType,brand])
  // PC타입 브랜드 자동 입력
  function getModelNameOptions() {
    if (pcType === "데스크탑"&&brand==="HP") {
      return PC_HP_DESKTOP_MODEL_OPTIONS;
    }
    if (pcType === "노트북"&& brand==="HP"){
      return PC_HP_NOTEBOOK_MODEL_OPTIONS;
    }
    if (pcType === "노트북"&&brand==="LG") {
      return PC_LG_NOTEBOOK_MODEL_OPTIONS;
    }
    if (pcType === "데스크탑"&&brand==="LG") {
      return PC_LG_DESKTOP_MODEL_OPTIONS;
    }
    if (pcType === "데스크탑"&&brand==="삼성") {
      return PC_SAMSUNG_DESKTOP_MODEL_OPTIONS;
    }
    if (pcType === "노트북"&&brand==="삼성") {
      return PC_SAMSUNG_NOTEBOOK_MODEL_OPTIONS;
    }
    return [];
  }

    
   
    // // 보안코드 중복 체크 함수, 
    // const checkSecurityCode = async (securityCode: string,supabaseService:SupabaseService) => {
    //   const { data: existingSecurityCode, error: existingSecurityCodeError } = await supabaseService.select({
    //     table: 'pc_management_log',
    //     columns: '*', 
    //     match: { security_code: securityCode },
    //     limit: 1
    //   });
    //   return existingSecurityCode;
    // }

       // PC 자산 생성, 
       const createPcAsset = async () => {
       const supabaseService = SupabaseService.getInstance();
       const result = await supabaseService.insert({
         table: 'pc_assets',
         data: { 
           brand: brand, 
           model_name: modelName, 
           serial_number: serial, 
           security_code: [securityCode],
           pc_type: pcType, 
           first_stock_date: workDate,
           manufacture_date: manufactureDate,
         }
       });
       return result;
       }

      //  입고 로그 생성
      const createPcLog = async (asset_id: string,supabaseService:SupabaseService) => {
        const logResult = await supabaseService.insert({
         table: 'pc_management_log',
         data: {
           asset_id: asset_id,
           security_code: securityCode,
           work_type: workType,
           work_date: workDate,
           created_by: createdBy,
           is_available : isAvailable,//기본값 사용가능
           detailed_description: detailedDescription,
           is_new : isNew,
         }
       });
       
       if(logResult.success){
         alert('입고 완료');
         router.replace('/private/pc-history/in');
         return logResult.data;
        }
        console.log('입고 로그 생성 실패',logResult)
        return null;
      }

      // 설치(출고) 로그 생성
      const createPcLogInstall = async (asset_id: string,security_code_array: string[],supabaseService:SupabaseService) => {
        if(!securityCode){
          alert('보안코드를 입력해주세요');
          return;
        }
        const logResult = await supabaseService.insert({
          table: 'pc_management_log',
          data: {
            asset_id: asset_id,
            work_type: workType,
            work_date: workDate,
            created_by: createdBy,
            security_code : newSecurityCode,
            location : location,
            requester : requester,
            detailed_description: detailedDescription,
            usage_type : usageType,
            is_available : '사용가능',
            employee_workspace : employeeWorkspace,
            employee_department : employeeDepartment,
            employee_name : employeeName,
            install_type : install_type,
            install_status : install_status,
          }
      });
      console.log('설치 로그 결과',logResult)
      if(logResult.success){
            // 보안코드 변경시 보안코드 변경 로그 생성
        updatePcAssetsSecurityCode(asset_id,newSecurityCode,supabaseService);
        alert('설치 완료');
        router.replace('/private/pc-history/install');
        return logResult.data;
      }else{
        alert('설치 실패');
        console.error('설치 실패:', logResult);
        return null;
      }
      } 

      // 반납 로그 생성
      const createPcLogReturn = async (asset_id: string,supabaseService:SupabaseService) => {
        if(!securityCode){
          alert('보안코드를 입력해주세요');
          return;
        }
      const logResult = await supabaseService.insert({
        table: 'pc_management_log',
        data: {
          asset_id: asset_id,
          work_type: workType,
          work_date: workDate, //반납일
          created_by: createdBy,
          is_available : isAvailable,
          location : location,
          security_code : newSecurityCode,
          requester : requester,
          detailed_description: detailedDescription,
          usage_type : usageType,
          employee_workspace : employeeWorkspace,
          employee_department : employeeDepartment,
          employee_name : employeeName,
        }
      });
      console.log('반납 결과',logResult)
      if(logResult.success){
        alert('반납 완료');
        updatePcAssetsSecurityCode(asset_id,newSecurityCode,supabaseService);
        router.replace('/private/pc-history/return');
        return logResult.data;
      }else{
        alert('반납 실패');
        console.error('반납 실패:', logResult);
        return null;
      }
      }

     

      //폐기 로그 생성
      const createPcLogDispose = async (asset_id: string,supabaseService:SupabaseService) => {
        
        const logResult = await supabaseService.insert({
          table: 'pc_management_log',
          data: {
            asset_id: asset_id,
            work_type: workType,
            work_date: workDate,
            created_by: createdBy,
            location : location,
            security_code : securityCode,
            requester : requester,
            detailed_description: detailedDescription,
            usage_type : usageType,
            employee_workspace : employeeWorkspace,
            employee_department : employeeDepartment,
            employee_name : employeeName,
            

          }
      });
      console.log('폐기 로그 결과',logResult)
      if(logResult.success){
        alert('폐기 완료');
        router.replace('/private/pc-history/dispose');
        return logResult.data;
      }else{
        alert('폐기 실패');
        console.error('폐기 실패:', logResult);
        return null;
      }
      } 

  //work_type 이 반납이고 serial이 존재하는지 조회
  const checkWorkTypeReturn = async (supabaseService:SupabaseService,serial?: string) => {
        // 제조 번호 존재하는 경우
        
        const { data: existingAsset, error: existingAssetError } = await supabaseService.select({
          table: 'pc_management_log',
          columns: '*',
          match: { work_type: '반납' },
          limit: 1
        });
        return existingAsset;
  }


  //작성 버튼 입고 반납 구분
  const handleWriteButton = () => {
    if(!serial){
      alert('제조 번호를 입력해주세요.');
      return;
    }
    if(workType==="입고"){
      handleInLogCreation();
    }
    if(workType==="반납"){
      handleReturnLogCreation();
    }
    if(workType==="설치"){
      handleInstallLogCreation();
    }
    if(workType==="폐기"){
      handleDisposeLogCreation();
    }
  }


  // 폐기 로그 생성 시 is_disposed 를 true 로 변경
  const updateIsDisposed = async (asset_id: string,is_disposed: boolean,supabaseService:SupabaseService) => {
    const result = await supabaseService.update({
      table: 'pc_assets',
      data: { is_disposed: is_disposed },
      match: { asset_id: asset_id },
    });
    if(result.success){
      alert('is_disposed 변경 완료');
      console.log('is_disposed 변경 결과',result)
    }else{
      alert('is_disposed 변경 실패');
      console.error('is_disposed 변경 실패:', result);
    }
    
  }


  // securityCode와 newSecurityCode가 다를 경우 pc_assets 테이블에서 security_code []에 newSecurityCode 추가
  //설치로그와 반납로그에 사용중
  const updatePcAssetsSecurityCode = async (asset_id: string,newSecurityCode: string|undefined,supabaseService:SupabaseService) => {
    if(!newSecurityCode){
      return;
    }
    if(newSecurityCode===securityCode){
      alert('보안코드가 동일합니다.');
      return;
    }
    alert('보안코드 변경 시작')
    const { data: existingAsset, error: existingAssetError } = await supabaseService.select({
      table: 'pc_assets',
      columns: '*',
      match: { asset_id: asset_id },
      limit: 1
    });
    if(!existingAsset||existingAsset.length===0){
      alert('pc 자산 조회 실패');
      return;
    }
    if(existingAsset[0].security_code.includes(newSecurityCode)){
      alert('보안코드가 이미 존재합니다.');
      return;
    }
    
    // 기존 보안 코드를 파싱하여 배열로 변환
    const parseSecurityCodes = (existingCodes: any): string[] => {
      // 빈 값 처리
      if (!existingCodes) return [];
      
      // 이미 배열인 경우
      if (Array.isArray(existingCodes)) {
        return existingCodes.flatMap(code => {
          if (typeof code !== 'string') return String(code);
          try {
            const parsed = JSON.parse(code);
            return Array.isArray(parsed) ? parsed : code;
          } catch {
            return code;
          }
        });
      }
      
      // 문자열인 경우
      if (typeof existingCodes === 'string') {
        try {
          const parsed = JSON.parse(existingCodes);
          return Array.isArray(parsed) ? parsed : [existingCodes];
        } catch {
          return [existingCodes];
        }
      }
      
      // 그 외의 경우
      return [String(existingCodes)];
    };

    // 기존 코드를 배열로 변환하고 새 코드를 추가
    const existingSecurityCodes = parseSecurityCodes(existingAsset[0].security_code);
    const updatedSecurityCodes = [newSecurityCode, ...existingSecurityCodes];

    // 중복 제거
    const uniqueSecurityCodes = [...new Set(updatedSecurityCodes)];

    const UpdateResult = await supabaseService.update({
      table: 'pc_assets',
      data: {
        security_code: uniqueSecurityCodes,
      },
      match: { asset_id: asset_id },
    });
    if(UpdateResult.success){
      alert('보안코드 변경 완료');
      console.log('보안코드 변경 결과',UpdateResult)
    }else{
      alert('보안코드 변경 실패');
      console.error('보안코드 변경 실패:', UpdateResult);
    }
  
    return UpdateResult;
    
  }
  


   //3. [자동완성] 제조 번호 존재 시 pc 자산정보 세팅
    const setPcAssetInfo = async (serial: string) => {
    const supabaseService = SupabaseService.getInstance();
    const existingAsset = await checkSerialNumber(supabaseService,serial);
    if(!existingAsset||existingAsset.length===0){
      alert('제조 번호가 존재하지 않습니다. 등록 후 시도 하십시오.');
      return;
    }
    console.log('자동입력 PC 자산 데이터 결과',existingAsset)
    if(workType!=="입고"){
    // pc 자산정보 세팅
    //null 또는 undefined 대응
    setPcType(existingAsset[0].pc_type?existingAsset[0].pc_type:"");
    setBrand(existingAsset[0].brand?existingAsset[0].brand:"");
    setModelName(existingAsset[0].model_name?existingAsset[0].model_name:"");
    setSerial(existingAsset[0].serial_number?existingAsset[0].serial_number:"");
    setSecurityCode(existingAsset[0].security_code?existingAsset[0].security_code[0]:"");
    setManufactureDate(existingAsset[0].manufacture_date?existingAsset[0].manufacture_date:"");
    setFirstStockDate(existingAsset[0].first_stock_date?existingAsset[0].first_stock_date:"");
    }   
    // 폐기 로그 생성 시 정보 세팅
    if(workType==="폐기"){
      //pc_management_log 테이블에서 제조번호가 일치하는 가장 최근 log 조회
      const { data: existingLog, error: existingLogError } = await supabaseService.select({
        table: 'pc_management_log',
        columns: '*',
        match: { asset_id: existingAsset[0].asset_id },
        limit: 1
      });
      const result : IPcManagementLog = existingLog[0];
      if(!result){
        alert('폐기 로그 조회 실패');
        return;
      }
      console.log('폐기 자동입력 데이터 결과',result)
      // pc 자산정보 세팅
    setPcType(existingAsset[0].pc_type?existingAsset[0].pc_type:"");
    setBrand(existingAsset[0].brand?existingAsset[0].brand:"");
    setModelName(existingAsset[0].model_name?existingAsset[0].model_name:"");
    setSerial(existingAsset[0].serial_number?existingAsset[0].serial_number:"");
    setSecurityCode(existingAsset[0].security_code?existingAsset[0].security_code[0]:"");
    setManufactureDate(existingAsset[0].manufacture_date?existingAsset[0].manufacture_date:"");
    setFirstStockDate(existingAsset[0].first_stock_date?existingAsset[0].first_stock_date:"");
    // log정보 세팅
    setWorkDate(result.work_date?result.work_date:"");
    setRequester(result.requester?result.requester:"");
    setEmployeeWorkspace(result.employee_workspace?result.employee_workspace:"");
    setEmployeeDepartment(result.employee_department?result.employee_department:"");
    setEmployeeName(result.employee_name?result.employee_name:"");
    setUsageType(result.usage_type?result.usage_type:"");
    setDetailedDescription(result.detailed_description?result.detailed_description:"");
    
    }
   }
   
       // 사원명으로 사원 정보 조회 결과 확인 후 선택 가능

       const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
       const [isModalOpen, setIsModalOpen] = useState(false);
       
       const handleEmployeeDataByName = async (employeeName: string) => {
         // 사원명 입력 후 엔터시 사원 정보 조회
         const employeeData = await fetchEmployeeDataByName(employeeName);
         // 사원 정보 확인 후 사업장과 부서 선택
         if(employeeData.length>0){
           console.log('사원 정보',employeeData)
           setEmployeeData(employeeData);
           setIsModalOpen(true);
         }
       }

  return (
    <>
    <EmployeesSelectModal employeeData={employeeData} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} setEmployeeDepartment={setEmployeeDepartment} setEmployeeName={setEmployeeName}/>
    <div className="text-sm font-semibold text-gray-700 px-4 sm:px-8 my-2">
      <div className="flex flex-row items-center gap-2">
      <h1>PC 자산 정보</h1>
      {workType==="입고"&&
        <div className="flex items-center me-4">
          <input type="checkbox" id="is-new-checkbox"
          className="w-4 h-4 text-white  rounded-sm focus:ring-green-500 accent-green-500 focus:bg-green-500 focus:color-green-500 dark:focus:ring-green-600  focus:ring-2 "
            checked={isNew}       
            autoFocus={true}
            onChange={(e)=>{
              setIsNew(e.target.checked);
            }}
            />
            <label htmlFor="is-new-checkbox" className="ms-1 text-sm font-medium ">신규 PC 등록</label>
         
        </div>
      }
      </div>

      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4 sm:px-8 mb-4">
        
        <InputDropDown
          label={"기종"}
          value={pcType}
          setValue={setPcType}
          ref={ref}
          options={PC_TYPE_OPTIONS}
          disabled={workType!=="입고"}
        />
        <InputDropDown
          label={"제조사"}
          value={brand}
          setValue={setBrand}
          ref={ref}
          options={PC_BRAND_OPTIONS}
          disabled={workType!=="입고"}
        />
        <InputDropDown
          label={"모델명"}
          value={modelName}
          setValue={setModelName}
          ref={ref}
          options={getModelNameOptions()}
          disabled={workType!=="입고"}
        />
          <InputLog
          label={"제조번호"}
          value={serial}
          setValue={setSerial}
          required={true}
          placeholder={workType!=="입고"?"제조번호 입력후 엔터 시 자동입력":"제조번호를 입력해주세요"}
          onKeyDown={()=>{
            if(workType!=="입고"&&serial){
              setPcAssetInfo(serial);
            }
          }}

        />
        {workType!=="입고"?
        null
        :
        (
        <InputDate
          label="작성일"
          value={workDate}
          setValue={setWorkDate}
          name="workDate"
          type="date"
          disabled={workType!=="입고"}
        />
        )}
        <InputLog
          label="제조일"
          secondLabel={((user?.email==="pcsub1@ket.com"||user?.email==="admin@ket.com")&&manufactureDate)?generateSecurityCode(manufactureDate):undefined}
          value={manufactureDate}
          setValue={setManufactureDate}
          disabled={workType!=="입고"}
          placeholder={workType==="입고"?"yyyy-mm 형식으로 입력해주세요":undefined}
        />
        <InputLog
          label="최초입고일"
          secondLabel={((user?.email==="pcsub1@ket.com"||user?.email==="admin@ket.com")&&firstStockDate)?generateSecurityCode(firstStockDate):undefined}
          value={firstStockDate}
          setValue={setFirstStockDate}
          disabled={workType!=="입고"}
          placeholder={workType==="입고"?"yyyy-mm 혹은 yyyy-mm-dd":undefined}
        />
    
       <InputLog
         label={"보안코드"}
         value={securityCode}
         setValue={setSecurityCode}
         disabled={workType!=="입고"||isNew}
       /> 
      </div>
      {workType==="입고"?
      null
      :
      (
      <div className="text-sm font-semibold text-gray-700 px-4 sm:px-8 mb-2">입력 정보</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4 sm:px-8 mb-4">
      {workType==="입고"?
        <div></div>
        :
        (
        <InputDate
          label={workType==="반납"?"반납일":workType==="설치"?"출고일":"폐기일"}
          value={workDate}
          setValue={setWorkDate}
          name="workDate"
          type="date"
        />
        )}

         {workType==="입고"?
         <div></div>
         :
         (
        <InputLog
          label={"의뢰인"}
          value={requester}
          setValue={setRequester}
        />
         )}
         {workType==="입고"?
         <div></div>
         :
         (
          <InputLog
         label={"신규 보안코드"}
         value={newSecurityCode}
         setValue={setNewSecurityCode}
         placeholder="보안코드 변경시 입력"
       /> 
         )}
           {workType!=="반납"?
        <div></div>
        :
        (
       <InputDropDown
         label={"상태"}
         value={isAvailable}
         setValue={setIsAvailable}
         ref={ref}
         options={PC_STATUS_OPTIONS}
       />
        )}
        {workType==="입고"?
        <div></div>
        :
        (
       <InputLog
         label={"사업장"}
         value={employeeWorkspace}
         setValue={setEmployeeWorkspace}
       />
        )}
        {workType==="입고"?
        <div></div>
        :
        (
       <InputLog
         label={"부서"}
         value={employeeDepartment}
         setValue={setEmployeeDepartment}
       />
        )}
        {workType==="입고"?
        <div></div>
        :
        (
       <InputLog
         label={"사용자"}
         value={employeeName}
         setValue={setEmployeeName}
         onKeyDown={()=>handleEmployeeDataByName(employeeName??"")}
       />
        )}
         {workType==="입고"?
        <div></div>
        :
        (
       <InputDropDown
         label={"사용용도"}
         value={usageType}
         setValue={setUsageType}
         ref={ref}
         options={PC_USAGE_TYPE_OPTIONS}
        />
        )}
        {workType!=="반납"?
        null
        :
        (
        <InputDropDown
         label={"보관장소"}
         value={location}
         setValue={setLocation}
         ref={ref}
         options={PC_LOCATION_TYPE_OPTIONS}
        />
        )}
        {workType!=="설치"?
        null
        :
        (
        <InputDropDown
          label={"설치유형"}
          value={install_type}
          setValue={setInstallType}
          ref={ref}
          options={PC_INSTALL_TYPE_OPTIONS}
        />
        )}
        {workType!=="설치"?
        null
        :
        (
        <InputDropDown
          label={"설치상태"}
          value={install_status}
          setValue={setInstallStatus}
          ref={ref}
          options={PC_INSTALL_STATUS_OPTIONS}
        />
        )}
      



     </div>
    {/* 디버깅 정보 */}
      {/* <div>
        <h3>디버깅 정보</h3>
        <p>신규pc입고 : {isNew+""}</p>
        <p>workType: {workType}</p>
        <p>brand: {brand}</p>
        <p>modelName: {modelName}</p>
        <p>serial: {serial}</p>
        <p>securityCode: {securityCode}</p>
        <p>pcType: {pcType}</p>
        <p>workDate: {workDate}</p>
        <p>manufactureDate: {manufactureDate}</p>
        <p>isLoading: {isLoading}</p>
        <p>detailedDescription: {detailedDescription}</p>
         <h1>{location}</h1>
            <h1>{install_type+""}</h1>
            <h1>{install_status+""}</h1>
      </div> */}


      <div className="w-full mb-4 px-4 sm:px-8">
       <InputTextArea
         label={"상세설명"}
         value={detailedDescription}
         setValue={setDetailedDescription}
         placeholder={workType==="입고"?"TIP : 입고는 새 PC 등록에만 사용됩니다":workType==="반납"?"반납 상세설명을 입력해주세요":workType==="설치"?"TIP : 설치는 기존 pc 자산이 있는 경우에만 입력 가능합니다. 반납 혹은 입고로 PC자산을 생성 후 시도 하십시오.":workType==="폐기"?"TIP : 폐기는 기존 pc 자산이 있는 경우에만 입력 가능합니다. 폐기 확정인 경우에만 이용해주세요.":"-"}
       />
      </div>
      <div className="w-full flex justify-end mb-4 px-4 sm:px-8">
        <div className="w-36 ">
        <OkButton
          onClick={handleWriteButton}
          isLoading={isLoading}
          buttonText={workType==="입고"?"입고":workType==="반납"?"반납":workType==="설치"?"설치":workType==="폐기"?"폐기":"-"}
        />
        </div>
      </div>
    </>
  );
}

