'use client';

import SupabaseService from "@/api/supabase/supabaseApi";
import OkButton from "@/app/_components/common/input/button/OkButton";
import CommonInputSingleCheckbox from "@/app/_components/common/input/CommonInputSingleCheckbox";
import InputDate from "@/app/_components/log/InputDate";
import InputLog from "@/app/_components/log/new/InputLog";
import InputTextArea from "@/app/_components/log/new/InputTextArea";
import { fetchDataBySecurityCode } from "@/app/utils/util";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormatFormData } from "./formatFormData";
type LogType = {
  pcDescription: string;
  pcName: string;
  alYac: string;
  jaSan: string;
  printer: string;
  outlook: string;
  program: string;
};

interface IHardwareLogEntry {
    category: string | null;
    created_at: string; // ISO8601 형식의 날짜 문자열
    created_by: string;
    detail_category: string | null;
    detailed_description: string;
    employee_department: string;
    employee_name: string;
    employee_workspace: string;
    log_id: number;
    model_name: string;
    new_security_code: string;
    question: string;
    security_code: string;
    serial_number: string;
    work_date: string; // YYYY-MM-DD 형식의 날짜 문자열
    work_type: "H/W" | "S/W" | string; // 특정 타입을 제한하려면 여기에 추가
    format: string;
  }
