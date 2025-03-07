'use client'
import CommonInputOnChange from "@/app/_components/common/input/CommonInputOnChange";
import InputDateLegacy from "@/app/_components/log/InputDateLegacy";
import InputModelName from "@/app/_components/log/InputModelName";
import InputPcType from "@/app/_components/log/InputPcType";
import InputSerial from "@/app/_components/log/InputSerial";
import { useEffect, useRef, useState } from "react";
import OkButton from "@/app/_components/common/input/button/OkButton";
import SupabaseService from "@/api/supabase/supabaseApi";
import InputDate from "@/app/_components/log/InputDate";
import { usePathname, useRouter } from "next/navigation";
import InputLog from "@/app/_components/log/new/InputLog";
import InputDropDown from "@/app/_components/log/new/InputDropDown";
import { PC_BRAND_OPTIONS, PC_HP_DESKTOP_MODEL_OPTIONS, PC_HP_NOTEBOOK_MODEL_OPTIONS, PC_LG_NOTEBOOK_MODEL_OPTIONS, PC_TYPE_OPTIONS, PC_USAGE_TYPE_OPTIONS } from "@/app/constants/objects";
import InputTextArea from "@/app/_components/log/new/InputTextArea";



export default function InputPcIn({workType}:{workType:string}) {
  // pc 자산 정보
  const [pcType, setPcType] = useState<string>(PC_TYPE_OPTIONS[0].value);
  const [brand, setBrand] = useState<string>(PC_BRAND_OPTIONS[0].value);
  const [modelName, setModelName] = useState<string>("");  
  const [serial, setSerial] = useState<string>("");
  const [firstStockDate, setFirstStockDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [manufactureDate, setManufactureDate] = useState<string>("");
  // 관리 로그 정보
  const [workDate, setWorkDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [requester, setRequester] = useState<string>("");
  const [securityCode, setSecurityCode] = useState<string>("");
  const [detailedDescription, setDetailedDescription] = useState<string>("");
  const [createdBy, setCreatedBy] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [usageCount, setUsageCount] = useState<number>(1);
  const [usageType, setUsageType] = useState<string>(PC_USAGE_TYPE_OPTIONS[0].value);
  const [employeeWorkspace, setEmployeeWorkspace] = useState<string>("");
  const [employeeDepartment, setEmployeeDepartment] = useState<string>("");
  const [employeeName, setEmployeeName] = useState<string>("");
  // 추가 정보
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const ref = useRef<HTMLSelectElement>(null);

  const handlePcAssetCreationTest = async () => {
    const supabaseService = SupabaseService.getInstance();
    
    // 시리얼번호 중복 체크
    const { data: existingAsset, error: existingAssetError } = await supabaseService.select({
      table: 'pc_assets',
      columns: '*',
      match: { serial_number: serial },
      limit: 1
    });
    console.log('existingAsset',existingAsset)
    console.log('existingAsset',existingAsset)
    console.log('existingAsset',existingAsset)
    console.log('existingAsset',existingAsset)
    console.log('existingAsset',existingAsset)
    if (existingAsset&&existingAsset.length>0) {
      alert('이미 존재하는 시리얼번호 입니다.');
      return;
    }
    // 보안코드 중복 체크
    const { data: existingSecurityCode, error: existingSecurityCodeError } = await supabaseService.select({
      table: 'pc_management_log',
      columns: '*',
      match: { security_code : securityCode},
      limit: 1
    });
    console.log('existingSecurityCode',existingSecurityCode)
    console.log('existingSecurityCode',existingSecurityCode)
    console.log('existingSecurityCode',existingSecurityCode)
    if (existingSecurityCode&&existingSecurityCode.length>0) {
      alert('이미 존재하는 보안코드 입니다.');
      return;
    }

    // PC 자산 생성 및 관리 로그 추가하는 트랜잭션
    console.log('입력시작')
    const result = await supabaseService.insert({
      table: 'pc_assets',
      data: { 
        brand: brand, 
        model_name: modelName, 
        serial_number: serial, 
        pc_type: pcType, 
        first_stock_date: workDate,
        manufacture_date: manufactureDate
      }
    });
    if (result.success) {
      if(workType==="입고"){
        console.log('입고 시작')
      const logResult = await supabaseService.insert({
        table: 'pc_management_log',
        data: {
          asset_id: result.data[0].asset_id,
          work_type: workType,
          work_date: firstStockDate,
          created_by: createdBy,
          status : "new",
          detailed_description: detailedDescription,
        }
      });
      
      if(logResult.success){
        alert('입고 완료');
        router.refresh();
        return logResult.data;
      }
      }
      if(workType==="반납"){
        console.log('반납 시작')
        const logResult = await supabaseService.insert({
          table: 'pc_management_log',
          data: {
            asset_id: result.data[0].asset_id,
            work_type: workType,
            work_date: workDate, //반납일
            created_by: 'pcsub1@ket.com',
            status : "used",
            security_code : securityCode,
            requester : requester,
            detailed_description: detailedDescription,
            is_available : true,
            usage_type : usageType,
            employee_workspace : employeeWorkspace,
            employee_department : employeeDepartment,
            employee_name : employeeName,
            usage_count : result.data[0].usage_count?result.data[0].usage_count+1:1,
          }
        });
        console.log('반납 결과',logResult)
        if(logResult.success){
          alert('반납 완료');
          router.refresh();
          return logResult.data;
        }else{
          alert('반납 실패');
          console.error('반납 실패:', logResult);
          return null;
        }
      }
      alert("해당사항 없음");
      router.refresh();
      return result.data;
    } else {
      console.error("PC 자산 추가 실패:", result.error);
      alert("PC 자산 추가 실패");
      return null;
    }
  };
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


  return (
    <>
    <div className="text-sm font-semibold text-gray-700 px-4 sm:px-8 my-2">PC 자산 정보</div>
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
          label={"시리얼번호"}
          value={serial}
          setValue={setSerial}
        />

        <InputDate
          value={manufactureDate}
          setValue={setManufactureDate}
          name="manufactureDate"
          label="제조일"
          type="month"
        />
         <InputDate
          value={firstStockDate}
          setValue={setFirstStockDate}
          name="firstStockDate"
          label="입고일"
          type="date"
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
          label={"작업일"}
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
           {workType==="입고"?
        <div></div>
        :
        (
       <InputLog
         label={"상태"}
         value={status}
         setValue={setStatus}
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
     
     </div>
    
      {/* <div>
        <h3>디버깅 정보</h3>
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
      </div> */}
      <div className="w-full mb-4 px-4 sm:px-8">
       <InputTextArea
         label={"상세설명"}
         value={detailedDescription}
         setValue={setDetailedDescription}
       />
      </div>
      <div className="w-full flex justify-end mb-4 px-4 sm:px-8">
        
        <div className="w-36 ">
        <OkButton
          onClick={handlePcAssetCreationTest}
          isLoading={isLoading}
          buttonText="입고"
        />
        </div>
      </div>
    </>
  );
}

