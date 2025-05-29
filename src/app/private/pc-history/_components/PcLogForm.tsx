'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import SupabaseService, { IPcManagementLog } from '@/api/supabase/supabaseApi';
import OkButton from '@/app/_components/common/input/button/OkButton';
import InputDate from '@/app/_components/log/InputDate';
import InputDropDown from '@/app/_components/log/new/InputDropDown';
import InputLog from '@/app/_components/log/new/InputLog';
import InputTextArea from '@/app/_components/log/new/InputTextArea';
import { 
  PC_AVAILABLE_TYPE_OPTIONS, 
  PC_BRAND_OPTIONS, 
  PC_HP_DESKTOP_MODEL_OPTIONS, 
  PC_HP_NOTEBOOK_MODEL_OPTIONS, 
  PC_INSTALL_STATUS_OPTIONS, 
  PC_INSTALL_TYPE_OPTIONS, 
  PC_LG_DESKTOP_MODEL_OPTIONS, 
  PC_LG_NOTEBOOK_MODEL_OPTIONS, 
  PC_LOCATION_TYPE_OPTIONS, 
  PC_SAMSUNG_DESKTOP_MODEL_OPTIONS, 
  PC_SAMSUNG_NOTEBOOK_MODEL_OPTIONS, 
  PC_STATUS_OPTIONS, 
  PC_TYPE_OPTIONS, 
  PC_USAGE_TYPE_OPTIONS 
} from '@/app/constants/objects';
import EmployeesSelectModal, { EmployeeData } from '@/app/private/_components/EmployeesSelectModal';
import { checkSerialNumber, fetchEmployeeDataByName, generateSecurityCode } from '@/app/utils/util';
import { IDB_ASSET_LOG_DATA } from '@/app/constants/interfaces';

// 작업 유형 옵션
const WORK_TYPE_OPTIONS = [
  { value: '입고', label: '입고' },
  { value: '출고', label: '출고' },
  { value: '반납', label: '반납' },
  { value: '폐기', label: '폐기' },
  { value: '변경', label: '변경' }
];

interface PcLogFormProps {
  mode: 'create' | 'edit';
  defaultWorkType?: string;
  log?: IDB_ASSET_LOG_DATA;
}

