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
  const [securityCode, setSecurityCode] = useState<string|undefined>(pcManagementLog[0]?.security_code ?? undefined);
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
      
         <InputDate
          value={firstStockDate ?? "-"}
          setValue={setFirstStockDate}
          name="firstStockDate"
          label="입고일"
          type="date"
          disabled={true}
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
         label={"보안코드"}
         value={securityCode ?? "-"}
         setValue={setSecurityCode}
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

