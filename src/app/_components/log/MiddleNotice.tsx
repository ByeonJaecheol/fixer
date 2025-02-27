export default function MiddleNotice({ editingId }: { editingId: number | null }) {
  return (
    <>
        {/* 수정 모드일 때 상단에 안내 메시지 추가 */}
        {editingId && (
        <div className="bg-blue-900 text-white p-4 rounded-md mb-4">
          ID: {editingId} 작업내역을 수정하고 있습니다.
        </div>
      )}
    </>
  );
}
