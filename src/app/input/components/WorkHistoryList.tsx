import React, { useState } from "react";
// import { formatDate } from '@/lib/utils';

interface WorkHistoryListProps {
  data: any[];
  onEdit: (item: any) => void;
  isLoading?: boolean;
}

export default function WorkHistoryList({
  data,
  onEdit,
  isLoading = false,
}: WorkHistoryListProps) {
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const toggleRowExpansion = (index: number) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };
  // 날짜 포맷팅 헬퍼 함수 추가
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return dateString.split("T")[0];
    } catch (error) {
      return "-";
    }
  };

  return (
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
            {isLoading ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-white">
                  데이터를 불러오는 중...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-white">
                  작업 내역이 없습니다.
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <React.Fragment key={index}>
                  <tr
                    className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer"
                    onClick={() => {
                      if (window.innerWidth < 640) {
                        toggleRowExpansion(index);
                      } else {
                        onEdit(item);
                      }
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
                      <td colSpan={9} className="px-4 py-2 text-white text-xs">
                        <div className="font-bold text-yellow-300 mb-1">
                          작업내용:
                        </div>
                        <div className="whitespace-pre-wrap break-words mb-2">
                          {item.task_details || "-"}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                          }}
                          className="text-blue-400 hover:text-blue-300 w-full text-center py-2 border border-blue-400 rounded-md"
                        >
                          수정하기
                        </button>
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
  );
}
