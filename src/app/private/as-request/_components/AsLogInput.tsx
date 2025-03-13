export default function AsLogInput({workType}:{workType:string}) {
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
            
            {/* <InputDropDown
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
           */}
    
    
    
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
           {/* <InputTextArea
             label={"상세설명"}
             value={detailedDescription}
             setValue={setDetailedDescription}
             placeholder={workType==="입고"?"TIP : 입고는 새 PC 등록에만 사용됩니다":workType==="반납"?"반납 상세설명을 입력해주세요":workType==="설치"?"TIP : 설치는 기존 pc 자산이 있는 경우에만 입력 가능합니다. 반납 혹은 입고로 PC자산을 생성 후 시도 하십시오.":workType==="폐기"?"TIP : 폐기는 기존 pc 자산이 있는 경우에만 입력 가능합니다. 폐기 확정인 경우에만 이용해주세요.":"-"}
           /> */}
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
