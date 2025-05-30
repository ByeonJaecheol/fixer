'use client';

import SupabaseService from "@/api/supabase/supabaseApi";
import OkButton from "@/app/_components/common/input/button/OkButton";
import CommonInputSingleCheckbox from "@/app/_components/common/input/CommonInputSingleCheckbox";
import InputDate from "@/app/_components/log/InputDate";
import InputLog from "@/app/_components/log/new/InputLog";
import InputTextArea from "@/app/_components/log/new/InputTextArea";
import { fetchDataBySecurityCode, fetchEmployeeDataByName } from "@/app/utils/util";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import EmployeesSelectModal, { EmployeeData } from "../../_components/EmployeesSelectModal";

interface IHardwareLogEntry {
    category: string | null;
    created_at: string;
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
    solution_detail: string;
    work_date: string;
    work_type: "H/W" | "S/W" | "네트워크" | "기타" | string;
}

interface AsLogFormProps {
    mode: 'create' | 'edit';
    defaultWorkType?: string;
    log?: IHardwareLogEntry;
}

export default function AsLogForm({ mode, defaultWorkType, log }: AsLogFormProps) {
    const { user } = useUser();
    const createdBy = user?.email;
    const router = useRouter();

    // State 정의
    const [workType, setWorkType] = useState<string|undefined>(
        mode === 'edit' ? log?.work_type : defaultWorkType
    );
    const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
    const [employeeWorkspace, setEmployeeWorkspace] = useState<string|undefined>(undefined);
    const [employeeDepartment, setEmployeeDepartment] = useState<string|undefined>(undefined);
    const [employeeName, setEmployeeName] = useState<string|undefined>(undefined);
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData|undefined>(undefined);
    const [employeeAsLogs, setEmployeeAsLogs] = useState<any[]>([]);
    const [modelName, setModelName] = useState<string|undefined>(undefined);
    const [securityCode, setSecurityCode] = useState<string|undefined>(undefined);
    const [question, setQuestion] = useState<string|undefined>(undefined);
    const [serial, setSerial] = useState<string|undefined>(undefined);
    const [detailCategory, setDetailCategory] = useState<string|undefined>(undefined);
    const [category, setCategory] = useState<string|undefined>(undefined);
    const [detailedDescription, setDetailedDescription] = useState<string|undefined>(undefined);
    const [solutionDetail, setSolutionDetail] = useState<string|undefined>(undefined);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Edit 모드일 때 초기값 설정
    useEffect(() => {
        if (mode === 'edit' && log) {
            setWorkDate(log.work_date);
            setEmployeeWorkspace(log.employee_workspace);
            setEmployeeDepartment(log.employee_department);
            setEmployeeName(log.employee_name);
            setModelName(log.model_name);
            setSecurityCode(log.security_code);
            setQuestion(log.question);
            setSerial(log.serial_number);
            setDetailCategory(log.detail_category ?? "");
            setCategory(log.category ?? "");
            setDetailedDescription(log.detailed_description);
            setSolutionDetail(log.solution_detail);
        }
    }, [mode, log]);

    // Create 모드에서 선택된 직원의 AS 이력 가져오기
    useEffect(() => {
        if (mode === 'create' && selectedEmployee?.이름) {
            const fetchEmployeeAsLogs = async () => {
                try {
                    const logs = await getEmployeeAsLog(selectedEmployee.이름);
                    if (Array.isArray(logs)) {
                        setEmployeeAsLogs(logs);
                    } else {
                        setEmployeeAsLogs([]);
                    }
                } catch (error) {
                    console.error('AS 이력 가져오기 실패:', error);
                    setEmployeeAsLogs([]);
                }
            };
            fetchEmployeeAsLogs();
        } else {
            setEmployeeAsLogs([]);
        }
    }, [selectedEmployee, mode]);

    // workType 변경 시 category 초기화
    useEffect(() => {
        setCategory(undefined);
    }, [workType]);

    // AS 이력 조회 함수
    const getEmployeeAsLog = async (employeeName: string | undefined) => {
        const supabaseService = SupabaseService.getInstance();
        const { success, error, data } = await supabaseService.select({
            table: 'as_management_log',
            columns: '*',
            match: { employee_name: employeeName },
            order: { column: 'work_date', ascending: false }
        });
        
        if (success) {
            return data;
        } else {
            console.error('Error fetching as_management_log:', error);
            return null;
        }
    };

    // 사원명으로 사원 정보 조회
    const handleEmployeeDataByName = async (employeeName: string) => {
        if (mode === 'create') {
            const employeeData = await fetchEmployeeDataByName(employeeName);
            if (employeeData.length > 0) {
                setEmployeeData(employeeData);
                setIsModalOpen(true);
            }
        }
    };

    // 로그 생성 함수들
    const createLog = async (supabaseService: SupabaseService) => {
        const baseData = {
            work_type: workType,
            work_date: workDate,
            model_name: modelName,
            created_by: createdBy,
            employee_workspace: employeeWorkspace,
            employee_department: employeeDepartment,
            employee_name: employeeName,
            question: question,
            solution_detail: solutionDetail,
            detailed_description: detailedDescription,
        };

        let data: any = { ...baseData };

        if (workType === "H/W") {
            data = {
                ...data,
                category: category,
                detail_category: detailCategory,
                security_code: securityCode,
            };
        } else if (workType === "S/W") {
            data = {
                ...data,
                category: category,
            };
        }

        const logResult = await supabaseService.insert({
            table: 'as_management_log',
            data: data
        });

        if (logResult.success) {
            alert(`${workType} 완료`);
            setDefault();
            router.refresh();
            return logResult.data;
        } else {
            alert(`${workType} 실패`);
            console.error(`${workType} 실패:`, logResult);
            return null;
        }
    };

    // 로그 수정 함수들
    const updateLog = async () => {
        const supabaseService = SupabaseService.getInstance();
        
        const baseData = {
            work_date: workDate,
            work_type: workType,
            employee_workspace: employeeWorkspace,
            employee_department: employeeDepartment,
            employee_name: employeeName,
            model_name: modelName,
            question: question,
            solution_detail: solutionDetail,
            detailed_description: detailedDescription,
        };

        let data: any = { ...baseData };

        if (workType === "H/W") {
            data = {
                ...data,
                category : category,
                detail_category: detailCategory,
                security_code: securityCode,
            };
        } else if (workType === "S/W") {
            data = {
                ...data,
                category: category,
            };
        }

        const logResult = await supabaseService.update({
            table: 'as_management_log',
            data: data,
            match: {
                log_id: log?.log_id
            }
        });

        if (logResult.success) {
            alert('수정 완료');
            return logResult.data;
        } else {
            alert('수정 실패');
            console.error('수정 실패:', logResult);
            return null;
        }
    };

    // 삭제 함수
    const handleDeleteButton = async () => {
        if (mode === 'edit' && log) {
            const supabaseService = SupabaseService.getInstance();
            const logResult = await supabaseService.delete({
                table: 'as_management_log',
                match: {
                    log_id: log.log_id
                }
            });

            if (logResult.success) {
                alert('삭제 완료');
                router.push(`/private/as-request`);
            } else {
                alert('삭제 실패');
                console.error('삭제 실패:', logResult);
            }
        }
    };

    // 메인 버튼 클릭 핸들러
    const handleWriteButton = () => {
        if (mode === 'create') {
            const supabaseService = SupabaseService.getInstance();
            createLog(supabaseService);
        } else {
            updateLog();
        }
    };

    // 초기화 함수
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
        setDetailedDescription(undefined);
        setSolutionDetail(undefined);
        setIsModalOpen(false);
        setIsLoading(false);
        setEmployeeData([]);
        setSelectedEmployee(undefined);
    };

    return (
        <>
            {mode === 'create' && (
                <EmployeesSelectModal 
                    employeeData={employeeData} 
                    setSelectedEmployee={setSelectedEmployee} 
                    isModalOpen={isModalOpen} 
                    setIsModalOpen={setIsModalOpen} 
                    setEmployeeDepartment={setEmployeeDepartment} 
                    setEmployeeName={setEmployeeName}
                />
            )}
            
            <div className="text-sm font-semibold text-gray-700 px-4 sm:px-8 my-2">
                <div className="flex flex-row items-center gap-2">
                    <h1>{workType} {mode === 'create' ? '이력 작성' : '수리 정보'}</h1>
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
                
                <InputLog
                    label={"사용자"}
                    value={employeeName}
                    setValue={setEmployeeName}
                    onKeyDown={() => handleEmployeeDataByName(employeeName ?? "")}
                    placeholder={mode === 'create' ? "사원명 입력 후 엔터시 자동입력" : ""}
                />
                
                <InputLog
                    label={"부서"}
                    value={employeeDepartment}
                    setValue={setEmployeeDepartment}
                />
                
                <InputLog
                    label={"사업장"}
                    value={employeeWorkspace}
                    setValue={setEmployeeWorkspace}
                />

                <InputLog
                    label={"모델명"}
                    value={modelName}
                    setValue={setModelName}
                />
            </div>

            <div className="flex flex-col gap-4 mb-4 rounded-lg m-8">
                <div className="flex flex-col gap-y-4">
                    {/* 작업유형 */}
                    <CommonInputSingleCheckbox 
                        title={"작업유형"}
                        value={workType??""}
                        setValue={setWorkType}
                        options={["H/W","S/W","네트워크","기타"]}
                    />
                    
                    {/* 작업유형 설명 */}
                    {workType && (
                        <div className="">
                            <div className="text-xs text-gray-500">
                                <span className="font-semibold">{workType}</span>
                                <span className="ml-2">
                                    {workType === "H/W" && "모든 하드웨어 관련 조치 사항 (장비의 수리, 설치, 반납, 폐기, 업그레이드 등)"}
                                    {workType === "S/W" && "모든 프로그램 관련 조치 사항 (하드웨어 이외 항목들)"}
                                    {workType === "네트워크" && "모든 네트워크 관련 조치 및 점검 내역 (장비 점검, 랜케이블 설치 작업)"}
                                    {workType === "기타" && "이외의 사항들 (기타 장비 수리, 예방 점검 등)"}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* S/W 분류 */}
                {workType === "S/W" && (
                    <div className="flex flex-col gap-y-4">
                        <h3 className="font-bold text-sm">S/W 선택항목</h3>
                        <CommonInputSingleCheckbox 
                            title={"분류"}
                            value={mode === 'edit' ? 
                                (category !== undefined ? category : (log?.category ?? "-")) : 
                                (category ?? "")
                            }
                            setValue={setCategory}
                            options={["보안","프로그램","OS/성능","데이터","기타"]}
                        />
                        
                        {/* S/W 카테고리 설명 */}
                        {((mode === 'edit' ? (category !== undefined ? category : log?.category) : category)) && (
                            <div className="">
                                <div className="text-xs text-gray-500">
                                    <span className="font-semibold">{mode === 'edit' ? (category !== undefined ? category : log?.category) : category}</span>
                                    <span className="ml-2">
                                        {((mode === 'edit' ? (category !== undefined ? category : log?.category) : category) === "보안") && "보안 시스템 및 바이러스 관련 항목 조치 사항 (PC보안, DRM, 집중화, ECM, 알약 등) + 바이러스(악성코드 제거)"}
                                        {((mode === 'edit' ? (category !== undefined ? category : log?.category) : category) === "프로그램") && "프로그램 설치 또는 조치 사항 (보안 이외 항목들 예: office, sap, cad 등) + 장치 드라이버 설치 및 업데이트"}
                                        {((mode === 'edit' ? (category !== undefined ? category : log?.category) : category) === "OS/성능") && "운영체제 관련 조치 사항 (윈도우 재설치, 복원, 업데이트, 시스템 설정) + 신규 및 재배치 장비 OS설치 작업 + 시스템 성능 저하로 최적화 작업 및 시스템 설정"}
                                        {((mode === 'edit' ? (category !== undefined ? category : log?.category) : category) === "데이터") && "요청에 의한 데이터 백업 및 복구 관련 작업"}
                                        {((mode === 'edit' ? (category !== undefined ? category : log?.category) : category) === "기타") && "보안, 프로그램, OS 이외 항목"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* H/W 분류 */}
                {workType === "H/W" && (
                    <div className="flex flex-col gap-y-4">
                        <h3 className="font-bold text-sm">H/W 선택항목</h3>
                        <CommonInputSingleCheckbox 
                            title={"분류"}
                            value={mode === 'edit' ? 
                                (category !== undefined ? category : (log?.category ?? "-")) : 
                                (category ?? "")
                            }
                            setValue={setCategory}
                            options={["PC","모니터","프린터","기타"]}
                        />
                        
                        {/* H/W 카테고리 설명 */}
                        {((mode === 'edit' ? (category !== undefined ? category : log?.category) : category)) && (
                            <div className="">
                                <div className="text-xs text-gray-500">
                                    <span className="font-semibold">{mode === 'edit' ? (category !== undefined ? category : log?.category) : category}</span>
                                    <span className="ml-2 text-gray-600">
                                        카테고리 설명이 추후 추가될 예정입니다.
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* PC 카테고리 추가 입력 */}
                {((mode === 'edit' ? (category !== undefined ? category : log?.category) : category) === "PC") && (
                    <div className="flex flex-col gap-y-4">
                        <h3 className="font-bold text-sm">PC 추가 입력</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <InputLog
                                label={mode === 'edit' ? "기존 보안코드" : "보안코드"}
                                value={securityCode}
                                setValue={setSecurityCode}
                                onKeyDown={() => fetchDataBySecurityCode(securityCode??"", setEmployeeWorkspace, setEmployeeDepartment, setEmployeeName, setModelName, setSerial)}
                                placeholder={mode === 'edit' ? "보안코드 입력 후 엔터시 자동입력" : ""}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 문의내용 및 조치내용 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 sm:px-8 mb-4">
                <InputLog
                    label={"문의내용"}
                    value={question}
                    setValue={setQuestion}
                />
                <InputLog
                    label={"조치내용"}
                    value={solutionDetail}
                    setValue={setSolutionDetail}
                />
            </div>

            <div className="w-full mb-4 px-4 sm:px-8">
                <InputTextArea
                    label={"상세설명"}
                    value={detailedDescription}
                    setValue={setDetailedDescription}
                    placeholder={""}
                />
            </div>

            {/* 버튼 영역 */}
            <div className="w-full flex justify-end mb-4 px-4 sm:px-8 gap-x-4">
                {mode === 'edit' && (
                    <div className="w-72 flex flex-row gap-2">
                        <OkButton
                            onClick={() => router.push(`/private/as-request`)}
                            isLoading={isLoading}
                            buttonText={"뒤로가기"}
                            color={"yellow"}
                        />
                        <OkButton
                            onClick={handleDeleteButton}
                            isLoading={isLoading}
                            buttonText={"삭제"}
                            color={"red"}
                        />
                    </div>
                )}
                
                {mode === 'create' && (
                    <div className="w-72 flex flex-row gap-2">
                        <OkButton
                            onClick={() => router.push(`/private/as-request`)}
                            isLoading={isLoading}
                            buttonText={"뒤로가기"}
                            color={"yellow"}
                        />
                    </div>
                )}
                
                <div className="w-36">
                    <OkButton
                        onClick={handleWriteButton}
                        isLoading={isLoading}
                        buttonText={mode === 'create' ? "작성" : "수정"}
                        color={"blue"}
                    />
                </div>
            </div>

            {/* Create 모드에서만 이전 AS 이력 표시 */}
            {mode === 'create' && selectedEmployee && (
                <div>
                    <div className="mt-6 px-4 sm:px-8">
                        <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                            {selectedEmployee.이름}님의 이전 AS 이력
                        </h4>
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
            )}
        </>
    );
} 