export default function AsLogDetailInput({log}:{log: IHardwareLogEntry}) {
    const workType = log.work_type;
    const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
    const [employeeWorkspace, setEmployeeWorkspace] = useState<string|undefined>(undefined);
    const [employeeDepartment, setEmployeeDepartment] = useState<string|undefined>(undefined);
    const [employeeName, setEmployeeName] = useState<string|undefined>(undefined);
    const [modelName, setModelName] = useState<string|undefined>(undefined);
    const [securityCode, setSecurityCode] = useState<string|undefined>(undefined);
    const [newSecurityCode, setNewSecurityCode] = useState<string|undefined>(undefined);
    const [question, setQuestion] = useState<string|undefined>(undefined);
    const [serial, setSerial] = useState<string|undefined>(undefined);
    const [detailCategory, setDetailCategory] = useState<string|undefined>(undefined);
    const [category, setCategory] = useState<string|undefined>(undefined);

  
    const [detailedDescription, setDetailedDescription] = useState<string|undefined>(undefined);
    // 기타 값
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const router = useRouter();
    const [createdBy, setCreatedBy] = useState("")
    const [formData, setFormData] = useState<LogType>({
        pcDescription: '',
        pcName: '',
        alYac: '',
        jaSan: '',
        printer: '',
        outlook: '',
        program: ''
    });

   

    console.log("★log",log.format);
    useEffect(() => {
        console.log("detail useEffect 시작",);
        setWorkDate(log.work_date);
        setEmployeeWorkspace(log.employee_workspace);
        setEmployeeDepartment(log.employee_department);
        setEmployeeName(log.employee_name);
        setModelName(log.model_name);
        setSecurityCode(log.security_code);
        setNewSecurityCode(log.new_security_code);
        setQuestion(log.question);
        setSerial(log.serial_number);
        setDetailCategory(log.detail_category ?? "");
        setCategory(log.category ?? "");
        setDetailedDescription(log.detailed_description);

         // log.format 데이터 처리
    try {
      // 전체 format 데이터를 먼저 파싱
      if(!log.format){
        return;
      }

      const parseLogValue : LogType = JSON.parse(log.format);
      
      // 파싱된 데이터로 formData 설정
      setFormData({
          pcDescription: parseLogValue.pcDescription || "",
          pcName: parseLogValue.pcName || "",
          alYac: parseLogValue.alYac || "",
          jaSan: parseLogValue.jaSan || "",
          printer: parseLogValue.printer || "",
          outlook: parseLogValue.outlook || "",
          program: parseLogValue.program || ""
      });
  } catch (error) {
      console.error('데이터 파싱 에러:', error);
      // 에러 발생 시 기본값 설정
      setFormData({
          pcDescription: "",
          pcName: "",
          alYac: "",
          jaSan: "",
          printer: "",
          outlook: "",
          program: ""
      });
  }
    }, []);

    // 하드웨어 로그 수정
    const updateHardwareLog = async () => {
        const supabaseService = SupabaseService.getInstance();
        const logResult = await supabaseService.update({
            table: 'as_management_log',
            data: {
                work_date: workDate,
                employee_workspace : employeeWorkspace,
                employee_department : employeeDepartment,
                employee_name : employeeName,
                model_name : modelName,
                serial_number : serial,
                security_code : securityCode,
                new_security_code : newSecurityCode,
                question : question,
                detailed_description: detailedDescription,
            },
            match: {
                log_id: log.log_id
            }
        })
        console.log("★★★★★★★★★",logResult)
        if(logResult.success){
            alert('수정 완료');
            return logResult.data;
        }else{
            alert('수정 실패');
            console.error('수정 실패:', logResult);
            return null;
        }
    }
    // 소프트웨어 로그 수정 
    const updateSoftwareLog = async () => {
        const supabaseService = SupabaseService.getInstance();
        const logResult = await supabaseService.update({
            table: 'as_management_log',
            data: {
                work_date: workDate,
                employee_workspace : employeeWorkspace,
                employee_department : employeeDepartment,
                employee_name : employeeName,
                model_name : modelName,
                category : category,
                question : question,
                detailed_description: detailedDescription,
                format : JSON.stringify(formData),
            },
            match: {
                log_id: log.log_id
            }
        })
        console.log("★★★★★★★★★",logResult)
        if(logResult.success){
            alert('수정 완료');
            return logResult.data;
        }else{
            alert('수정 실패');
            console.error('수정 실패:', logResult);
            return null;
        }
    }
    // 네트워크 로그 수정
    const updateNetworkLog = async () => {
        const supabaseService = SupabaseService.getInstance();
        const logResult = await supabaseService.update({
            table: 'as_management_log',
            data: {
                work_date: workDate,
                employee_workspace : employeeWorkspace,
                employee_department : employeeDepartment,
                employee_name : employeeName,
                model_name : modelName,
                question : question,
                detailed_description: detailedDescription,
            },
            match: {
                log_id: log.log_id
            }
        })
        console.log("★★★★★★★★★",logResult) 
        if(logResult.success){
            alert('수정 완료');
            return logResult.data;
        }else{
            alert('수정 실패');
            console.error('수정 실패:', logResult);
            return null;
        }
    }

    // 장비관리 로그 수정
    const updateDeviceLog = async () => {
        const supabaseService = SupabaseService.getInstance();
        const logResult = await supabaseService.update({
            table: 'as_management_log',
            data: {
                work_date: workDate,
                employee_workspace : employeeWorkspace,
                employee_department : employeeDepartment,
                employee_name : employeeName,
                model_name : modelName,
                category : category,
                detail_category : detailCategory,
                question : question,
                detailed_description: detailedDescription,
            },
            match: {
                log_id: log.log_id
            }
        })
        console.log("★★★★★★★★★",logResult)
        if(logResult.success){
            alert('수정 완료');
            return logResult.data;
        }else{
            alert('수정 실패');
            console.error('수정 실패:', logResult);
            return null;
        }
    }
    // 기타 로그 수정
    const updateOtherLog = async () => {
        const supabaseService = SupabaseService.getInstance();
        const logResult = await supabaseService.update({
            table: 'as_management_log',
            data: {
                work_date: workDate,
                employee_workspace : employeeWorkspace,
                employee_department : employeeDepartment,
                employee_name : employeeName,
                model_name : modelName,
                question : question,
                detailed_description: detailedDescription,
            },
            match: {
                log_id: log.log_id
            }
        })
        console.log("★★★★★★★★★",logResult)
        if(logResult.success){  
            alert('수정 완료');
            return logResult.data;
        }else{
            alert('수정 실패');
            console.error('수정 실패:', logResult);
            return null;
        }
    }


    const handleWriteButton = () => {
        console.log("★★★★★★★★★",log);
        if(workType==="H/W"){
            updateHardwareLog();
        }
        if(workType==="S/W"){
            updateSoftwareLog();
        }
        if(workType==="네트워크"){
            updateNetworkLog();
        }
        if(workType==="장비관리"){
            updateDeviceLog();
        }
        if(workType==="기타"){  
            updateOtherLog();
        }
    } 
    // 삭제 버튼 클릭 시 실행
    const handleDeleteButton = async () => {
        const supabaseService = SupabaseService.getInstance();
        const logResult = await supabaseService.delete({
            table: 'as_management_log',
            match: {
                log_id: log.log_id
            }
        })
        console.log("★★★★★★★★★",logResult)
        if(logResult.success){
            alert('삭제 완료');
            //해당 workType 페이지로 이동
            router.push(`/private/as-request/${workType==="H/W"?"hardware":workType==="S/W"?"software":workType==="네트워크"?"network":workType==="장비관리"?"device":"other"}`);
        }else{
            alert('삭제 실패');
            console.error('삭제 실패:', logResult);
        }
    }
    return (
        <>
        <div className="text-sm font-semibold text-gray-700 px-4 sm:px-8 my-2">
          <div className="flex flex-row items-center gap-2">
              <h1>{workType} 수리 정보</h1>
          </div>  
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4 sm:px-8 mb-4">
          <InputDate
              label={"작업일"}
              value={workDate}
              setValue={setWorkDate}
              name="workDate"
              type="date"
            />
            {/* 사업장 */}
            <InputLog

              label={"사업장"}
              value={employeeWorkspace}
              setValue={setEmployeeWorkspace}
            />
            {/* 부서 */}
            <InputLog
              label={"부서"}
              value={employeeDepartment}
              setValue={setEmployeeDepartment}
            />
            {/* 사용자 */}
            <InputLog
              label={"사용자"}
              value={employeeName}
              setValue={setEmployeeName}
            />  
            {/* 모델명 */}
            <InputLog
              label={"모델명"}
              value={modelName}
              setValue={setModelName}
            />  
       
            {/* 증상 */}
            <InputLog
              label={"문의내용"}
              value={question}
              setValue={setQuestion}
            />

          
         </div>
          {/* 작업유형 별 개별 값 시작*/}
          <div className="flex flex-col gap-4 mb-4 rounded-lg  m-8">

              {workType==="H/W"&&
              <div className="flex flex-col gap-y-4">
                  <h3 className="font-bold text-sm">H/W 선택항목</h3>
                  {/* 하드웨어 페이지 */}
                  {/* 제조번호 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <InputLog
                    label={"제조번호"}
                    value={serial}
                    setValue={setSerial}
                  />
                  <InputLog
                    label={"기존 보안코드"}
                    value={securityCode}
                    setValue={setSecurityCode}
                    onKeyDown={()=>fetchDataBySecurityCode(securityCode??"",setEmployeeWorkspace,setEmployeeDepartment,setEmployeeName,setModelName,setSerial)}
                    placeholder="보안코드 입력 후 엔터시 자동입력"
                  />
                  <InputLog
                    label={"신규 보안코드"}
                    value={newSecurityCode}
                    setValue={setNewSecurityCode}
                  />
                  </div>
              </div>
            } 
            {workType==="S/W"&&
              <div className="flex flex-col gap-y-4">
                <h3 className="font-bold text-sm">S/W 선택항목</h3>
                {/* 소프트웨어 페이지 */}
                {/* 보안 프로그램 */}
                {/*  */}
                <CommonInputSingleCheckbox 
                  title={"분류"}
                  value={log.category?log.category:category??"-"}
                  setValue={setCategory}
                  options={["보안","프로그램","OS","바이러스"]}
                />
              </div>
            }
            {category==="OS"&&log.format&&
              <div className="flex flex-col gap-y-4">
                <h3 className="font-bold text-sm">OS 선택항목</h3>
                <FormatFormData formData={formData} setFormData={setFormData}/>
              </div>
            }
            {workType==="장비관리"&&
              <div className="flex flex-col gap-y-4">
                <h3 className="font-bold text-sm">장비관리 선택항목</h3>
                {/* 소프트웨어 페이지 */}
                {/* 보안 프로그램 */}
                <CommonInputSingleCheckbox 
                  title={"분류"}
                  value={log.category?log.category:category??"-"}
                  setValue={setCategory}
                  options={["PC","모니터","프린터","소모품"]}
                />
              </div>
            }
            {(category==="PC"||category==="모니터")&&
              <div className="flex flex-col gap-y-4">
                {/* 소프트웨어 페이지 */}
                {/* 보안 프로그램 */}
                <CommonInputSingleCheckbox 
                  title={"세부항목"}
                  value={log.detail_category?log.detail_category:detailCategory??"-"}
                  setValue={setDetailCategory}
                  options={["설치","반납","폐기"]}
                />
              </div>
            }

          </div>
          {/* 작업유형 별 개별 값 끝 */}
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
             label={"조치내용"}
             value={detailedDescription}
             setValue={setDetailedDescription}
             placeholder={""}
           />
          </div>
          <div className="w-full flex justify-end mb-4 px-4 sm:px-8 gap-x-4">
          <div className="w-36 ">
            <OkButton
              onClick={handleDeleteButton}
              isLoading={isLoading}
              buttonText={"삭제"}
              color={"red"}
              />
            </div>
            <div className="w-36 ">
            <OkButton
              onClick={handleWriteButton}
              isLoading={isLoading}
              buttonText={"수정"}
              color={"blue"}
            />
            </div>
          </div>
          
        </>
    )
}


