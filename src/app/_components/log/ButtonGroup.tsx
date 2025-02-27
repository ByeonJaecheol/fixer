export default function ButtonGroup({ editingId, handleDelete, isLoading, onSave, handleEdit, setEditingId, setWorkType, setCreatedAt,
     setReceivedDate, setUser, setClient, setDepartment, setModelName, setSerial, setCode, setIsBackup, setTaskDetails }: 
     { editingId: number | null, handleDelete: (id: number) => void, isLoading: boolean, onSave: () => void, handleEdit: (id: number) => void, setEditingId: (id: number | null) => void, setWorkType: (workType: string) => void, setCreatedAt: (createdAt: string) => void, setReceivedDate: (receivedDate: string) => void, setUser: (user: string) => void, setClient: (client: string) => void, setDepartment: (department: string) => void, setModelName: (modelName: string) => void, setSerial: (serial: string) => void, setCode: (code: string) => void, setIsBackup: (isBackup: boolean) => void, setTaskDetails: (taskDetails: string) => void }) {
  const now = new Date().toISOString();
    return (
    <>
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
    </>
  );
}
