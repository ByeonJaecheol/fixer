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
import { useState } from "react";
import EmployeesSelectModal, { EmployeeData } from "../../_components/EmployeesSelectModal";
import { FormatFormData } from "./formatFormData";

export default function AsLogInput({workType}:{workType:string}) {
  const { user } = useUser();
  const createdBy = user?.email;
  //workDate 초기값은 오늘 날짜, yyyy-mm-dd 형식
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
  const [category, setSecurityProgram] = useState<string|undefined>(undefined);
  const [format, setFormat] = useState<string|undefined>(undefined);
  const [detailedDescription, setDetailedDescription] = useState<string|undefined>(undefined);
  // 기타 값
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
       // OS 설치 정보
       const [formData, setFormData] = useState({
        pcDescription: '',
        pcName: '',
        alYac: '',
        jaSan: '',
        printer: '',
        outlook: '',
        program: ''
      });

  // H/W 로그 생성
  const handleHardWareLogCreation = async () => {
    const supabaseService = SupabaseService.getInstance();
    //1.제조 조회
    const existingAsset = await checkSerialNumber(supabaseService,serial);
    console.log('existingAsset',existingAsset)
    // 제조 번호 존재하지 않을시 pc 자산 생성
    // 반납 로그 생성 - 아직 pc_asset 에 등록되지 않은 반납 pc 일 경우
    if (!existingAsset||existingAsset.length===0) {
      console.log('제조 번호 존재하지 않으므로 자산생성 시작')
      alert('제조번호가 존재하지 않습니다. PC등록 후 사용 해주세요.')
      return;
    }else{
      // 제조 번호 존재하는 경우
      //2. 기존 asset_id 존재하는 PC에 대한 반납 로그 생성
      const logResult = await createHardWareLog(supabaseService);
      console.log('하드웨어 로그 결과',logResult)
      //3. 반납  로그 등록
      const changeCodeResult = await  createPcLogChangeCode(existingAsset[0],supabaseService);
      updatePcAssetsSecurityCode(existingAsset[0].asset_id,newSecurityCode,supabaseService);
      //4.페이지 새로고침
      router.refresh();
      console.log('하드웨어 로그 결과',logResult)
      console.log('코드변경 로그 결과',changeCodeResult)
    }
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

  //장비관리 로그 생성
  const handleDeviceLogCreation = async () => {
    const supabaseService = SupabaseService.getInstance();
    const logResult = await createDeviceLog(supabaseService);
    //4.페이지 새로고침
    router.refresh();
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
    if(workType==="H/W"&&!serial){
      alert('제조 번호를 입력해주세요.');
      return;
    }
    if(workType==="H/W"){
      handleHardWareLogCreation();
    }
    if(workType==="S/W"){
      handleSoftwareLogCreation();
    }
    if(workType==="네트워크"){
      handleNetworkLogCreation();
    }
    if(workType==="장비관리"){
      handleDeviceLogCreation();
    }
    if(workType==="기타"){
      handleOtherLogCreation();
    }
  }

    // H/W 로그 생성
    const createHardWareLog = async (supabaseService:SupabaseService) => {
      console.log('H/W 로그 시작')
      const logResult = await supabaseService.insert({
          table: 'as_management_log',
          data: {
            work_type: workType,
            work_date: workDate, //반납일
            created_by: createdBy,
            model_name : modelName,
            serial_number : serial,
            security_code : securityCode,
            new_security_code : newSecurityCode,
            detailed_description: detailedDescription,
            employee_workspace : employeeWorkspace,
            employee_department : employeeDepartment,
            employee_name : employeeName,
            question : question,
            detail_category : detailCategory,
          }
        });
        console.log('H/W 결과',logResult)
        if(logResult.success){
          alert('H/W 완료');
          //
          return logResult.data;
        }else{
          alert('H/W 실패');
          console.error('H/W 실패:', logResult);
          return null;
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
            detailed_description: detailedDescription,
            format : formData,
        }
      })
      console.log('S/W 결과',logResult)
      if(logResult.success){
        alert('S/W 완료');
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
          detailed_description: detailedDescription,
        }     
      })
      console.log('네트워크 결과',logResult)
      if(logResult.success){
        alert('네트워크 완료');
        return logResult.data;
      }else{
        alert('네트워크 실패');
        console.error('네트워크 실패:', logResult);
        return null;
      }
    } 

    //장비관리 로그 생성
    const createDeviceLog = async (supabaseService:SupabaseService) => {
      console.log('장비관리 로그 시작')
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
        } 
      })
      console.log('장비관리 결과',logResult)
      if(logResult.success){
        alert('장비관리 완료');
          return logResult.data;
      }else{
        alert('장비관리 실패');
        console.error('장비관리 실패:', logResult);
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
        }
      })
      console.log('기타 결과',logResult)
      if(logResult.success){
        alert('기타 완료');
        return logResult.data;
      }else{
        alert('기타 실패');
        console.error('기타 실패:', logResult);
        return null;
      }
    }
    //보안코드 변경 로그 생성 - pc_Managemnet_log
    const createPcLogChangeCode = async (assetData : IPcAsset, supabaseService:SupabaseService) => {
      const logResult = await supabaseService.insert({
            table: 'pc_management_log',
            data: {
              asset_id: assetData.asset_id,
              work_type: "변경",
              work_date: workDate,
              created_by: createdBy,
              security_code : newSecurityCode,
              detailed_description: detailedDescription,
              employee_workspace : employeeWorkspace,
              employee_department : employeeDepartment,
              employee_name : employeeName,
            }
        });
        console.log('변경 로그 결과',logResult)
        if(logResult.success){
          alert('변경 완료');
          

          return logResult.data;
        }else{
          alert('변경 실패');
          console.error('변경 실패:', logResult);
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


  // pc_assets 테이블 보안코드 변경 업데이트
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
      console.log('기존 보안코드',existingCodes)
      console.log('기존 보안코드 타입',typeof existingCodes)
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
      if(workType==="H/W"){
      // pc 자산정보 세팅
      //null 또는 undefined 대응
      setModelName(existingAsset[0].model_name?existingAsset[0].model_name:"////");
      setSerial(existingAsset[0].serial_number?existingAsset[0].serial_number:"");
      setSecurityCode(existingAsset[0].security_code?existingAsset[0].security_code[0]:"");
      }   
      //pc_management_log 테이블에서 제조번호가 일치하는 가장 최근 log 조회
      const { data: existingLog, error: existingLogError } = await supabaseService.select({
              table: 'pc_management_log',
              columns: '*',
              // asset_id가  work_type 이 설치 혹은 반납인 경우
              match: { asset_id: existingAsset[0].asset_id },
              limit: 1
            });
            const result : IPcManagementLog = existingLog[0];
            if(!result){
              alert('최근 로그 조회 실패');
              return;
            }
            console.log('최근 로그 결과',result)
            // 사업장과 부서 세팅
            setEmployeeWorkspace(result.employee_workspace?result.employee_workspace:"");
            setEmployeeDepartment(result.employee_department?result.employee_department:"");
            setEmployeeName(result.employee_name?result.employee_name:"");
    }

    return (
        <>
        <EmployeesSelectModal employeeData={employeeData} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} setEmployeeDepartment={setEmployeeDepartment} setEmployeeName={setEmployeeName}/>
        
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
              onKeyDown={()=>handleEmployeeDataByName(employeeName??"")}
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
                    onKeyDown={()=>setPcAssetInfo(serial??"")}
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
                <CommonInputSingleCheckbox 
                  title={"분류"}
                  value={category??""}
                  setValue={setSecurityProgram}
                  options={["보안","프로그램","OS","바이러스"]}
                />
              </div>
            }
            {category==="OS"&&
             <div className="flex flex-col gap-y-4">
                {/* 소프트웨어 페이지 */}
                {/* 보안 프로그램 */}
                <CommonInputSingleCheckbox 
                  title={""}
                  value={format??""}
                  setValue={setFormat}
                  options={["OS설치","그 외"]}
                />
              </div>
            }
            {format==="OS설치"&&
              <FormatFormData formData={formData} setFormData={setFormData}/>
            }

            {workType==="장비관리"&&
              <div className="flex flex-col gap-y-4">
                <h3 className="font-bold text-sm">장비관리 선택항목</h3>
                {/* 소프트웨어 페이지 */}
                {/* 보안 프로그램 */}
                <CommonInputSingleCheckbox 
                  title={"분류"}
                  value={category??""}
                  setValue={setSecurityProgram}
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
                  value={detailCategory??""}
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
          <div className="w-full flex justify-end mb-4 px-4 sm:px-8">
            <div className="w-36 ">
            <OkButton
              onClick={handleWriteButton}
              isLoading={isLoading}
              buttonText={"작성"}
              color={"blue"}
            />
            </div>
          </div>
          
        </>
    )
  }
