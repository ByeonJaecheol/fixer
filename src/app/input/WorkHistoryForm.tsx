import { useState } from "react";
import { supabase } from "../utils/supabase";

interface WorkHistoryFormProps {
  editingId: number | null;
  initialData?: any;
  onCancel: () => void;
  onSuccess: () => Promise<void>;
}

export default function WorkHistoryForm({
  editingId,
  initialData,
  onCancel,
  onSuccess,
}: WorkHistoryFormProps) {
  const now = new Date().toISOString().slice(0, 16);
  const [isLoading, setIsLoading] = useState(false);
  const [createdAt, setCreatedAt] = useState(
    initialData?.created_at?.slice(0, 16) || now
  );
  const [receivedDate, setReceivedDate] = useState(
    initialData?.receivedDate?.slice(0, 16) || now
  );
  const [user, setUser] = useState(initialData?.user || "");
  const [department, setDepartment] = useState(initialData?.department || "");
  const [modelName, setModelName] = useState(initialData?.model_name || "");
  const [serial, setSerial] = useState(initialData?.serial || "");
  const [code, setCode] = useState(initialData?.code || "");
  const [isBackup, setIsBackup] = useState(initialData?.isBackup || false);
  const [taskDetails, setTaskDetails] = useState(
    initialData?.task_details || ""
  );

  const handleSubmit = async () => {
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
      if (editingId) {
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
          .eq("id", editingId);

        if (error) throw error;
        alert("수정이 완료되었습니다.");
      } else {
        const { error } = await supabase.from("work-history").insert({
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

        if (error) throw error;
        alert("저장되었습니다.");
      }

      await onSuccess();
      if (editingId) {
        onCancel();
      }
    } catch (error) {
      console.error(error);
      alert(
        editingId
          ? "수정 중 오류가 발생했습니다."
          : "저장 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId || !confirm("정말로 이 작업내역을 삭제하시겠습니까?")) {
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("work-history")
        .delete()
        .eq("id", editingId);

      if (error) throw error;

      alert("삭제되었습니다.");
      await onSuccess();
      onCancel();
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {editingId && (
        <div className="bg-blue-900 text-white p-4 rounded-md mb-4">
          ID: {editingId} 작업내역을 수정하고 있습니다.
        </div>
      )}
      <div className="space-y-4">
        {editingId && (
          <div className="bg-blue-900 text-white p-4 rounded-md mb-4">
            ID: {editingId} 작업내역을 수정하고 있습니다.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              작업일
            </label>
            <input
              type="datetime-local"
              value={createdAt}
              onChange={(e) => setCreatedAt(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              입고일
            </label>
            <input
              type="datetime-local"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              의뢰인
            </label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
              placeholder="의뢰인 이름"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              부서
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
              placeholder="부서명"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              모델명
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
              placeholder="모델명"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              시리얼번호
            </label>
            <input
              type="text"
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
              placeholder="시리얼번호"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              코드
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
              placeholder="코드"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isBackup}
                onChange={(e) => setIsBackup(e.target.checked)}
                className="form-checkbox h-5 w-5 text-yellow-500 rounded focus:ring-yellow-500 focus:ring-offset-gray-800"
              />
              <span className="ml-2 text-sm text-gray-300">백업</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            작업내용
          </label>
          <textarea
            value={taskDetails}
            onChange={(e) => setTaskDetails(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-yellow-500"
            placeholder="작업내용을 입력하세요"
          />
        </div>

        <div className="flex justify-end items-center gap-2 mt-6">
          {editingId && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-6 py-3 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 text-base"
            >
              삭제하기
            </button>
          )}
          {editingId && (
            <button
              onClick={onCancel}
              className="px-6 py-3 rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-200 text-base"
            >
              취소
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`
            px-6 py-3 rounded-md text-white text-base
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
        </div>
      </div>

      <div className="flex justify-end items-center gap-2 mt-6">
        {editingId && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-6 py-3 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors duration-200 text-base"
          >
            삭제하기
          </button>
        )}
        {editingId && (
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-md text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-200 text-base"
          >
            취소
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`
            px-6 py-3 rounded-md text-white text-base
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
      </div>
    </div>
  );
}
