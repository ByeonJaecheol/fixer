'use client';

import SupabaseService, { IAssetLog, IPcAsset } from "@/api/supabase/supabaseApi";
import OkButton from "@/app/_components/common/input/button/OkButton";
import CommonInputSingleCheckbox from "@/app/_components/common/input/CommonInputSingleCheckbox";
import InputDate from "@/app/_components/log/InputDate";
import InputLog from "@/app/_components/log/new/InputLog";
import InputTextArea from "@/app/_components/log/new/InputTextArea";
import { supabase } from "@/app/utils/supabase";
import { checkSerialNumber } from "@/app/utils/util";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AsLogInput({workType}:{workType:string}) {
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

  const [detailedDescription, setDetailedDescription] = useState<string|undefined>(undefined);
  // 기타 값
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const [createdBy, setCreatedBy] = useState("")

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
      //4.페이지 새로고침
      router.refresh();
      console.log('하드웨어 로그 결과',logResult)
      console.log('코드변경 로그 결과',changeCodeResult)
    }
  }

  //작성 버튼 입고 반납 구분
  const handleWriteButton = () => {
    if(!serial){
      alert('제조 번호를 입력해주세요.');
      return;
    }
    if(workType==="H/W"){
      handleHardWareLogCreation();
    }
    if(workType==="S/W"){
    }
    if(workType==="네트워크"){
    }
    if(workType==="장비관리"){
    }
    if(workType==="기타"){
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
            created_by: 'pcsub1@ket.com',
            serial_number : serial,
            security_code : securityCode,
            new_security_code : newSecurityCode,
            detailed_description: detailedDescription,
            employee_workspace : employeeWorkspace,
            employee_department : employeeDepartment,
            employee_name : employeeName,
            category : category,
            detail_category : detailCategory,
          }
        });
        console.log('H/W 결과',logResult)
        if(logResult.success){
          alert('H/W 완료');
          return logResult.data;
        }else{
          alert('H/W 실패');
          console.error('H/W 실패:', logResult);
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
              created_by: "pcsub1@ket.com",
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

   // 보안코드로 로그 및 자산 정보 조회 함수
   const fetchDataBySecurityCode = async (securityCode: string) => {
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
                    onKeyDown={()=>fetchDataBySecurityCode(securityCode??"")}
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
                  options={["보안","프로그램","OS","바이러스","IE","드라이버"]}
                />
              </div>
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
            />
            </div>
          </div>
          
        </>
    )
  }
