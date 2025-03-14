'use client';

import CommonInputMultiCheckbox from "@/app/_components/common/input/CommonInputMultiCheckbox";
import InputDate from "@/app/_components/log/InputDate";
import InputLog from "@/app/_components/log/new/InputLog";
import InputTextArea from "@/app/_components/log/new/InputTextArea";
import { useState } from "react";

export default function AsLogInput({workType}:{workType:string}) {
  //workDate 초기값은 오늘 날짜, yyyy-mm-dd 형식
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [employeeWorkspace, setEmployeeWorkspace] = useState<string|undefined>(undefined);
  const [employeeDepartment, setEmployeeDepartment] = useState<string|undefined>(undefined);
  const [employeeName, setEmployeeName] = useState<string|undefined>(undefined);
  const [modelName, setModelName] = useState<string|undefined>(undefined);
  const [symptom, setSymptom] = useState<string|undefined>(undefined);
  const [serial, setSerial] = useState<string|undefined>(undefined);
  const [program, setProgram] = useState<string[]>([]);
  const [securityProgram, setSecurityProgram] = useState<string[]>([]);

  const [detailedDescription, setDetailedDescription] = useState<string|undefined>(undefined);

    return (
        <>
        <div className="text-sm font-semibold text-gray-700 px-4 sm:px-8 my-2">
          <div className="flex flex-row items-center gap-2">
          <h1>{workType} 수리 정보</h1>
          {/* {workType==="입고"&&
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
          } */}
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
              label={"증상"}
              value={symptom}
              setValue={setSymptom}
            />

          
         </div>
          {/* 작업유형 별 개별 값 시작*/}
          <div className="flex flex-col gap-4 mb-4 rounded-lg  m-8">

            <div className="">
              {/* 제조번호 */}
              {workType==="H/W"&&
              <InputLog
                label={"제조번호"}
                value={serial}
                setValue={setSerial}
              />
            } 
            </div>
            {workType==="S/W"&&
            <div className="flex flex-col gap-y-4">
              <h3 className="font-bold">S/W 선택항목</h3>
              {/* 보안 프로그램 */}
              <CommonInputMultiCheckbox 
                title={"보안 프로그램 선택"}
                value={securityProgram}
                setValue={setSecurityProgram}
                options={["Fasoo DRM","IT자산","ALYAC","ECM","Printer Chaser","Cert","Nac"]}
              />
              {/* 프로그램 선택 */}
              <CommonInputMultiCheckbox 
                title={"설치 프로그램 선택"}
                value={program}
                setValue={setProgram}
                options={["캐드2006","캐드2010","캐드2011","캐드2013","캐드2020","크레오","오피스","한글", "PDF"]}
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
             label={"상세설명"}
             value={detailedDescription}
             setValue={setDetailedDescription}
             placeholder={""}
           />
          </div>
          <div className="w-full flex justify-end mb-4 px-4 sm:px-8">
            {/* <div className="w-36 ">
            <OkButton
              onClick={handleWriteButton}
              isLoading={isLoading}
              buttonText={workType==="입고"?"입고":workType==="반납"?"반납":workType==="설치"?"설치":workType==="폐기"?"폐기":"-"}
            /> */}
            </div>
        </>
    )
}
