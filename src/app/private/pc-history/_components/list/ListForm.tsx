export default function ListForm() {
  return (
    <div className="space-y-4">
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* 헤더 부분 */}
        <div className="grid border-b border-gray-200" >
          <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</div>
          <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작성자</div>
          <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업일</div>
          <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업유형</div>
          <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">PC타입</div>
          <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">모델명</div>
          <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">제조번호</div>
          <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">코드번호</div>
          <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">용도</div>
          <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">작업내용</div>
        </div>
       
        </div>
    </div>
  </div>
</div>
  );
}
