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
import { PC_BRAND_OPTIONS, PC_HP_DESKTOP_MODEL_OPTIONS, PC_HP_NOTEBOOK_MODEL_OPTIONS, PC_INSTALL_STATUS_OPTIONS, PC_INSTALL_TYPE_OPTIONS, PC_LG_NOTEBOOK_MODEL_OPTIONS, PC_LOCATION_TYPE_OPTIONS, PC_STATUS_OPTIONS, PC_TYPE_OPTIONS, PC_USAGE_TYPE_OPTIONS } from "@/app/constants/objects";
import InputTextArea from "@/app/_components/log/new/InputTextArea";
import { IDB_ASSET_LOG_DATA } from "@/app/constants/interfaces";



export default function DetailPcInput({workType,pcManagementLog}:{workType:string,pcManagementLog:IDB_ASSET_LOG_DATA[]}) {
  // pc 자산 정보
  //undefined 처리
  const [pcType, setPcType] = useState<string|undefined>(pcManagementLog[0]?.pc_assets.pc_type ?? undefined);
  const [brand, setBrand] = useState<string|undefined>(pcManagementLog[0]?.pc_assets.brand ?? undefined);
  const [modelName, setModelName] = useState<string|undefined>(pcManagementLog[0]?.pc_assets.model_name ?? undefined);  
  const [serial, setSerial] = useState<string|undefined>(pcManagementLog[0]?.pc_assets.serial_number ?? undefined);
  const [firstStockDate, setFirstStockDate] = useState<string|undefined>(pcManagementLog[0]?.pc_assets.first_stock_date ?? undefined);
  const [manufactureDate, setManufactureDate] = useState<string|undefined>(pcManagementLog[0]?.pc_assets.manufacture_date ?? undefined);
  // 관리 로그 정보
  const [workDate, setWorkDate] = useState<string|undefined>(pcManagementLog[0]?.work_date ?? undefined);
  const [requester, setRequester] = useState<string|undefined>(pcManagementLog[0]?.requester ?? undefined);
  const [securityCode, setSecurityCode] = useState<string|undefined>(pcManagementLog[0]?.pc_assets.security_code[0] ?? undefined);
  const [detailedDescription, setDetailedDescription] = useState<string|undefined>(pcManagementLog[0]?.detailed_description ?? undefined);
  const [createdBy, setCreatedBy] = useState<string|undefined>(pcManagementLog[0]?.created_by ?? undefined);
  const [status, setStatus] = useState<string|undefined>(pcManagementLog[0]?.status ?? undefined);
  const [usageType, setUsageType] = useState<string|undefined>(pcManagementLog[0]?.usage_type ?? undefined);
  const [employeeWorkspace, setEmployeeWorkspace] = useState<string|undefined>(pcManagementLog[0]?.employee_workspace ?? undefined);
  const [employeeDepartment, setEmployeeDepartment] = useState<string|undefined>(pcManagementLog[0]?.employee_department ?? undefined);
  const [employeeName, setEmployeeName] = useState<string|undefined>(pcManagementLog[0]?.employee_name ?? undefined);
  const [location, setLocation] = useState<string|undefined>(pcManagementLog[0]?.location ?? undefined);
  const [install_type, setInstallType] = useState<string|undefined>(pcManagementLog[0]?.install_type ?? undefined);
  const [install_status, setInstallStatus] = useState<string|undefined>(pcManagementLog[0]?.install_status ?? undefined);
  const [newSecurityCode, setNewSecurityCode] = useState<string|undefined>(undefined);
  // 추가 정보
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const ref = useRef<HTMLSelectElement>(null);

  const handleUpdateButton = async() => {
    // 입고 로그 수정
      console.log("수정 시작");
      const supabaseService = SupabaseService.getInstance();
      //pc자산 수정
      const { success: pcAssetSuccess, error: pcAssetError, data: pcAssetData } = await supabaseService.update({
        table: 'pc_assets',
        data: {
          pc_type: pcType,
          brand: brand,
          model_name: modelName,
          serial_number: serial,
          // 보안코드 변경시 기존 보안코드 맨 앞에 추가
          security_code: [newSecurityCode,...pcManagementLog[0].pc_assets.security_code],
          first_stock_date: firstStockDate,
          manufacture_date: manufactureDate,
          
        },
        match: { asset_id: pcManagementLog[0].pc_assets.asset_id },
      });
      if (pcAssetSuccess) {
        alert("PC 자산 수정 완료");
      }
      if (pcAssetError) {
        alert("PC 자산 수정 실패");
      }
      

      const { success, error, data } = await supabaseService.update({
        table: 'pc_management_log',
        data: {
          work_date: workDate,
          requester: requester,
          security_code: securityCode,
          detailed_description: detailedDescription,
          created_by: createdBy,
          status: status,
          usage_type: usageType,
          employee_workspace: employeeWorkspace,
          employee_department: employeeDepartment,
          employee_name: employeeName,
          location: location,
          install_type: install_type,
          install_status: install_status,
        },
        match: { log_id: pcManagementLog[0].log_id },
      });
      if (success) {
        alert("수정 완료");
        router.refresh();
      }
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

  
  // securityCode와 newSecurityCode가 다를 경우 pc_assets 테이블에서 security_code []에 newSecurityCode 추가
  //설치로그와 반납로그에 사용중
  // 수정에서는 보안코드 변경이 되면 좋지만 복잡해서 읿단 보류
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

  return (
    <>
    <div className="text-sm font-semibold text-gray-700 px-4 sm:px-8 my-2">PC 자산 정보</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4 sm:px-8 mb-4">
        
        <InputDropDown
          label={"기종"}
          value={pcType ?? "-"}
          setValue={setPcType}
          ref={ref}
          options={PC_TYPE_OPTIONS}
          disabled={true}
        />
        <InputDropDown
          label={"제조사"}
          value={brand ?? "-"}
          setValue={setBrand}
          ref={ref}
          options={PC_BRAND_OPTIONS}
          disabled={true}
        />
        <InputDropDown
          label={"모델명"}
          value={modelName ?? "-"}
          setValue={setModelName}
          ref={ref}
          options={getModelNameOptions()}
          disabled={true}
          />
          <InputLog
          label={"제조번호"}
          value={serial ?? "-"}
          setValue={setSerial}
          required={true}
          disabled={true}
        />
        <InputLog
          label="제조일"
          value={manufactureDate ?? "-"}
          setValue={setManufactureDate}
          disabled={true}
        />
           <InputLog
          label="최초입고일"
          value={firstStockDate ?? "-"}
          setValue={setFirstStockDate}
          disabled={true}
        />
      
        {workType==="입고"?
        <div></div>
        :
        (
       <InputLog
         label={"보안코드"}
         value={securityCode ?? "-"}
         setValue={setSecurityCode}
         disabled={true}
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
          label={"작업일"}
          value={workDate ?? "-"}
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
         value={requester ?? "-"}
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

        {workType==="입고"?
        <div></div>
        :
        (
       <InputDropDown
         label={"상태"}
         value={status ?? "-"}
         setValue={setStatus}
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
         value={employeeWorkspace ?? "-"}
         setValue={setEmployeeWorkspace}
       />
        )}
        {workType==="입고"?
        <div></div>
        :
        (
       <InputLog
         label={"부서"}
         value={employeeDepartment ?? "-"}
         setValue={setEmployeeDepartment}
       />
        )}
        {workType==="입고"?
        <div></div>
        :
        (
       <InputLog
         label={"사용자"}
         value={employeeName ?? "-"}
         setValue={setEmployeeName}
       />
        )}
         {workType==="입고"?
        <div></div>
        :
        (
       <InputDropDown
         label={"사용용도"}
         value={usageType ?? "-"}
         setValue={setUsageType}
         ref={ref}
         options={PC_USAGE_TYPE_OPTIONS}
        />
        )}
     
     {/* 반납일때만 보임 */}
        {workType!=="반납"?
        null
        :
        (   
     <InputDropDown
         label={"보관장소"}
         value={location ?? "-"}
         setValue={setLocation}
         ref={ref}
         options={PC_LOCATION_TYPE_OPTIONS}
        />
        )}

        {/* 설치일때만 보임 */}
        {workType!=="설치"?
        null
        :
        (
        <InputDropDown
          label={"설치유형"}
          value={install_type ?? "-"}
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
          value={install_status ?? "-"}
          setValue={setInstallStatus}
          ref={ref}
          options={PC_INSTALL_STATUS_OPTIONS}
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
         value={detailedDescription ?? "-"}
         setValue={setDetailedDescription}
       />
      </div>
      <div className="w-full flex justify-end mb-4 px-4 sm:px-8">
        
        <div className="w-36 ">
        <OkButton
          onClick={handleUpdateButton}
          isLoading={isLoading}
          buttonText="수정"
        />
        </div>
      </div>
    </>
  );
}

