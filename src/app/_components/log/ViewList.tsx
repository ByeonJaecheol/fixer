import React from 'react';
import { Database } from '../../../../types_db';

interface ViewListProps {
  workHistoryData: Database['public']['Tables']['work-history']['Row'][];
  isDataLoading: boolean;
  formatDate: (date: string) => string;
}

export default function ViewList({
  workHistoryData,
  isDataLoading,
  formatDate
}: ViewListProps) {
  if (isDataLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!workHistoryData.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        작업 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* 헤더 */}
      <div className="grid grid-cols-8 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
        <div>작업일자</div>
        <div>접수일자</div>
        <div>작업유형</div>
        <div>사용자</div>
        <div>부서</div>
        <div>PC명</div>
        <div>작업내용</div>
      </div>

      {/* 데이터 핸들 */}
      <div className="divide-y divide-gray-200">
        {workHistoryData.map((item) => (
          <div 
            key={item.id}
            className="grid grid-cols-8 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out items-center"
          >
            <div className="text-sm text-gray-900">
              {formatDate(item.created_at)}
            </div>
            <div className="text-sm text-gray-900">
              {item.receivedDate ? formatDate(item.receivedDate) : ''}
            </div>
            <div>
              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                {item.work_type}
              </span>
            </div>
            <div className="text-sm text-gray-900">
              {item.user}
            </div>
            <div className="text-sm text-gray-500">
              {item.department}
            </div>
            <div className="text-sm text-gray-500">
              {item.pc_name}
            </div>
            <div className="text-sm text-gray-500">
              <div className="max-w-xs truncate">
                {item.task_details}
              </div>
            </div>
            
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <div className="px-6 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            총 <span className="font-medium">{workHistoryData.length}</span> 건
          </div>
        </div>
      </div>
    </div>
  );
}
