"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { Database } from "../../../types_db";

export default function InputHistory() {
  const [logs, setLogs] = useState<
    Database["public"]["Tables"]["work-history"]["Row"][]
  >([]);
  // 현재 시간을 포함한 날짜 문자열 생성
  const now = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm 형식

  // 개별 상태값 관리
  const [createdAt, setCreatedAt] = useState(now);
  const [receivedDate, setReceivedDate] = useState(now);
  const [user, setUser] = useState("");
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

  // 날짜 포맷팅 헬퍼 함수 추가
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return dateString.split("T")[0];
    } catch (error) {
      return "-";
    }
  };

  // 컴포넌트 마운트 시 의뢰인 입력 필드에 포커스
  useEffect(() => {
    userInputRef.current?.focus();
  }, []);

  //작업내역 불러오기
  const fetchWorkHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("work-history")
        .select("*")
        .order("id", { ascending: false });

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
  //작업내역 저장
  const onSave = async () => {
    if (
      !createdAt ||
      !receivedDate ||
      !user ||
      !department ||
      !modelName ||
      !serial ||
      !code
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
        department: department,
        model_name: modelName,
        serial: serial,
        code: code,
        isBackup: isBackup,
        task_details: taskDetails,
      });

      if (error) {
        throw error;
      }

      alert("저장되었습니다.");
      // 폼 초기화
      setCreatedAt(now);
      setReceivedDate(now);
      setUser("");
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

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchWorkHistory();
  }, []);

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
          department: department,
          model_name: modelName,
          serial: serial,
          code: code,
          isBackup: isBackup,
          task_details: taskDetails,
        })
        .eq("id", id);

      if (error) throw error;

      alert("수정이 완료되었습니다.");
      setEditingId(null);
      // 폼 초기화
      setCreatedAt(now);
      setReceivedDate(now);
      setUser("");
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
    setCreatedAt(item.created_at?.slice(0, 16) || now);
    setReceivedDate(item.received_date?.slice(0, 16) || now);
    setUser(item.user || "");
    setDepartment(item.department || "");
    setModelName(item.model_name || "");
    setSerial(item.serial || "");
    setCode(item.code || "");
    setIsBackup(item.is_backup || false);
    setTaskDetails(item.task_details || "");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 p-4">
      {/* 입력 폼 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* 의뢰인 */}
        <div className="flex flex-col">
          <h3 className="text-yellow-300">의뢰인</h3>
          <input
            ref={userInputRef}
            type="text"
            name="user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
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
          <h3 className="text-yellow-300">코드</h3>
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

      {/* 작업내용 입력 후 제출 버튼 */}
      <div className="flex justify-end mt-4">
        <button
          onClick={() => (editingId ? handleEdit(editingId) : onSave())}
          disabled={isLoading}
          className={`
                        px-4 py-2 rounded-md text-white
                        ${
                          isLoading
                            ? "bg-gray-500 cursor-not-allowed"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        }
                        transition-colors duration-200
                    `}
        >
          {isLoading ? "처리 중..." : editingId ? "수정하기" : "작성하기"}
        </button>
        {editingId && (
          <button
            onClick={() => {
              setEditingId(null);
              // 폼 초기화
              setCreatedAt(now);
              setReceivedDate(now);
              setUser("");
              setDepartment("");
              setModelName("");
              setSerial("");
              setCode("");
              setIsBackup(false);
              setTaskDetails("");
            }}
            className="ml-2 px-4 py-2 rounded-md text-white bg-gray-600 hover:bg-gray-700"
          >
            취소
          </button>
        )}
      </div>

      {/* 수정 모드일 때 상단에 안내 메시지 추가 */}
      {editingId && (
        <div className="bg-blue-900 text-white p-4 rounded-md mb-4">
          ID: {editingId} 작업내역을 수정하고 있습니다.
        </div>
      )}

      {/* 데이터 리스트 테이블 - 반응형 처리 */}
      <div className="w-full">
        <div className="border border-gray-700 rounded-lg">
          <table className="w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr className="border-b border-gray-700">
                <th className="px-2 sm:px-4 py-2 text-yellow-300 text-xs sm:text-sm">
                  ID
                </th>
                <th className="px-2 sm:px-4 py-2 text-yellow-300 text-xs sm:text-sm">
                  작업일
                </th>
                <th className="px-2 sm:px-4 py-2 text-yellow-300 text-xs sm:text-sm">
                  입고일
                </th>
                <th className="px-2 sm:px-4 py-2 text-yellow-300 text-xs sm:text-sm">
                  의뢰인
                </th>
                <th className="px-2 sm:px-4 py-2 text-yellow-300 text-xs sm:text-sm">
                  부서
                </th>
                <th className="px-2 sm:px-4 py-2 text-yellow-300 text-xs sm:text-sm">
                  모델명
                </th>
                <th className="px-2 sm:px-4 py-2 text-yellow-300 text-xs sm:text-sm">
                  시리얼번호
                </th>
                <th className="px-2 sm:px-4 py-2 text-yellow-300 text-xs sm:text-sm">
                  코드
                </th>
                <th className="px-2 sm:px-4 py-2 text-yellow-300 text-xs sm:text-sm">
                  백업
                </th>
                <th className="hidden sm:table-cell px-2 sm:px-4 py-2 text-yellow-300 text-xs sm:text-sm">
                  작업내용
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {isDataLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-white">
                    데이터를 불러오는 중...
                  </td>
                </tr>
              ) : workHistoryData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-white">
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
                          {formatDate(item.created_at)}
                        </span>
                        <span className="sm:hidden">
                          {formatDate(item.created_at)?.slice(5) || "-"}
                        </span>
                      </td>
                      <td className="px-2 sm:px-4 py-2 text-white text-xs sm:text-sm whitespace-nowrap">
                        <span className="hidden sm:inline">
                          {formatDate(item.receivedDate)}
                        </span>
                        <span className="sm:hidden">
                          {formatDate(item.receivedDate)?.slice(5) || "-"}
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
                      <td className="hidden sm:table-cell px-2 sm:px-4 py-2 text-white text-xs sm:text-sm">
                        <div className="whitespace-pre-wrap break-words">
                          {item.task_details || "-"}
                        </div>
                      </td>
                    </tr>
                    {expandedRows.includes(index) && (
                      <tr className="sm:hidden bg-gray-900">
                        <td
                          colSpan={9}
                          className="px-4 py-2 text-white text-xs"
                        >
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
