'use client'
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Dispatch, SetStateAction, useState } from "react";

export interface EmployeeData {
    id: string;
    아이뒤: string;
    부서: string;
    이름: string;
    직책: string;
    사번 : string;

}

export default function EmployeesSelectModal({employeeData, setSelectedEmployee, isModalOpen, setIsModalOpen, setEmployeeDepartment, setEmployeeName }:{employeeData:EmployeeData[],
     setSelectedEmployee:Function,  isModalOpen:boolean, setIsModalOpen:Dispatch<SetStateAction<boolean>>, setEmployeeDepartment:Function, setEmployeeName:Function}) {
    const handleSelectEmployee = (employee: EmployeeData) => {
        setSelectedEmployee(employee);
        setEmployeeDepartment(employee.부서);
        setEmployeeName(employee.이름);
        setIsModalOpen(false);
        // 클립보드에 아이뒤 복사
        navigator.clipboard.writeText(employee.아이뒤+" "+employee.사번); 

    }
    return (
        <>
            {isModalOpen&&
                <div className="fixed inset-0 z-50 overflow-y-auto">
                  {/* 모달 배경 투명 */}
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={() => setIsModalOpen(false)}
                    />
                    {/* 모달 중앙 배치 */}
                    <div className="flex min-h-full items-center justify-center p-4">
                        {/* 모달 컨텐츠 배치 */}
                          <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                            {/* 헤더 */}
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">사원 선택</h3>
                              <p className="text-sm text-gray-500">아래 목록에서 해당하는 사원을 선택해주세요.</p>
                            </div>

                            {/* 그리드 컨테이너 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {employeeData.map((employee: EmployeeData) => (
                                <div
                                  key={employee.id}
                                  onClick={() => handleSelectEmployee(employee)}
                                  className="group relative flex flex-col p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                                >
                                  {/* 사원 정보 */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      {/* 이름과 ID */}
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-lg font-medium text-gray-900">
                                          {employee.이름}
                                        </span>
                                      </div>
                                      
                                      {/* 부서와 직책 */}
                                      <div className="space-y-1">
                                        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm bg-blue-100 text-blue-800">
                                          {employee.부서}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          {employee.직책}
                                        </div>
                                      </div>
                                    </div>

                                    {/* 선택 아이콘 */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                      <svg 
                                        className="w-6 h-6 text-indigo-600" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                      >
                                        <path 
                                          strokeLinecap="round" 
                                          strokeLinejoin="round" 
                                          strokeWidth={2} 
                                          d="M9 5l7 7-7 7"
                                        />
                                      </svg>
                                    </div>
                                  </div>

                                  {/* 호버 시 나타나는 선택 버튼 */}
                                  <button className="absolute inset-0 flex items-center justify-center bg-indigo-500 bg-opacity-0 hover:bg-opacity-10 transition-all duration-200">
                                    <span className="sr-only">선택하기</span>
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* 닫기 버튼 */}
                            <div className="mt-6">
                              <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                              >
                                닫기
                              </button>
                            </div>
                          </div>
                    </div>
                </div>}
        </>
    )
}
