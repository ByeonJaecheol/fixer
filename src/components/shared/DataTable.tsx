'use client';

import React from 'react';
import Link from 'next/link';
import { formatToKoreanTime, truncateDescription } from "@/utils/utils";

// 셀 타입 정의
export type CellType = 
  | 'text' 
  | 'date' 
  | 'email' 
  | 'truncate' 
  | 'badge' 
  | 'pc_type' 
  | 'work_type'
  | 'availability';

// 열 정의 인터페이스
export interface Column {
  key: string;
  header: string;
  width?: string;
  type?: CellType;
  badgeColors?: Record<string, string>;
  accessor?: string; // 중첩 객체 접근을 위한 경로 (예: 'pc_assets.model_name')
  truncateLength?: number;
}

// Props 인터페이스
interface DataTableProps {
  columns: Column[];
  data: any[];
  gridTemplateColumns?: string;
  detailUrlPrefix: string;
  idField?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  gridTemplateColumns,
  detailUrlPrefix,
  idField = 'log_id'
}) => {
  // 그리드 스타일 계산
  const gridStyle = {
    gridTemplateColumns: gridTemplateColumns || `repeat(${columns.length}, 1fr)`
  };

  // 중첩 객체에서 값 가져오기
  const getNestedValue = (obj: any, path?: string) => {
    if (!path) return obj;
    return path.split('.').reduce((prev, curr) => (prev && prev[curr]) ? prev[curr] : null, obj);
  };

  // 셀 렌더링 함수
  const renderCell = (column: Column, item: any) => {
    const value = column.accessor 
      ? getNestedValue(item, column.accessor) 
      : item[column.key];
    
    if (value === null || value === undefined) return '-';
    
    switch (column.type) {
      case 'date':
        return formatToKoreanTime(value, 'date');
      
      case 'email':
        return value.split('@')[0];
      
      case 'truncate':
        return truncateDescription(value, column.truncateLength || 30);
      
      case 'badge':
        const colorClass = column.badgeColors?.[value] || 'bg-gray-100 text-gray-800';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {value}
          </span>
        );
      
      case 'pc_type':
        const pcType = value;
        if (!pcType) return '-';
        
        const pcTypeDisplay = pcType === '데스크탑' ? 'DESKTOP' : 'NOTEBOOK';
        const pcTypeColor = pcType === '데스크탑' 
          ? 'bg-purple-100 text-purple-800' 
          : 'bg-green-100 text-green-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${pcTypeColor}`}>
            {pcTypeDisplay}
          </span>
        );
      
      case 'work_type':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {value}
          </span>
        );
      
      case 'availability':
        let availClass = 'bg-gray-100 text-gray-800';
        let displayText = '-';
        
        if (value === '사용가능') {
          availClass = 'bg-green-100 text-green-800';
          displayText = 'Y';
        } else if (value === '사용불가') {
          availClass = 'bg-red-100 text-red-800';
          displayText = 'N';
        } else if (value === true) {
          availClass = 'bg-green-100 text-green-800';
          displayText = 'Y';
        } else if (value === false) {
          availClass = 'bg-red-100 text-red-800';
          displayText = 'N';
        }
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${availClass}`}>
            {displayText}
          </span>
        );
      
      default:
        return value;
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            {/* 헤더 부분 */}
            <div className="grid border-b border-gray-200" style={gridStyle}>
              {columns.map((column) => (
                <div 
                  key={column.key} 
                  className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={column.width ? { width: column.width } : {}}
                >
                  {column.header}
                </div>
              ))}
            </div>
            
            {/* 데이터 행 */}
            {data.map((item) => (
              <Link 
                href={`${detailUrlPrefix}/${item[idField]}`}
                key={item[idField]}
                style={gridStyle}
                className="grid border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
              >
                {columns.map((column, columnIndex) => {
                  const needsTitle = ['question', 'detailed_description', 'solution_detail'].includes(column.key);
                  const cellValue = column.accessor 
                    ? getNestedValue(item, column.accessor) 
                    : item[column.key];
                  
                  return (
                    <div 
                      key={`${item[idField]}-${column.key}`}
                      className={`px-2 py-4 text-sm text-gray-500 text-center 
                        ${columnIndex === 0 ? 'bg-gray-50' : ''} 
                        ${needsTitle ? 'border-l border-gray-200' : ''}`}
                      title={needsTitle ? cellValue : undefined}
                    >
                      {renderCell(column, item)}
                    </div>
                  );
                })}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable; 