export default function PcLogForm({ mode, defaultWorkType, log }: PcLogFormProps) {
  const { user } = useUser();
  const router = useRouter();
  const ref = useRef<HTMLSelectElement>(null);

  // 작업 유형
  const [workType, setWorkType] = useState<string>(defaultWorkType || '입고');

  // PC 자산 정보
  const [pcType, setPcType] = useState<string>(
    mode === 'edit' ? (log?.pc_assets?.pc_type || '') : PC_TYPE_OPTIONS[0].value
  );
  const [brand, setBrand] = useState<string>(
    mode === 'edit' ? (log?.pc_assets?.brand || '') : PC_BRAND_OPTIONS[0].value
  );
  const [modelName, setModelName] = useState<string>(
    mode === 'edit' ? (log?.pc_assets?.model_name || '') : ''
  );
  const [serial, setSerial] = useState<string | undefined>(
    mode === 'edit' ? log?.pc_assets?.serial_number : undefined
  );
  const [securityCode, setSecurityCode] = useState<string | undefined>(
    mode === 'edit' ? log?.pc_assets?.security_code?.[0] : undefined
  );
  const [firstStockDate, setFirstStockDate] = useState<string | undefined>(
    mode === 'edit' ? log?.pc_assets?.first_stock_date : undefined
  );
  const [manufactureDate, setManufactureDate] = useState<string | undefined>(
    mode === 'edit' ? log?.pc_assets?.manufacture_date : undefined
  );
  const [isNew, setIsNew] = useState<boolean>(false);

  // 관리 로그 정보
  const [workDate, setWorkDate] = useState<string>(
    mode === 'edit' ? (log?.work_date || '') : new Date().toISOString().split('T')[0]
  );
  const [requester, setRequester] = useState<string | undefined>(
    mode === 'edit' ? log?.requester : undefined
  );
  const [newSecurityCode, setNewSecurityCode] = useState<string | undefined>();
  const [detailedDescription, setDetailedDescription] = useState<string>(
    mode === 'edit' ? (log?.detailed_description || '') : ''
  );
  const [isAvailable, setIsAvailable] = useState<string>(
    mode === 'edit' ? (log?.status || PC_AVAILABLE_TYPE_OPTIONS[0].value) : PC_AVAILABLE_TYPE_OPTIONS[0].value
  );
  const [usageType, setUsageType] = useState<string>(
    mode === 'edit' ? (log?.usage_type || PC_USAGE_TYPE_OPTIONS[0].value) : PC_USAGE_TYPE_OPTIONS[0].value
  );
  const [employeeWorkspace, setEmployeeWorkspace] = useState<string | undefined>(
    mode === 'edit' ? log?.employee_workspace : undefined
  );
  const [employeeDepartment, setEmployeeDepartment] = useState<string | undefined>(
    mode === 'edit' ? log?.employee_department : undefined
  );
  const [employeeName, setEmployeeName] = useState<string | undefined>(
    mode === 'edit' ? log?.employee_name : undefined
  );
  const [location, setLocation] = useState<string>(
    mode === 'edit' ? (log?.location || PC_LOCATION_TYPE_OPTIONS[0].value) : PC_LOCATION_TYPE_OPTIONS[0].value
  );
  const [install_type, setInstallType] = useState<string>(
    mode === 'edit' ? (log?.install_type || PC_INSTALL_TYPE_OPTIONS[0].value) : PC_INSTALL_TYPE_OPTIONS[0].value
  );
  const [install_status, setInstallStatus] = useState<string>(
    mode === 'edit' ? (log?.install_status || PC_INSTALL_STATUS_OPTIONS[0].value) : PC_INSTALL_STATUS_OPTIONS[0].value
  );

  // 기타
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // PC 타입과 브랜드에 따른 모델명 옵션 설정
  useEffect(() => {
    if (pcType) {
      setModelName(getModelNameOptions()[0]?.value || '');
    }
  }, [pcType, brand]);

  // 모델명 옵션 가져오기
  function getModelNameOptions() {
    if (pcType === "데스크탑" && brand === "HP") {
      return PC_HP_DESKTOP_MODEL_OPTIONS;
    }
    if (pcType === "노트북" && brand === "HP") {
      return PC_HP_NOTEBOOK_MODEL_OPTIONS;
    }
    if (pcType === "노트북" && brand === "LG") {
      return PC_LG_NOTEBOOK_MODEL_OPTIONS;
    }
    if (pcType === "데스크탑" && brand === "LG") {
      return PC_LG_DESKTOP_MODEL_OPTIONS;
    }
    if (pcType === "데스크탑" && brand === "삼성") {
      return PC_SAMSUNG_DESKTOP_MODEL_OPTIONS;
    }
    if (pcType === "노트북" && brand === "삼성") {
      return PC_SAMSUNG_NOTEBOOK_MODEL_OPTIONS;
    }
    return [];
  }

  // PC 자산 생성
  const createPcAsset = async () => {
    const supabaseService = SupabaseService.getInstance();
    const result = await supabaseService.insert({
      table: 'pc_assets',
      data: {
        brand: brand,
        model_name: modelName,
        serial_number: serial,
        security_code: [securityCode],
        pc_type: pcType,
        first_stock_date: workDate,
        manufacture_date: manufactureDate,
      }
    });
    return result;
  };

  // 등록 로그 생성
  const createPcLog = async (asset_id: string, supabaseService: SupabaseService) => {
    const logResult = await supabaseService.insert({
      table: 'pc_management_log',
      data: {
        asset_id: asset_id,
        security_code: securityCode,
        work_type: workType,
        work_date: workDate,
        created_by: user?.email,
        detailed_description: detailedDescription,
      }
    });
    if (logResult.success) {
      alert('등록 완료');
      router.push('/private/pc-history');
      return logResult.data;
    } else {
      alert('등록 실패');
      console.error('등록 실패:', logResult);
      return null;
    }
  };

  // 출고 로그 생성
  const createPcLogInstall = async (asset_id: string, security_code_array: string[], supabaseService: SupabaseService) => {
    const logResult = await supabaseService.insert({
      table: 'pc_management_log',
      data: {
        asset_id: asset_id,
        work_type: workType,
        work_date: workDate,
        created_by: user?.email,
        location: location,
        security_code: newSecurityCode || security_code_array[0],
        requester: requester,
        detailed_description: detailedDescription,
        usage_type: usageType,
        employee_workspace: employeeWorkspace,
        employee_department: employeeDepartment,
        employee_name: employeeName,
        install_type: install_type,
        install_status: install_status,
      }
    });
    if (logResult.success) {
      alert('출고 완료');
      router.push('/private/pc-history');
      return logResult.data;
    } else {
      alert('출고 실패');
      console.error('출고 실패:', logResult);
      return null;
    }
  };

  // 반납 로그 생성
  const createPcLogReturn = async (asset_id: string, supabaseService: SupabaseService) => {
    const logResult = await supabaseService.insert({
      table: 'pc_management_log',
      data: {
        asset_id: asset_id,
        work_type: workType,
        work_date: workDate,
        created_by: user?.email,
        location: location,
        security_code: securityCode,
        requester: requester,
        detailed_description: detailedDescription,
        usage_type: usageType,
        employee_workspace: employeeWorkspace,
        employee_department: employeeDepartment,
        employee_name: employeeName,
        status: isAvailable,
      }
    });
    if (logResult.success) {
      alert('반납 완료');
      router.push('/private/pc-history');
      return logResult.data;
    } else {
      alert('반납 실패');
      console.error('반납 실패:', logResult);
      return null;
    }
  };

  // 폐기 로그 생성
  const createPcLogDispose = async (asset_id: string, supabaseService: SupabaseService) => {
    const logResult = await supabaseService.insert({
      table: 'pc_management_log',
      data: {
        asset_id: asset_id,
        work_type: workType,
        work_date: workDate,
        created_by: user?.email,
        location: location,
        security_code: securityCode,
        requester: requester,
        detailed_description: detailedDescription,
        usage_type: usageType,
        employee_workspace: employeeWorkspace,
        employee_department: employeeDepartment,
        employee_name: employeeName,
      }
    });
    if (logResult.success) {
      alert('폐기 완료');
      router.push('/private/pc-history');
      return logResult.data;
    } else {
      alert('폐기 실패');
      console.error('폐기 실패:', logResult);
      return null;
    }
  };

  // is_disposed 업데이트
  const updateIsDisposed = async (asset_id: string, is_disposed: boolean, supabaseService: SupabaseService) => {
    const result = await supabaseService.update({
      table: 'pc_assets',
      data: { is_disposed: is_disposed },
      match: { asset_id: asset_id },
    });
    if (result.success) {
      console.log('is_disposed 변경 완료', result);
    } else {
      console.error('is_disposed 변경 실패:', result);
    }
  };

  // 제조번호로 PC 자산 정보 자동 입력
  const setPcAssetInfo = async (serial: string) => {
    const supabaseService = SupabaseService.getInstance();
    const existingAsset = await checkSerialNumber(supabaseService, serial);
    if (!existingAsset || existingAsset.length === 0) {
      alert('제조 번호가 존재하지 않습니다. 등록 후 시도 하십시오.');
      return;
    }
    
    if (workType !== "입고") {
      setPcType(existingAsset[0].pc_type || "");
      setBrand(existingAsset[0].brand || "");
      setModelName(existingAsset[0].model_name || "");
      setSerial(existingAsset[0].serial_number || "");
      setSecurityCode(existingAsset[0].security_code?.[0] || "");
      setManufactureDate(existingAsset[0].manufacture_date || "");
      setFirstStockDate(existingAsset[0].first_stock_date || "");
    }

    // 폐기 로그의 경우 추가 정보 설정
    if (workType === "폐기") {
      const { data: existingLog } = await supabaseService.select({
        table: 'pc_management_log',
        columns: '*',
        match: { asset_id: existingAsset[0].asset_id },
        limit: 1
      });
      
      const result: IPcManagementLog = existingLog?.[0];
      if (result) {
        setWorkDate(result.work_date || "");
        setRequester(result.requester || "");
        setEmployeeWorkspace(result.employee_workspace || "");
        setEmployeeDepartment(result.employee_department || "");
        setEmployeeName(result.employee_name || "");
        setUsageType(result.usage_type || "");
        setDetailedDescription(result.detailed_description || "");
      }
    }
  };

  // 사원 정보 조회
  const handleEmployeeDataByName = async (employeeName: string) => {
    const employeeData = await fetchEmployeeDataByName(employeeName);
    if (employeeData.length > 0) {
      setEmployeeData(employeeData);
      setIsModalOpen(true);
    }
  };

  // 작업 버튼 핸들러
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      if (mode === 'edit') {
        await handleUpdate();
      } else {
        await handleCreate();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 생성 처리
  const handleCreate = async () => {
    if (!serial) {
      alert('제조 번호를 입력해주세요.');
      return;
    }

    const supabaseService = SupabaseService.getInstance();

    switch (workType) {
      case '입고':
        const existingAsset = await checkSerialNumber(supabaseService, serial);
        if (existingAsset && existingAsset.length > 0) {
          alert('이미 존재하는 제조번호 입니다.');
          return;
        }
        const result = await createPcAsset();
        if (result.success) {
          await createPcLog(result.data[0].asset_id, supabaseService);
        }
        break;

      case '출고':
        const installAsset = await checkSerialNumber(supabaseService, serial);
        if (!installAsset || installAsset.length === 0) {
          alert('제조 번호가 존재하지 않습니다. 등록 후 사용하세요');
          return;
        }
        await createPcLogInstall(installAsset[0].asset_id, installAsset[0].security_code, supabaseService);
        break;

      case '반납':
        const returnAsset = await checkSerialNumber(supabaseService, serial);
        if (!returnAsset || returnAsset.length === 0) {
          alert('제조 번호가 존재하지 않습니다. 등록 후 시도 하십시오.');
          return;
        }
        await createPcLogReturn(returnAsset[0].asset_id, supabaseService);
        break;

      case '폐기':
        const disposeAsset = await checkSerialNumber(supabaseService, serial);
        if (!disposeAsset || disposeAsset.length === 0) {
          alert('제조 번호가 존재하지 않습니다. 반납 혹은 등록 후 시도 하십시오.');
          return;
        }
        await createPcLogDispose(disposeAsset[0].asset_id, supabaseService);
        await updateIsDisposed(disposeAsset[0].asset_id, true, supabaseService);
        break;
    }
  };

  // 수정 처리
  const handleUpdate = async () => {
    if (!log) return;

    const supabaseService = SupabaseService.getInstance();

    // PC 자산 수정
    const pcAssetResult = await supabaseService.update({
      table: 'pc_assets',
      data: {
        pc_type: pcType,
        brand: brand,
        model_name: modelName,
        serial_number: serial,
        security_code: newSecurityCode ? [newSecurityCode, ...log.pc_assets.security_code] : log.pc_assets.security_code,
        first_stock_date: firstStockDate,
        manufacture_date: manufactureDate,
      },
      match: { asset_id: log.pc_assets.asset_id },
    });

    // 로그 수정
    const logResult = await supabaseService.update({
      table: 'pc_management_log',
      data: {
        work_date: workDate,
        requester: requester,
        security_code: securityCode,
        detailed_description: detailedDescription,
        status: isAvailable,
        usage_type: usageType,
        employee_workspace: employeeWorkspace,
        employee_department: employeeDepartment,
        employee_name: employeeName,
        location: location,
        install_type: install_type,
        install_status: install_status,
      },
      match: { log_id: log.log_id },
    });

    if (logResult.success) {
      alert("수정 완료");
      router.push('/private/pc-history');
    }
  };

  return (
    <>
      <EmployeesSelectModal
        employeeData={employeeData}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        setEmployeeDepartment={setEmployeeDepartment}
        setEmployeeName={setEmployeeName}
        setSelectedEmployee={() => {}}
      />

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* 헤더 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              PC 이력 {mode === 'create' ? '작성' : '수정'}
            </h1>
            <p className="text-gray-600">PC 관리 이력을 {mode === 'create' ? '작성' : '수정'}합니다.</p>
          </div>


          {/* PC 자산 정보 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">PC 자산 정보</h3>
            
            {workType === "입고" && mode === 'create' && (
              <div className="mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is-new-checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    checked={isNew}
                    onChange={(e) => setIsNew(e.target.checked)}
                  />
                  <label htmlFor="is-new-checkbox" className="ml-2 text-sm font-medium text-gray-700">
                    신규 PC 등록
                  </label>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
          {/* 작업 유형 선택 */}
          {mode === 'create' && (
            <div className="mb-6">
              <InputDropDown
                label="작업 유형"
                value={workType}
                setValue={setWorkType}
                ref={ref}
                options={WORK_TYPE_OPTIONS}
              />
            </div>
          )}
              <InputDropDown
                label="기종"
                value={pcType}
                setValue={setPcType}
                ref={ref}
                options={PC_TYPE_OPTIONS}
                disabled={mode === 'create' && workType !== "입고"}
              />
              <InputDropDown
                label="제조사"
                value={brand}
                setValue={setBrand}
                ref={ref}
                options={PC_BRAND_OPTIONS}
                disabled={mode === 'create' && workType !== "입고"}
              />
              <InputDropDown
                label="모델명"
                value={modelName}
                setValue={setModelName}
                ref={ref}
                options={getModelNameOptions()}
                disabled={mode === 'create' && workType !== "입고"}
              />
              <InputLog
                label="제조번호"
                value={serial}
                setValue={setSerial}
                required={true}
                placeholder={
                  mode === 'create' && workType !== "입고"
                    ? "제조번호 입력후 엔터 시 자동입력"
                    : "제조번호를 입력해주세요"
                }
                onKeyDown={() => {
                  if (mode === 'create' && workType !== "입고" && serial) {
                    setPcAssetInfo(serial);
                  }
                }}
              />
              
              {mode === 'create' && workType === "입고" && (
                <InputDate
                  label="작성일"
                  value={workDate}
                  setValue={setWorkDate}
                  name="workDate"
                  type="date"
                />
              )}
              
              <InputLog
                label="제조일"
                secondLabel={
                  ((user?.email === "pcsub1@ket.com" || user?.email === "admin@ket.com") && manufactureDate)
                    ? generateSecurityCode(manufactureDate)
                    : undefined
                }
                value={manufactureDate}
                setValue={setManufactureDate}
                disabled={mode === 'create' && workType !== "입고"}
                placeholder={mode === 'create' && workType === "입고" ? "yyyy-mm 형식으로 입력해주세요" : undefined}
              />
              
              <InputLog
                label="최초등록일"
                secondLabel={
                  ((user?.email === "pcsub1@ket.com" || user?.email === "admin@ket.com") && firstStockDate)
                    ? generateSecurityCode(firstStockDate)
                    : undefined
                }
                value={firstStockDate}
                setValue={setFirstStockDate}
                disabled={mode === 'create' && workType !== "입고"}
                placeholder={mode === 'create' && workType === "입고" ? "yyyy-mm 혹은 yyyy-mm-dd" : undefined}
              />
              
              <InputLog
                label="보안코드"
                value={securityCode}
                setValue={setSecurityCode}
                disabled={mode === 'create' && (workType !== "입고" || isNew)}
              />
            </div>
          </div>

          {/* 입력 정보 */}
          {(mode === 'edit' || workType !== "입고") && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">입력 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {(mode === 'edit' || workType !== "입고") && (
                  <InputDate
                    label={workType === "반납" ? "반납일" : workType === "출고" ? "출고일" : workType === "폐기" ? "폐기일" : "작업일"}
                    value={workDate}
                    setValue={setWorkDate}
                    name="workDate"
                    type="date"
                    disabled={mode === 'edit'}
                  />
                )}

                {(mode === 'edit' || workType !== "입고") && (
                  <InputLog
                    label="의뢰인"
                    value={requester}
                    setValue={setRequester}
                    disabled={mode === 'edit'}
                  />
                )}

                {(mode === 'edit' || workType !== "입고") && (
                  <InputLog
                    label="신규 보안코드"
                    value={newSecurityCode}
                    setValue={setNewSecurityCode}
                    placeholder="보안코드 변경시 입력"
                  />
                )}

                {(mode === 'edit' || workType === "반납") && (
                  <InputDropDown
                    label="상태"
                    value={isAvailable}
                    setValue={setIsAvailable}
                    ref={ref}
                    options={PC_STATUS_OPTIONS}
                    disabled={mode === 'edit'}
                  />
                )}

                {(mode === 'edit' || workType !== "입고") && (
                  <>
                    <InputLog
                      label="사업장"
                      value={employeeWorkspace}
                      setValue={setEmployeeWorkspace}
                      disabled={mode === 'edit'}
                    />
                    <InputLog
                      label="부서"
                      value={employeeDepartment}
                      setValue={setEmployeeDepartment}
                      disabled={mode === 'edit'}
                    />
                    <InputLog
                      label="사용자"
                      value={employeeName}
                      setValue={setEmployeeName}
                      onKeyDown={() => handleEmployeeDataByName(employeeName ?? "")}
                      disabled={mode === 'edit'}
                    />
                    <InputDropDown
                      label="사용용도"
                      value={usageType}
                      setValue={setUsageType}
                      ref={ref}
                      options={PC_USAGE_TYPE_OPTIONS}
                      disabled={mode === 'edit'}
                    />
                  </>
                )}

                {(mode === 'edit' || workType === "반납") && (
                  <InputDropDown
                    label="보관장소"
                    value={location}
                    setValue={setLocation}
                    ref={ref}
                    options={PC_LOCATION_TYPE_OPTIONS}
                    disabled={mode === 'edit'}
                  />
                )}

                {(mode === 'edit' || workType === "출고") && (
                  <>
                    <InputDropDown
                      label="출고유형"
                      value={install_type}
                      setValue={setInstallType}
                      ref={ref}
                      options={PC_INSTALL_TYPE_OPTIONS}
                      disabled={mode === 'edit'}
                    />
                    <InputDropDown
                      label="출고상태"
                      value={install_status}
                      setValue={setInstallStatus}
                      ref={ref}
                      options={PC_INSTALL_STATUS_OPTIONS}
                      disabled={mode === 'edit'}
                    />
                  </>
                )}
              </div>
            </div>
          )}

          {/* 상세 설명 */}
          <div className="mb-6">
            <InputTextArea
              label="상세설명"
              value={detailedDescription}
              setValue={setDetailedDescription}
              placeholder={
                mode === 'create'
                  ? workType === "입고"
                    ? "TIP : 등록은 새 PC 등록에만 사용됩니다"
                    : workType === "반납"
                    ? "반납 상세설명을 입력해주세요"
                    : workType === "출고"
                    ? "TIP : 출고는 기존 pc 자산이 있는 경우에만 입력 가능합니다. 반납 혹은 등록으로 PC자산을 생성 후 시도 하십시오."
                    : workType === "폐기"
                    ? "TIP : 폐기는 기존 pc 자산이 있는 경우에만 입력 가능합니다. 폐기 확정인 경우에만 이용해주세요."
                    : "-"
                  : undefined
              }
            />
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end">
            <div className="w-36">
              <OkButton
                onClick={handleSubmit}
                isLoading={isLoading}
                buttonText={
                  mode === 'edit'
                    ? "수정"
                    : workType === "입고"
                    ? "등록"
                    : workType === "반납"
                    ? "반납"
                    : workType === "출고"
                    ? "출고"
                    : workType === "폐기"
                    ? "폐기"
                    : "저장"
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 