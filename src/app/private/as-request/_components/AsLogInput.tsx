'use client';

import SupabaseService, { IPcManagementLog, IPcAsset } from "@/api/supabase/supabaseApi";
import OkButton from "@/app/_components/common/input/button/OkButton";
import CommonInputSingleCheckbox from "@/app/_components/common/input/CommonInputSingleCheckbox";
import InputDate from "@/app/_components/log/InputDate";
import InputLog from "@/app/_components/log/new/InputLog";
import InputTextArea from "@/app/_components/log/new/InputTextArea";
import { checkSerialNumber, fetchDataBySecurityCode, fetchEmployeeDataByName } from "@/app/utils/util";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import EmployeesSelectModal, { EmployeeData } from "../../_components/EmployeesSelectModal";

export default function AsLogInput({defaultWorkType}:{defaultWorkType:string}) {
  const { user } = useUser();
  const createdBy = user?.email;
  //workDate 초기값은 오늘 날짜, yyyy-mm-dd 형식
  const [workType, setWorkType] = useState<string|undefined>(defaultWorkType);
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeWorkspace, setEmployeeWorkspace] = useState<string|undefined>(undefined);
  const [employeeDepartment, setEmployeeDepartment] = useState<string|undefined>(undefined);
  const [employeeName, setEmployeeName] = useState<string|undefined>(undefined);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData|undefined>(undefined);
  const [employeeAsLogs, setEmployeeAsLogs] = useState<any[]>([]);
  const [modelName, setModelName] = useState<string|undefined>(undefined);

  // 선택된 직원의 AS 이력 가져오기
  useEffect(() => {
    const fetchEmployeeAsLogs = async () => {
      if (selectedEmployee?.이름) {
        try {
          const logs = await getEmployeeAsLog(selectedEmployee.이름);
          // logs가 배열인지 확인하고 설정
          if (Array.isArray(logs)) {
            setEmployeeAsLogs(logs);
          } else {
            setEmployeeAsLogs([]);
          }
        } catch (error) {
          console.error('AS 이력 가져오기 실패:', error);
          setEmployeeAsLogs([]);
        }
      } else {
        setEmployeeAsLogs([]);
      }
    };

    fetchEmployeeAsLogs();
  }, [selectedEmployee]);
  const [securityCode, setSecurityCode] = useState<string|undefined>(undefined);
  const [question, setQuestion] = useState<string|undefined>(undefined);
  const [serial, setSerial] = useState<string|undefined>(undefined);
  const [detailCategory, setDetailCategory] = useState<string|undefined>(undefined);
  const [category, setCategory] = useState<string|undefined>(undefined);
  const [format, setFormat] = useState<string|undefined>(undefined);
  const [detailedDescription, setDetailedDescription] = useState<string|undefined>(undefined);
  const [solutionDetail, setSolutionDetail] = useState<string|undefined>(undefined);
  // 기타 값
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  //H/W 로그 생성
    const handleHardWareLogCreation = async () => {
    const supabaseService = SupabaseService.getInstance();
    const logResult = await createDeviceLog(supabaseService);
    //4.페이지 새로고침
    router.refresh();
  }
  // S/W 로그 생성
  const handleSoftwareLogCreation = async () => {
    const supabaseService = SupabaseService.getInstance();
    const logResult = await createSoftwareLog(supabaseService);
    //4.페이지 새로고침
    router.refresh();
    console.log('S/W 로그 결과',logResult)
  }

  //네트워크 로그 생성
  const handleNetworkLogCreation = async () => {
    const supabaseService = SupabaseService.getInstance();
    const logResult = await createNetworkLog(supabaseService);
    //4.페이지 새로고침
    router.refresh();
    console.log('네트워크 로그 결과',logResult)
  }

  
  // 기타 로그 생성
  const handleOtherLogCreation = async () => {
    const supabaseService = SupabaseService.getInstance();
    const logResult = await createOtherLog(supabaseService);
    //4.페이지 새로고침
    router.refresh();
  }

  //작성 버튼 입고 반납 구분
  const handleWriteButton = () => {
   
    if(workType==="H/W"){
      handleHardWareLogCreation();
    }
    if(workType==="S/W"){
      handleSoftwareLogCreation();
    }
    if(workType==="네트워크"){
      handleNetworkLogCreation();
    }
    
    if(workType==="기타"){
      handleOtherLogCreation();
    }
  }

    // S/W 로그 생성
    const createSoftwareLog = async (supabaseService:SupabaseService) => {
      console.log('S/W 로그 시작')
      const logResult = await supabaseService.insert({
        table: 'as_management_log',
        data: {
            work_type: workType,
            work_date: workDate, //반납일
            model_name : modelName,
            created_by: createdBy,
            employee_workspace : employeeWorkspace,
            employee_department : employeeDepartment,
            employee_name : employeeName,
            category : category,
            question : question,
            solution_detail : solutionDetail,
            detailed_description: detailedDescription,
        }
      })
      console.log('S/W 결과',logResult)
      if(logResult.success){
        alert('S/W 완료');
        setDefault();
        return logResult.data;
      }else{
        alert('S/W 실패');
        console.error('S/W 실패:', logResult);
        return null;
      }
    }
    //네트워크 로그 생성
    const createNetworkLog = async (supabaseService:SupabaseService) => {
      console.log('네트워크 로그 시작')
      const logResult = await supabaseService.insert({
        table: 'as_management_log',
        data: {
          work_type: workType,
          work_date: workDate, //반납일
          model_name : modelName,
          created_by: createdBy,
          employee_workspace : employeeWorkspace,
          employee_department : employeeDepartment,
          employee_name : employeeName,
          question : question,
          solution_detail : solutionDetail,
          detailed_description: detailedDescription,
        }     
      })
      console.log('네트워크 결과',logResult)
      if(logResult.success){
        alert('네트워크 완료');
        setDefault();
        return logResult.data;
      }else{
        alert('네트워크 실패');
        console.error('네트워크 실패:', logResult);
        return null;
      }
    } 

    //H/W 로그 생성
    const createDeviceLog = async (supabaseService:SupabaseService) => {
      console.log('H/W 로그 시작')
      const logResult = await supabaseService.insert({
        table: 'as_management_log',
        data: {
          work_type: workType,
          work_date: workDate, //반납일
          model_name : modelName,
          created_by: createdBy,
          employee_workspace : employeeWorkspace,
          employee_department : employeeDepartment,
          employee_name : employeeName,
          category : category,
          detail_category : detailCategory,
          question : question,
          detailed_description: detailedDescription,
          solution_detail : solutionDetail,
          security_code : securityCode,
        } 
      })
      console.log('H/W 결과',logResult)
      if(logResult.success){
        alert('H/W 완료');
        setDefault();
          return logResult.data;
      }else{
        alert('H/W 실패');
        console.error('H/W 실패:', logResult);
        return null;
      }

    }
    // 기타 로그 생성
    const createOtherLog = async (supabaseService:SupabaseService) => {
      console.log('기타 로그 시작')
      const logResult = await supabaseService.insert({
        table: 'as_management_log',
        data: {
          work_type: workType,
          work_date: workDate, //반납일
          model_name : modelName,
          created_by: createdBy,
          employee_workspace : employeeWorkspace,
          employee_department : employeeDepartment,
          employee_name : employeeName,
          question : question,
          detailed_description: detailedDescription,
          solution_detail : solutionDetail,
        }
      })
      console.log('기타 결과',logResult)
      if(logResult.success){
        alert('기타 완료');
        setDefault();
        return logResult.data;
      }else{
        alert('기타 실패');
        console.error('기타 실패:', logResult);
        return null;
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
    const setDefault = () => {
          setEmployeeWorkspace(undefined);
          setEmployeeDepartment(undefined);
          setEmployeeName(undefined);
          setModelName(undefined);
          setSecurityCode(undefined);
          setQuestion(undefined);
          setSerial(undefined);
          setDetailCategory(undefined);
          setCategory(undefined);
          setFormat(undefined);
          setDetailedDescription(undefined);
          setSolutionDetail(undefined);
          setIsModalOpen(false);
          setIsLoading(false);
          setEmployeeData([]);
          setEmployeeWorkspace(undefined);
          setEmployeeDepartment(undefined);
          setEmployeeName(undefined);
    }

    const getEmployeeAsLog = async (employeeName:string|undefined): Promise<EmployeeData|null> => {
      const supabaseService = SupabaseService.getInstance();
      const { success, error, data } = await supabaseService.select({
        table: 'as_management_log',
        columns: '*',
        match: { employee_name: employeeName },
        order: { column: 'work_date', ascending: false }
      });
      console.log('as_management_log',data)
      if (success) {
        return data;
      } else {
        console.error('Error fetching as_management_log:', error);
        return null;
      }
    };
    return (
        <>
        <EmployeesSelectModal employeeData={employeeData} setSelectedEmployee={setSelectedEmployee} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} setEmployeeDepartment={setEmployeeDepartment} setEmployeeName={setEmployeeName}/>
        
        <div className="text-sm font-semibold text-gray-700 px-4 sm:px-8 my-2">
          <div className="flex flex-row items-center gap-2">
              <h1>{workType} 이력 작성</h1>
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
            {/* 사용자 */}
            <InputLog
              label={"사용자"}
              value={employeeName}
              setValue={setEmployeeName}
              onKeyDown={()=>handleEmployeeDataByName(employeeName??"")}
            />  
          
           
            {/* 부서 */}
            <InputLog
              label={"부서"}
              value={employeeDepartment}
              setValue={setEmployeeDepartment}
            />
             {/* 사업장 */}
           <InputLog
              label={"사업장"}
              value={employeeWorkspace}
              setValue={setEmployeeWorkspace}
            />
            {/* 모델명 */}
            <InputLog
              label={"모델명"}
              value={modelName}
              setValue={setModelName}
            />  
       
            {/* 증상 */}

         </div>

         <div className="flex flex-col gap-4 mb-4 rounded-lg  m-8">
         <div className="flex flex-col gap-y-4">
              {/* 작업유형 */}
              <CommonInputSingleCheckbox 
                title={"작업유형"}
                value={workType??""}
                setValue={setWorkType}
                options={["H/W","S/W","네트워크","기타"]}
              />
          </div>


            {/* 작업유형 별 개별 값 시작*/}
            

            {/* {workType==="H/W"&& */}
         
            {workType==="S/W"&&
            <div className="flex flex-col gap-y-4">
              {/* 소프트웨어 페이지 */}
              {/* 보안 프로그램 */}
              <CommonInputSingleCheckbox 
                title={"분류"}
                value={category??""}
                setValue={setCategory}
                options={["보안","프로그램","OS/성능","기타"]}
              />
            </div>
            }
          
       


            {workType==="H/W"&&
            <div className="flex flex-col gap-y-4">
              {/* H/W 분류 */}
              <CommonInputSingleCheckbox 
                title={"분류"}
                value={category??""}
                setValue={setCategory}
                options={["PC","모니터","프린터","소모품"]}
              />
            </div>
            }
            {category==="PC"&&
            <div className="flex flex-col gap-y-4">
              {/* 하드웨어 페이지 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <InputLog
                  label={"보안코드"}
                  value={securityCode}
                  setValue={setSecurityCode}
                  onKeyDown={()=>fetchDataBySecurityCode(securityCode??"",setEmployeeWorkspace,setEmployeeDepartment,setEmployeeName,setModelName,setSerial)}
                  placeholder=""
                />
                </div>
            </div>
            }
            </div>


            {/* 문의내용 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 sm:px-8 mb-4">
            <InputLog
              label={"문의내용"}
              value={question}
              setValue={setQuestion}
            />
          {/* 해결방법 */}
          <div className="px-4 sm:px-8 mb-4">
            <InputLog
              label={"조치내용"}
              value={solutionDetail}
              setValue={setSolutionDetail}
            />
          </div>
          </div>
          <div className="w-full mb-4 px-4 sm:px-8">
           <InputTextArea
             label={"상세설명"}
             value={detailedDescription}
             setValue={setDetailedDescription}
             placeholder={""}
           />
          </div>
          <div className="w-full flex justify-end mb-4 px-4 sm:px-8">
            <div className="w-72 flex flex-row gap-2">
            <OkButton
              onClick={()=>router.push(`/private/as-request`)}
              isLoading={isLoading}
              buttonText={"뒤로가기"}
              color={"yellow"}
            />
            <OkButton
              onClick={handleWriteButton}
              isLoading={isLoading}
              buttonText={"작성"}
              color={"blue"}
            />
            </div>
          </div>
          
        {selectedEmployee&&
        <div>
          <div className="mt-6 px-4 sm:px-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">{selectedEmployee.이름}님의 이전 AS 이력</h4>
            {employeeAsLogs.length > 0 ? (
              <div className="space-y-4">
                {employeeAsLogs.map((item: any, index: number) => (
                  <Link 
                    key={item.id || index}
                    href={`/private/as-request/${
                      item.work_type === "H/W" ? "hardware" : 
                      item.work_type === "S/W" ? "software" : 
                      item.work_type === "네트워크" ? "network" : "other"
                    }/detail/${item.log_id}`}
                    className="block bg-white border border-gray-300 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                        item.work_type === "H/W" ? "bg-blue-100 text-blue-800" : 
                        item.work_type === "S/W" ? "bg-orange-100 text-orange-800" : 
                        item.work_type === "네트워크" ? "bg-green-100 text-green-800" : 
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {item.work_type}
                      </span>
                      <span className="text-sm text-gray-600 font-medium">
                        {item.work_date ? new Date(item.work_date).toLocaleDateString('ko-KR') : '-'}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="text-base font-semibold text-gray-800">
                        {item.model_name || '모델명 없음'}
                      </div>
                      {item.question && (
                        <div className="bg-blue-50 p-3 rounded-md">
                          <div className="text-sm font-medium text-blue-800 mb-1">문의내용</div>
                          <div className="text-sm text-gray-700">{item.question}</div>
                        </div>
                      )}
                      {item.solution_detail && (
                        <div className="bg-green-50 p-3 rounded-md">
                          <div className="text-sm font-medium text-green-800 mb-1">조치내용</div>
                          <div className="text-sm text-gray-700">{item.solution_detail}</div>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-base text-gray-500 text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                이전 AS 이력이 없습니다
              </div>
            )}
          </div>
        </div>
          
          }
        </>
    )
  }
