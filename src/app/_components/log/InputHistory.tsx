"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
import { Database } from "../../../../types_db";
import WorkType from "./WorkType";
import InputDate from "./InputDate";
import DebugLog from "../debug/DebugLog";
import InputUser from "./InputUser";
import InputModelName from "./InputModelName";
import InputSerial from "./InputSerial";
import InputTaskDetails from "./InputDescription";
import ButtonGroup from "./ButtonGroup";
import MiddleNotice from "./MiddleNotice";
import SortField from "./SortField";
import ViewList from "./ViewList";

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
  const [pcName, setPcName] = useState("");

  // useRef 추가
  const userInputRef = React.useRef<HTMLInputElement>(null!);

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
  const [sortField, setSortField] = useState<'id' | 'created_at' | 'receivedDate' | 'pc_name'>('created_at');
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

  const DebugPanel = ({ states }: { states: any }) => {
    return (
      <details className="mt-4 p-4 border rounded-lg bg-gray-50">
        <summary className="cursor-pointer font-semibold text-gray-700">
          디버그 정보 보기
        </summary>
        <pre className="mt-2 p-2 bg-white rounded text-sm overflow-auto">
          {JSON.stringify(states, null, 2)}
        </pre>
      </details>
    );
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
      !workType ||
      !pcName
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
        pc_name: pcName,
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
      setPcName("");
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

  // 수정 함수 수정
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
          pc_name: pcName,
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

  // 수정할 항목 선택 함수 수정
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
    setPcName(item.pc_name || "");
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
     <WorkType workType={workType} setWorkType={setWorkType} />
      {/* 입력 폼 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputDate receivedDate={receivedDate} createdAt={createdAt} setReceivedDate={setReceivedDate} setCreatedAt={setCreatedAt} />
      <InputUser department={department} setDepartment={setDepartment} user={user} setUser={setUser} client={client} setClient={setClient} userInputRef={userInputRef} pcName={pcName} setPcName={setPcName} />
      <InputModelName modelName={modelName} setModelName={setModelName} />
      <InputSerial serial={serial} setSerial={setSerial} code={code} setCode={setCode} />
      <InputTaskDetails taskDetails={taskDetails} setTaskDetails={setTaskDetails} />
      </div>
      {/* 입력 폼 섹션 끝 */}
      <ButtonGroup editingId={editingId} handleDelete={handleDelete} isLoading={isLoading} onSave={onSave} handleEdit={handleEdit} setEditingId={setEditingId} setWorkType={setWorkType} setCreatedAt={setCreatedAt} setReceivedDate={setReceivedDate} setUser={setUser} setClient={setClient} setDepartment={setDepartment} setModelName={setModelName} setSerial={setSerial} setCode={setCode} setIsBackup={setIsBackup} setTaskDetails={setTaskDetails} />
      
      
      {/* 안내 메시지 */}
      <MiddleNotice editingId={editingId} />
      {/* 정렬 필드 */}
      <SortField
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      {/* 데이터 리스트 */}
      <ViewList
        workHistoryData={workHistoryData}
        isDataLoading={isDataLoading}
        expandedRows={expandedRows}
        startEdit={startEdit}
        formatDate={formatDate}
      />
      <DebugLog workType={workType} receiveDate={receivedDate} createdAt={createdAt} pcName={pcName} department={department} user={user} client={client} modelName={modelName} serial={serial} code={code} taskDetails={taskDetails} />
    </div>
  );
}
