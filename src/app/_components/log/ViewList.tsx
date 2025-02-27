import React from "react";

export default function ViewList({ workHistoryData, isDataLoading, expandedRows, startEdit, formatDate }: { workHistoryData: any[], isDataLoading: boolean, expandedRows: number[], startEdit: (item: any) => void, formatDate: (date: string) => string }) {
  
    return (
    <>
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
    </>
  );
}
