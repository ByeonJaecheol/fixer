'use client'
import CommonInputOnChange from "@/app/_components/common/input/CommonInputOnChange";
import InputDateLegacy from "@/app/_components/log/InputDateLegacy";
import InputModelName from "@/app/_components/log/InputModelName";
import InputPcType from "@/app/_components/log/InputPcType";
import InputSerial from "@/app/_components/log/InputSerial";
import { useEffect, useRef, useState } from "react";
import OkButton from "@/app/_components/common/input/button/OkButton";
import SupabaseService, { IAssetLog } from "@/api/supabase/supabaseApi";
import InputDate from "@/app/_components/log/InputDate";
import { usePathname, useRouter } from "next/navigation";
import InputLog from "@/app/_components/log/new/InputLog";
import InputDropDown from "@/app/_components/log/new/InputDropDown";
import { PC_AVAILABLE_TYPE_OPTIONS, PC_BRAND_OPTIONS, PC_HP_DESKTOP_MODEL_OPTIONS, PC_HP_NOTEBOOK_MODEL_OPTIONS, PC_INSTALL_STATUS_OPTIONS, PC_INSTALL_TYPE_OPTIONS, PC_LG_NOTEBOOK_MODEL_OPTIONS, PC_LOCATION_TYPE_OPTIONS, PC_STATUS_OPTIONS, PC_TYPE_OPTIONS, PC_USAGE_TYPE_OPTIONS } from "@/app/constants/objects";
import InputTextArea from "@/app/_components/log/new/InputTextArea";
import InputToggle from "@/app/_components/log/new/InputToggle";
import CommonRadio from "@/app/_components/common/input/CommonRadio";
import { checkSerialNumber } from "@/app/utils/util";
import { useUser } from "@/context/UserContext";



