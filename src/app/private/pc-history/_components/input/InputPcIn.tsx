'use client'
import CommonInputOnChange from "@/app/_components/common/input/CommonInputOnChange";
import InputDateLegacy from "@/app/_components/log/InputDateLegacy";
import InputModelName from "@/app/_components/log/InputModelName";
import InputPcType from "@/app/_components/log/InputPcType";
import InputSerial from "@/app/_components/log/InputSerial";
import { useRef, useState } from "react";
import OkButton from "@/app/_components/common/input/button/OkButton";
import SupabaseService from "@/api/supabase/supabaseApi";
import InputDate from "@/app/_components/log/InputDate";
import { usePathname, useRouter } from "next/navigation";
import InputLog from "@/app/_components/log/new/InputLog";
import InputDropDown from "@/app/_components/log/new/InputDropDown";
import { PC_BRAND_OPTIONS, PC_HP_DESKTOP_MODEL_OPTIONS, PC_HP_NOTEBOOK_MODEL_OPTIONS, PC_LG_NOTEBOOK_MODEL_OPTIONS, PC_TYPE_OPTIONS } from "@/app/constants/objects";
import InputTextArea from "@/app/_components/log/new/InputTextArea";



export default function InputPcIn({workType}:{workType:string}) {
  // pc 자산 정보
  const [brand, setBrand] = useState<string>("");
  const [modelName, setModelName] = useState<string>("");  
  const [serial, setSerial] = useState<string>("");
  const [pcType, setPcType] = useState<string>("");
  const [firstStockDate, setFirstStockDate] = useState<string>("");
  const [manufactureDate, setManufactureDate] = useState<string>("");
  // 관리 로그 정보
  const [workDate, setWorkDate] = useState<string>("");
  const [requester, setRequester] = useState<string>("");
  const [securityCode, setSecurityCode] = useState<string>("");
  const [detailedDescription, setDetailedDescription] = useState<string>("");
  const [createdBy, setCreatedBy] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [usageCount, setUsageCount] = useState<number>(1);
  const [usageType, setUsageType] = useState<string>("");
  const [employeeWorkspace, setEmployeeWorkspace] = useState<string>("");
  const [employeeDepartment, setEmployeeDepartment] = useState<string>("");
  const [employeeName, setEmployeeName] = useState<string>("");
  // 추가 정보
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const ref = useRef<HTMLSelectElement>(null);
  const handlePcAssetCreation = async () => {
    setIsLoading(true);
    const supabaseService = SupabaseService.getInstance();
    
    // PC 자산 생성 및 관리 로그 추가하는 트랜잭션
    const result = await supabaseService.transaction([
      // PC 자산 추가
      async () => {
        return await supabaseService.insert({
          table: 'pc_assets',
          data: { 
            brand: "HP", 
            model_name: "Z4G5", 
            serial_number: "TEST441111", 
            pc_type: "데스크탑", 
            first_stock_date: workDate,
            manufacture_date: manufactureDate
          }
        });
      },
      
      // PC 자산이 성공적으로 추가되면 관리 로그 추가
      async () => {
        // 첫 번째 작업의 결과(PC 자산)에서 ID 가져오기
        const pcAsset = result.results[0].data[0];
        console.log(pcAsset,"pcAsset-ㅅㄷㄴㅅ")
        
        return await supabaseService.insert({
          table: 'pc_management_log',
          data: { 
            asset_id: pcAsset.asset_id, 
            work_type: workType, 
            work_date: workDate, 
            requester: requester, 
            security_code: securityCode, 
            detailed_description: detailedDescription, 
            created_by: createdBy, 
            created_at: createdAt,
            status : status,
            is_available : isAvailable,
            usage_count : usageCount,
            usage_type : "개인",
            employee_workspace : "홍길동",
            employee_department : "홍길동",
            employee_name : "홍길동"
          }
        });
      }
    ]);
    
    if (result.success) {
      console.log("PC 자산 및 관리 로그 추가 성공:", result.results);
      return result.results;
    } else {
      console.error("PC 자산 및 관리 로그 추가 실패:", result.error);
      return null;
    }
  };

  const handlePcAssetCreationTest = async () => {
    const supabaseService = SupabaseService.getInstance();
    
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
    console.log('입력완료')
    if (result.success) {
      supabaseService.insert({
        table: 'pc_management_log',
        data: {
          asset_id: result.data[0].id,
          work_type: "입고",
          work_date: workDate,
          requester: "홍길동",
          security_code: "A4003",
          detailed_description: "입고 처리",
          created_by: "홍길동",
          created_at: "2025-03-04",
          status : "new",
          is_available : true,
          usage_count : 0,// 사용 횟수 입고는 0으로
          usage_type : usageType,
          employee_workspace : employeeWorkspace,
          employee_department : employeeDepartment,
          employee_name : employeeName
        }
      });

      console.log("PC 입고 성공:", result.data);
      alert("PC 입고 완료");
      router.refresh();
      return result.data;
    } else {
      console.error("PC 자산 추가 실패:", result.error);
      alert("PC 자산 추가 실패");
      return null;
    }
  };
  
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
    <div className="text-lg font-bold px-4 sm:px-8 ">PC 자산 정보</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4 sm:px-8 mb-4">
       
       
        <InputDropDown
          label={"타입"}
          value={pcType}
          setValue={setPcType}
          ref={ref}
          options={PC_TYPE_OPTIONS}
        />
        <InputDropDown
          label={"브랜드"}
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
          label="최초입고일"
          type="date"
        />
      </div>
      <div className="text-lg font-bold px-4 sm:px-8 ">입력정보</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4 sm:px-8 mb-4">
        <InputDate
          label={"작업일"}
          value={workDate}
          setValue={setWorkDate}
          name="workDate"
          type="date"
        />
       <InputLog
         label={"의뢰인"}
         value={requester}
         setValue={setRequester}
       /> 
       <InputLog
         label={"보안코드"}
         value={securityCode}
         setValue={setSecurityCode}
       />
      
      
       {/* <InputLog
         label={"가동여부"}
         value={isAvailable}
         setValue={setIsAvailable}
       /> */}

       <InputLog
         label={"사용용도"}
         value={usageType}
         setValue={setUsageType}
       />
       <InputLog
         label={"사업장"}
         value={employeeWorkspace}
         setValue={setEmployeeWorkspace}
       />
       <InputLog
         label={"부서"}
         value={employeeDepartment}
         setValue={setEmployeeDepartment}
       />
       <InputLog
         label={"사용자"}
         value={employeeName}
         setValue={setEmployeeName}
       />
        <InputLog
         label={"작성자"}
         value={createdBy}
         setValue={setCreatedBy}
       />

     </div>
    
      {/* <div>
        <h3>디버깅 정보</h3>
        <p>brand: {brand}</p>
        <p>modelName: {modelName}</p>
        <p>serial: {serial}</p>
        <p>pcType: {pcType}</p>
        <p>workDate: {workDate}</p>
        <p>manufactureDate: {manufactureDate}</p>
        <p>isLoading: {isLoading}</p>
        
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

