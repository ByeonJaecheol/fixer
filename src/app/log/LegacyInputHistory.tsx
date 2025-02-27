"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { Database } from "../../../types_db";

export default function InputHistory() {
  // now 변수를 상태로 관리하고 useEffect에서 초기화
  const [now, setNow] = useState("");
  
  // 컴포넌트 마운트 시에만 현재 시간 설정 - 한국 시간대로 수정
  useEffect(() => {
    const now = new Date();
    // 한국 시간대로 변환 (UTC+9)
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    setNow(koreaTime.toISOString().slice(0, 16));
  }, []);

  const [logs, setLogs] = useState<
    Database["public"]["Tables"]["work-history"]["Row"][]
  >([]);

  // 개별 상태값 관리 - 빈 문자열로 초기화
  const [createdAt, setCreatedAt] = useState("");
  const [receivedDate, setReceivedDate] = useState("");
  
  // now가 설정된 후에 createdAt과 receivedDate 초기화
  useEffect(() => {
    if (now) {
      setCreatedAt(now);
      setReceivedDate(now);
    }
  }, [now]);

  const [user, setUser] = useState("");
  const [client, setClient] = useState("");
  const [department, setDepartment] = useState("");
  const [modelName, setModelName] = useState("");
  const [serial, setSerial] = useState("");
  const [code, setCode] = useState("");
  const [isBackup, setIsBackup] = useState(false); // 기본값 false ('아니오')
  const [taskDetails, setTaskDetails] = useState("");

  // useRef 추가
  const userInputRef = React.useRef<HTMLInputElement>(null);

  // 확장 상태를 관리하기 위한 상태 추가
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  // 로딩 상태 추가
  const [isLoading, setIsLoading] = useState(false);

  // 작업 내역 데이터를 저장할 상태 추가
  const [workHistoryData, setWorkHistoryData] = useState<any[]>([]);

  // 데이터 로딩 상태
  const [isDataLoading, setIsDataLoading] = useState(true);

  // 수정 모드 상태 추가
  const [editingId, setEditingId] = useState<number | null>(null);

  // 정렬 상태의 타입과 기본값 수정
  const [sortField, setSortField] = useState<'id' | 'created_at' | 'receivedDate'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 작업 유형을 위한 상태 추가
  const [workType, setWorkType] = useState<string>("");

  // 날짜 포맷팅 헬퍼 함수 수정
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      // 한국 시간대로 변환
      const date = new Date(dateString);
      const koreaTime = new Date(date.getTime() + (9 * 60 * 60 * 1000));
      return koreaTime.toISOString().split('T')[0] || "-";
    } catch (error) {
      return "-";
    }
  };

  // 컴포넌트 마운트 시 의뢰인 입력 필드에 포커스
  useEffect(() => {
    userInputRef.current?.focus();
  }, []);

  // fetchWorkHistory 함수 수정
  const fetchWorkHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("work-history")
        .select("*")
        .order(sortField, { ascending: sortOrder === 'asc' });

      if (error) {
        throw error;
      }

      setWorkHistoryData(data || []);
    } catch (error) {
      console.error("작업 내역을 불러오는 중 오류 발생:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  // 정렬 변경 시 데이터 다시 불러오기
  useEffect(() => {
    fetchWorkHistory();
  }, [sortField, sortOrder]);

  //작업내역 저장
  const onSave = async () => {
    if (
      !createdAt ||
      !receivedDate ||
      !user ||
      !department ||
      !modelName ||
      !serial ||
      !code ||
      !workType
    ) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.from("work-history").insert({
        created_at: createdAt,
        receivedDate: receivedDate,
        user: user,
        client: client,
        department: department,
        model_name: modelName,
        serial: serial,
        code: code,
        isBackup: isBackup,
        task_details: taskDetails,
        work_type: workType,
      });

      if (error) {
        throw error;
      }

      alert("저장되었습니다.");
      // 폼 초기화
      setWorkType("");
      setCreatedAt(now);
      setReceivedDate(now);
      setUser("");
      setClient("");
      setDepartment("");
      setModelName("");
      setSerial("");
      setCode("");
      setIsBackup(false);
      setTaskDetails("");
      // 데이터 새로고침
      await fetchWorkHistory();
    } catch (error) {
      alert("저장 중 오류가 발생했습니다.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  // 행 확장/축소 토글 함수
  const toggleRowExpansion = (index: number) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // 수정 함수 추가
  const handleEdit = async (id: number) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("work-history")
        .update({
          created_at: createdAt,
          receivedDate: receivedDate,
          user: user,
          client: client,
          department: department,
          model_name: modelName,
          serial: serial,
          code: code,
          isBackup: isBackup,
          task_details: taskDetails,
          work_type: workType,
        })
        .eq("id", id);

      if (error) throw error;

      alert("수정이 완료되었습니다.");
      setEditingId(null);
      // 폼 초기화
      setWorkType("");
      setCreatedAt(now);
      setReceivedDate(now);
      setUser("");
      setClient("");
      setDepartment("");
      setModelName("");
      setSerial("");
      setCode("");
      setIsBackup(false);
      setTaskDetails("");
      // 데이터 새로고침
      await fetchWorkHistory();
    } catch (error) {
      console.error("수정 중 오류 발생:", error);
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 수정할 항목 선택 함수
  const startEdit = (item: any) => {
    setEditingId(item.id);
    setWorkType(item.work_type || "");
    setCreatedAt(item.created_at?.slice(0, 16) || now);
    setReceivedDate(item.received_date?.slice(0, 16) || now);
    setUser(item.user || "");
    setClient(item.client || "");
    setDepartment(item.department || "");
    setModelName(item.model_name || "");
    setSerial(item.serial || "");
    setCode(item.code || "");
    setIsBackup(item.is_backup || false);
    setTaskDetails(item.task_details || "");
  };

  // 삭제 함수 추가
  const handleDelete = async (id: number) => {
    // 삭제 확인
    if (!confirm("정말로 이 작업내역을 삭제하시겠습니까?")) {
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("work-history")
        .delete()
        .eq("id", id);

      if (error) throw error;

      alert("삭제되었습니다.");
      setEditingId(null);
      // 폼 초기화
      setWorkType("");
      setCreatedAt(now);
      setReceivedDate(now);
      setUser("");
      setClient("");
      setDepartment("");
      setModelName("");
      setSerial("");
      setCode("");
      setIsBackup(false);
      setTaskDetails("");
      // 데이터 새로고침
      await fetchWorkHistory();
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-4">
      {/* 작업 유형 선택 섹션 */}
      <div className="mb-6">
        <h3 className="text-yellow-300 mb-2">작업 유형</h3>
        <div className="flex flex-wrap gap-4">
          {["신규","신규_재배치", "교체_재배치", "교체_신규", "수리", "반납","폐기"].map((type) => (
            <label key={type} className="flex items-center gap-2">
              <input
                type="radio"
                name="workType"
                value={type}
                checked={workType === type}
                onChange={(e) => setWorkType(e.target.value)}
                className="w-4 h-4"
              />
              <span className="text-white">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 입력 폼 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       
        {/* 입고일 */}
        <div className="flex flex-col">
          <h3 className="text-yellow-300">입고일</h3>
          <input
            type="datetime-local"
            name="receivedDate"
            value={receivedDate}
            onChange={(e) => setReceivedDate(e.target.value)}
            className="text-black rounded-md p-2 w-full"
          />
        </div>

         {/* 작업일 */}
         <div className="flex flex-col">
          <h3 className="text-yellow-300">작업일</h3>
          <input
            type="datetime-local"
            name="created_at"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            className="text-black rounded-md p-2 w-full"
          />
        </div>
          {/* 부서 */}
          <div className="flex flex-col">
            <h3 className="text-yellow-300">부서</h3>
            <input
              type="text"
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="text-black rounded-md p-2 w-full"
            />
          </div>

        

          {/* 사용자 */}
          <div className="flex flex-col">
            <h3 className="text-yellow-300">사용자 (Pc description)</h3>
            <input
              ref={userInputRef}
              type="text"
              name="user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="text-black rounded-md p-2 w-full"
            />
          </div>

           {/* 의뢰인 */}
           <div className="flex flex-col col-span-1 md:col-span-2">
            <h3 className="text-yellow-300">의뢰인</h3>
            <input
              type="text"
              name="client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              className="text-black rounded-md p-2 w-full"
            />
          </div>

        {/* 모델명 - 반응형 그리드 수정 */}
        <div className="flex flex-col col-span-1 md:col-span-2">
          <h3 className="text-yellow-300">모델명</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {["Z4G4", "Z4G5", "Z440", "Z420", "G3", "G5", "G8", "G10"].map(
              (model) => (
                <div key={model} className="flex items-center gap-1">
                  <input
                    type="radio"
                    id={`model-${model}`}
                    name="model_name"
                    value={model}
                    checked={modelName === model}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor={`model-${model}`} className="text-white">
                    {model}
                  </label>
                </div>
              )
            )}
          </div>
        </div>

        {/* 시리얼 번호 */}
        <div className="flex flex-col">
          <h3 className="text-yellow-300">시리얼 번호</h3>
          <input
            type="text"
            name="serial"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            className="text-black rounded-md p-2 w-full"
          />
        </div>

        {/* 코드 */}
        <div className="flex flex-col">
          <h3 className="text-yellow-300">보안코드</h3>
          <input
            type="text"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-black rounded-md p-2 w-full"
          />
        </div>

        {/* 백업 여부 */}
        <div className="flex flex-col">
          <h3 className="text-yellow-300">백업 여부</h3>
          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="backup"
                checked={isBackup}
                onChange={() => setIsBackup(true)}
                className="w-4 h-4"
              />
              <span className="text-white">예</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="backup"
                checked={!isBackup}
                onChange={() => setIsBackup(false)}
                className="w-4 h-4"
              />
              <span className="text-white">아니오</span>
            </label>
          </div>
        </div>

        {/* 작업내용 */}
        <div className="flex flex-col col-span-1 md:col-span-2">
          <h3 className="text-yellow-300">작업내용</h3>
          <textarea
            name="task_details"
            value={taskDetails}
            onChange={(e) => setTaskDetails(e.target.value)}
            rows={4}
            className="text-black rounded-md p-2 w-full"
          />
        </div>
      </div>

    

      {/* 버튼 섹션 수정 */}
      <div className="flex justify-end items-center gap-2 mt-6">
        {editingId && (
          <button
            onClick={() => handleDelete(editingId)}
            disabled={isLoading}
            className="px-6 py-3 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 text-base"
          >
            삭제하기
          </button>
        )}
        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              // 폼 초기화
              setWorkType("");
              setCreatedAt(now);
              setReceivedDate(now);
              setUser("");
              setClient("");
              setDepartment("");
              setModelName("");
              setSerial("");
              setCode("");
              setIsBackup(false);
              setTaskDetails("");
            }}
            className="px-6 py-3 rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-200 text-base"
          >
            취소
          </button>
        )}
        <button
          onClick={() => editingId ? handleEdit(editingId) : onSave()}
          disabled={isLoading}
          className={`
            px-6 py-3 rounded-md text-white text-base
            ${isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"}
            transition-colors duration-200
          `}
        >
          {isLoading ? "처리 중..." : editingId ? "수정하기" : "작성하기"}
        </button>
      </div>

      {/* 수정 모드일 때 상단에 안내 메시지 추가 */}
      {editingId && (
        <div className="bg-blue-900 text-white p-4 rounded-md mb-4">
          ID: {editingId} 작업내역을 수정하고 있습니다.
        </div>
      )}

  {/* 정렬 컨트롤 */}
  <div className="flex items-center gap-4 mb-2">
        <div className="flex items-center gap-2">
          <label className="text-white">정렬 기준:</label>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as 'id' | 'created_at' | 'receivedDate')}
            className="bg-gray-700 text-white rounded-md px-2 py-1"
          >
            <option value="created_at">작업일</option>
            <option value="receivedDate">입고일</option>
            <option value="id">ID</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-white">정렬 순서:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="bg-gray-700 text-white rounded-md px-2 py-1"
          >
            <option value="desc">내림차순</option>
            <option value="asc">오름차순</option>
          </select>
        </div>
      </div>
      
      {/* 데이터 리스트 테이블 - 반응형 처리 */}
      <div className="w-full">
        <div className="border border-gray-700 rounded-lg">
          <table className="w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr className="border-b border-gray-700">
                <th className="py-2 text-yellow-300 text-xs sm:text-sm">
                  ID
                </th>
                <th className="py-2 text-yellow-300 text-xs sm:text-sm">
                  작업일
                </th>
                <th className="py-2 text-yellow-300 text-xs sm:text-sm">
                  입고일
                </th>
                <th className="py-2 text-yellow-300 text-xs sm:text-sm">
                  의뢰인
                </th>
                <th className=" py-2 text-yellow-300 text-xs sm:text-sm">
                  부서
                </th>
                <th className=" py-2 text-yellow-300 text-xs sm:text-sm">
                  모델명
                </th>
                <th className="py-2 text-yellow-300 text-xs sm:text-sm">
                  제조번호
                </th>
                <th className="py-2 text-yellow-300 text-xs sm:text-sm">
                  보안코드
                </th>
                <th className="text-yellow-300 text-xs sm:text-sm">
                  백업
                </th>
                <th className="py-2 text-yellow-300 text-xs sm:text-sm">
                  작업유형
                </th>
                <th className="hidden sm:table-cell px-2 sm:px-4 py-2 text-yellow-300 text-xs sm:text-sm">
                  작업내용
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {isDataLoading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-white">
                    데이터를 불러오는 중...
                  </td>
                </tr>
              ) : workHistoryData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-white">
                    작업 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                workHistoryData.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr
                      className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(item);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      <td className="px-2 sm:px-4 py-2 text-white text-xs sm:text-sm whitespace-nowrap">
                        {item.id}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-white text-xs sm:text-sm whitespace-nowrap">
                        <span className="hidden sm:inline">
                          {item.created_at ? formatDate(item.created_at) : "-"}
                        </span>
                        <span className="sm:hidden">
                          {item.created_at ? formatDate(item.created_at)?.slice(5) : "-"}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-white text-xs sm:text-sm whitespace-nowrap">
                        <span className="hidden sm:inline">
                          {item.receivedDate ? formatDate(item.receivedDate) : "-"}
                        </span>
                        <span className="sm:hidden">
                          {item.receivedDate ? formatDate(item.receivedDate)?.slice(5) : "-"}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-white text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] sm:max-w-none">
                        {item.user || "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-white text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[60px] sm:max-w-none">
                        {item.department || "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-white text-xs sm:text-sm whitespace-nowrap">
                        {item.model_name || "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-white text-xs sm:text-sm whitespace-nowrap overflow-hidden text-ellipsis max-w-[80px] sm:max-w-none">
                        {item.serial || "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-white text-xs sm:text-sm whitespace-nowrap">
                        {item.code || "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-white text-xs sm:text-sm whitespace-nowrap">
                        {item.isBackup !== undefined
                          ? item.isBackup
                            ? "예"
                            : "아니오"
                          : "-"}
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-white text-xs sm:text-sm whitespace-nowrap">
                        {item.work_type || "-"}
                      </td>
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2 text-white text-xs sm:text-sm">
                        <div className="whitespace-pre-wrap break-words">
                          {item.task_details || "-"}
                        </div>
                      </td>
                    </tr>
                    {expandedRows.includes(index) && (
                      <tr className="sm:hidden bg-gray-900">
                        <td colSpan={11} className="px-4 py-2 text-white text-xs">
                          <div className="font-bold text-yellow-300 mb-1">
                            작업내용:
                          </div>
                          <div className="whitespace-pre-wrap break-words">
                            {item.task_details || "-"}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