export default function PcLogInput({workType}:{workType:string}) {
  const { user } = useUser();
  const createdBy = user?.email;
  // pc 자산 정보
  const [pcType, setPcType] = useState<string>(PC_TYPE_OPTIONS[0].value);
  const [brand, setBrand] = useState<string>(PC_BRAND_OPTIONS[0].value);
  const [modelName, setModelName] = useState<string>("");  
  const [serial, setSerial] = useState<string|undefined>(undefined);
  const [firstStockDate, setFirstStockDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manufactureDate, setManufactureDate] = useState<string>("");
  const [isNew, setIsNew] = useState<boolean>(false);
  // 관리 로그 정보
  const [workDate, setWorkDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [requester, setRequester] = useState<string|undefined>(undefined);
  const [securityCode, setSecurityCode] = useState<string|undefined>(undefined);
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
      console.log('제조 번호 존재하지 않으므로 자산생성 시작')
      const result = await createPcAsset();
      console.log('pc 자산 생성 결과',result)
      const logResult = await createPcLogReturn(result.data[0].asset_id,supabaseService);
      console.log('반납 로그 결과',logResult)
    }else {
      // 제조 번호 존재하는 경우
      //1. work_type 이 반납인 동일 pc가 있는지 조회
      const existingReturnPcAsset = await checkWorkTypeReturn(supabaseService,serial);
      console.log('existingReturnPcAsset',existingReturnPcAsset)
      //2. 기존 asset_id 존재하는 PC에 대한 반납 로그 생성
      const logResult = await createPcLogReturn(existingAsset[0].asset_id,supabaseService);
      //3. logResult 가 성공일 경우 사용 횟수 증가
      //4.페이지 새로고침
      router.refresh();
      console.log('반납 로그 결과',logResult)
    }
    
  } 

  const handleInstallLogCreation = async () => {
    const supabaseService = SupabaseService.getInstance();
    //1. 제조 번호 존재 여부 체크
    const existingAsset = await checkSerialNumber(supabaseService,serial);
    console.log('existingAsset',existingAsset)
    //2. 제조 번호 존재하지 않을 경우 리턴
    // 설치는 pc_assets에 등록된 것만 진행하기때문에 존재하지 않는 경우 리턴
    if(!existingAsset||existingAsset.length===0){
      alert('제조 번호가 존재하지 않습니다.');
      return;
    }
   
    //4. 설치 로그 생성 
    const result = await createPcLogInstall(existingAsset[0].asset_id,supabaseService);
    console.log('설치 로그 결과',result)
    //7. 페이지 새로고침
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

  useEffect(()=>{
    setModelName(getModelNameOptions()[0]?.value)
  },[pcType,brand])
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
           pc_type: pcType, 
           first_stock_date: workDate,
           manufacture_date: manufactureDate,
           usage_count: isNew?0:1,
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
           work_type: workType,
           work_date: firstStockDate,
           created_by: createdBy,
           is_available : isAvailable,//기본값 사용가능
           detailed_description: detailedDescription,
           is_new : isNew,
         }
       });
       
       if(logResult.success){
         alert('입고 완료');
         router.refresh();
         return logResult.data;
        }
        console.log('입고 로그 생성 실패',logResult)
        return null;
      }

      // 반납 로그 생성
      const createPcLogReturn = async (asset_id: string,supabaseService:SupabaseService) => {
        console.log('반납 시작')
      const logResult = await supabaseService.insert({
        table: 'pc_management_log',
        data: {
          asset_id: asset_id,
          work_type: workType,
          work_date: workDate, //반납일
          created_by: createdBy,
          is_available : isAvailable,
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
      console.log('반납 결과',logResult)
      if(logResult.success){
        alert('반납 완료');
        return logResult.data;
      }else{
        alert('반납 실패');
        console.error('반납 실패:', logResult);
        return null;
      }
      }

      const createPcLogInstall = async (asset_id: string,supabaseService:SupabaseService) => {
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
        alert('설치 완료');
        return logResult.data;
      }else{
        alert('설치 실패');
        console.error('설치 실패:', logResult);
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



   //3. 제조 번호 존재 시 pc 자산정보 세팅
    const setPcAssetInfo = async (serial: string) => {
    const supabaseService = SupabaseService.getInstance();
    const existingAsset = await checkSerialNumber(supabaseService,serial);
    if(!existingAsset||existingAsset.length===0){
      alert('제조 번호 존재하지 않습니다.');
      return;
    }
    console.log('자동입력 데이터 결과',existingAsset)
    if(workType!=="입고"){
    // pc 자산정보 세팅
    //null 또는 undefined 대응
    setPcType(existingAsset[0].pc_type?existingAsset[0].pc_type:"");
    setBrand(existingAsset[0].brand?existingAsset[0].brand:"");
    setModelName(existingAsset[0].model_name?existingAsset[0].model_name:"");
    setSerial(existingAsset[0].serial_number?existingAsset[0].serial_number:"");
    setManufactureDate(existingAsset[0].manufacture_date?existingAsset[0].manufacture_date:"");
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
      const result : IAssetLog = existingLog[0];
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
    setManufactureDate(existingAsset[0].manufacture_date?existingAsset[0].manufacture_date:"");
    // log정보 세팅
    setWorkDate(result.work_date?result.work_date:"");
    setSecurityCode(result.security_code?result.security_code:"");
    setRequester(result.requester?result.requester:"");
    setEmployeeWorkspace(result.employee_workspace?result.employee_workspace:"");
    setEmployeeDepartment(result.employee_department?result.employee_department:"");
    setEmployeeName(result.employee_name?result.employee_name:"");
    setUsageType(result.usage_type?result.usage_type:"");
    setDetailedDescription(result.detailed_description?result.detailed_description:"");
    
    }
   }
   

  return (
    <>
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
        />
        <InputDropDown
          label={"제조사"}
          value={brand}
          setValue={setBrand}
          ref={ref}
          options={PC_BRAND_OPTIONS}
        />
        <InputDropDown
          label={"모델명"}
          value={modelName}
          setValue={setModelName}
          ref={ref}
          options={getModelNameOptions()}
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

        <InputDate
          value={manufactureDate}
          setValue={setManufactureDate}
          name="manufactureDate"
          label="제조일"
          type="month"
        />
        {workType==="반납"||workType==="설치"?
      null
      :
      (
         <InputDate
          value={firstStockDate}
          setValue={setFirstStockDate}
          name="firstStockDate"
          label="입고일"
          type="date"
        />
      )}

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
         label={"보안코드"}
         value={securityCode}
         setValue={setSecurityCode}
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

