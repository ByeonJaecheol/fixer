'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import SupabaseService, { IPcManagementLog } from '@/api/supabase/supabaseApi';
import { RingLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';
import { formatToKoreanTime, truncateDescription } from "@/utils/utils";

// 날짜 필터 타입 정의
type DateFilterType = 'today' | 'week' | 'month' | 'year' | 'custom' | 'all';

// 셀 타입 정의 (DataTable과 동일하게 유지)
type CellType = 
  | 'text' 
  | 'date' 
  | 'email' 
  | 'truncate' 
  | 'badge' 
  | 'pc_type' 
  | 'work_type'
  | 'availability';

// 열 정의 인터페이스 (DataTable과 동일)
interface Column {
  key: string;
  header: string;
  width?: string;
  type?: CellType;
  badgeColors?: Record<string, string>;
  accessor?: string;
  truncateLength?: number;
}

export default function PcHistoryPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pcManagementLog, setPcManagementLog] = useState<IPcManagementLog[]>([]);
  const [filteredData, setFilteredData] = useState<IPcManagementLog[]>([]);
  const router = useRouter();
  
  // URL에서 기간 파라미터 가져오기
  const period = searchParams.get('period') as DateFilterType || 'all';
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');
  
  // 검색 기간 상태
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  
  // 기간 라벨 표시
  const getPeriodLabel = (periodType: DateFilterType) => {
    switch (periodType) {
      case 'today': return '오늘';
      case 'week': return '이번 주';
      case 'month': return '이번달';
      case 'year': return '올해';
      case 'custom': return '선택 기간';
      default: return '전체 기간';
    }
  };

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const supabaseService = SupabaseService.getInstance();
        const { success, error, data } = await supabaseService.selectWithRelations({
          table: 'pc_management_log',
          columns: '*',
          relations: [
            { 
              table: 'pc_assets',
              columns: '*'
            }
          ],
          order: { column: 'created_at', ascending: false }
        });
        
        if (success) {
          setPcManagementLog(data || []);
        } else {
          console.error('Error fetching pc_management_log:', error);
          setError('PC 이력 데이터를 불러오는 중 오류가 발생했습니다.');
          setPcManagementLog([]);
        }
      } catch (error) {
        console.error('데이터 불러오기 오류:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // 데이터 날짜 필터링
  useEffect(() => {
    if (!pcManagementLog.length) return;
    
    // 날짜 필터링이 필요한 경우
    if (period !== 'all' && startDateParam && endDateParam) {
      try {
        const startDate = parseISO(startDateParam);
        const endDate = parseISO(endDateParam);
        
        // 하루 끝까지 포함하기 위해 endDate 조정
        endDate.setHours(23, 59, 59, 999);
        
        // 날짜 범위에 맞는 이력만 필터링
        const filtered = pcManagementLog.filter(log => {
          const logDate = new Date(log.created_at);
          return isWithinInterval(logDate, { start: startDate, end: endDate });
        });
        
        setFilteredData(filtered);
      } catch (err) {
        console.error('날짜 필터링 오류:', err);
        // 필터링 오류 시 모든 데이터 표시
        setFilteredData(pcManagementLog);
      }
    } else {
      // 필터링이 필요 없는 경우 모든 데이터 표시
      setFilteredData(pcManagementLog);
    }
  }, [pcManagementLog, period, startDateParam, endDateParam]);
  
  // 기간 필터 적용 함수
  const applyDateFilter = () => {
    let url = '/private/pc-history';
    
    if (dateFilter !== 'all') {
      const params = [];
      params.push(`period=${dateFilter}`);
      
      if (dateFilter === 'custom') {
        params.push(`startDate=${customDateRange.start}`);
        params.push(`endDate=${customDateRange.end}`);
      } else {
        // 오늘, 이번 주, 이번달, 올해 등의 날짜 계산
        const today = new Date();
        let startDate, endDate;
        
        switch(dateFilter) {
          case 'today':
            startDate = endDate = format(today, 'yyyy-MM-dd');
            break;
          case 'week':
            // 이번 주 월요일부터 일요일까지
            const day = today.getDay();
            const diff = today.getDate() - day + (day === 0 ? -6 : 1); // 현재 날짜로부터 이번 주 월요일까지 차이
            startDate = format(new Date(today.setDate(diff)), 'yyyy-MM-dd');
            endDate = format(new Date(new Date(startDate).setDate(new Date(startDate).getDate() + 6)), 'yyyy-MM-dd');
            break;
          case 'month':
            // 이번 달 1일부터 말일까지
            startDate = format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd');
            endDate = format(new Date(today.getFullYear(), today.getMonth() + 1, 0), 'yyyy-MM-dd');
            break;
          case 'year':
            // 올해 1월 1일부터 12월 31일까지
            startDate = format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd');
            endDate = format(new Date(today.getFullYear(), 11, 31), 'yyyy-MM-dd');
            break;
        }
        
        params.push(`startDate=${startDate}`);
        params.push(`endDate=${endDate}`);
      }
      
      url += `?${params.join('&')}`;
    }
    
    window.location.href = url;
  };

  // 테이블 열 정의
  const columns: Column[] = [
    { key: "log_id", header: "ID" },
    { key: "created_by", header: "작성자", type: "email" },
    { key: "work_date", header: "작업일", type: "date" },
    { key: "work_type", header: "작업유형", type: "work_type" },
    { key: "pc_type", header: "PC타입", type: "pc_type", accessor: "pc_assets.pc_type" },
    { key: "model_name", header: "모델명", accessor: "pc_assets.model_name" },
    { key: "serial_number", header: "제조번호", accessor: "pc_assets.serial_number" },
    { key: "security_code", header: "코드번호" },
    { key: "detailed_description", header: "작업내용", type: "truncate", truncateLength: 30 }
  ];

  // 중첩 객체에서 값 가져오기
  const getNestedValue = (obj: any, path?: string) => {
    if (!path) return obj;
    return path.split('.').reduce((prev, curr) => (prev && prev[curr]) ? prev[curr] : null, obj);
  };

  // 셀 렌더링 함수 - DataTable의 renderCell과 동일한 로직 유지
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
      
      case 'pc_type':
        const pcType = value;
        if (!pcType) return '-';
        
        const pcTypeDisplay = pcType === '데스크탑' ? 'DT' : 'NT';
        const pcTypeColor = pcType === '데스크탑' 
          ? 'bg-purple-100 text-purple-800' 
          : 'bg-green-100 text-green-800';
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${pcTypeColor}`}>
            {pcTypeDisplay}
          </span>
        );
      
      case 'work_type':
        let workTypeColor;
        switch(value) {
          case '등록': workTypeColor = 'bg-green-100 text-green-800'; break;
          case '출고': workTypeColor = 'bg-blue-100 text-blue-800'; break;
          case '폐기': workTypeColor = 'bg-red-100 text-red-800'; break;
          case '반납': workTypeColor = 'bg-yellow-100 text-yellow-800'; break;
          case '변경': workTypeColor = 'bg-purple-100 text-purple-800'; break;
          default: workTypeColor = 'bg-gray-100 text-gray-800';
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${workTypeColor}`}>
            {value}
          </span>
        );
      
      default:
        return value;
    }
  };

  // 직접 JSX를 사용한 테이블 구현 (DataTable 스타일과 동일하게 유지)
  const renderTable = () => {
    // 그리드 스타일 계산 - 상세보기 열 제거로 인한 조정
    const gridTemplateColumns = "8% 8% 8% 8% 5% 8% 8% 8% 8% 31%";
    const gridStyle = {
      gridTemplateColumns
    };

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {/* 헤더 부분 - DataTable과 동일한 스타일 적용 */}
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
              
              {/* 데이터 행 - DataTable과 유사한 스타일 및 동작 */}
              {filteredData.map((log, rowIdx) => {
                // 작업 유형에 따른 상세 페이지 경로 설정
                let detailPath = '';
                switch(log.work_type) {
                  case '등록': detailPath = 'in'; break;
                  case '출고': detailPath = 'install'; break;
                  case '폐기': detailPath = 'dispose'; break;
                  case '반납': detailPath = 'return'; break;
                  case '변경': detailPath = 'change'; break;
                  default: detailPath = 'other';
                }
                
                // 상세 페이지 URL
                const detailUrl = `/private/pc-history/${detailPath}/detail/${log.log_id}`;
                
                return (
                  <div
                    key={`row-${rowIdx}`}
                    style={gridStyle}
                    className="grid border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                  >
                    {/* ID 열 - 클릭 가능 */}
                    <Link 
                      href={detailUrl}
                      className="px-2 py-4 text-sm text-center bg-gray-50 cursor-pointer"
                    >
                      {log.log_id}
                    </Link>
                    
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      {renderCell({ key: "created_by", header: "작성자", type: "email" }, log)}
                    </div>
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      {renderCell({ key: "work_date", header: "작업일", type: "date" }, log)}
                    </div>
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      {renderCell({ key: "work_type", header: "작업유형", type: "work_type" }, log)}
                    </div>
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      {renderCell({ key: "pc_type", header: "PC타입", type: "pc_type", accessor: "pc_assets.pc_type" }, log)}
                    </div>
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      {getNestedValue(log, "pc_assets.model_name") || '-'}
                    </div>
                    <div className="px-2 py-4 text-sm text-gray-500 text-center font-mono">
                      {getNestedValue(log, "pc_assets.serial_number") || '-'}
                    </div>
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      {log.security_code || '-'}
                    </div>
                    {/* 사용자 */}
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      {log.employee_name}
                    </div>
                    
                    {/* 작업내용 열 - 클릭 가능 */}
                    <Link 
                      href={detailUrl}
                      className="px-2 py-4 text-sm truncate cursor-pointer"
                    >
                      {renderCell({ key: "detailed_description", header: "작업내용", type: "truncate", truncateLength: 30 }, log)}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <RingLoader speedMultiplier={1.5} color="#982cd6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 기간 필터 UI */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 현재 선택된 기간 표시 */}
          {period !== 'all' && startDateParam && endDateParam && (
            <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium text-sm whitespace-nowrap">
                {getPeriodLabel(period)} ({format(parseISO(startDateParam), 'yyyy-MM-dd')} ~ {format(parseISO(endDateParam), 'yyyy-MM-dd')})
              </span>
              <Link 
                href="/private/pc-history"
                className="ml-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-full font-medium"
              >
                초기화
              </Link>
            </div>
          )}
          
          <button 
            onClick={() => setDateFilterOpen(!dateFilterOpen)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            기간 검색
          </button>
        </div>
        
        {/* 기간 필터 확장 UI */}
        {dateFilterOpen && (
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex flex-wrap gap-4">
              <div className="space-x-2">
                <span className="text-sm font-medium text-gray-700">기간:</span>
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as DateFilterType)}
                  className="text-sm border border-gray-300 rounded-md p-1.5"
                >
                  <option value="all">전체 기간</option>
                  <option value="today">오늘</option>
                  <option value="week">이번 주</option>
                  <option value="month">이번달</option>
                  <option value="year">올해</option>
                  <option value="custom">직접 지정</option>
                </select>
              </div>
              
              {dateFilter === 'custom' && (
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={customDateRange.start}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="text-sm border border-gray-300 rounded-md p-1.5"
                  />
                  <span className="text-gray-600">~</span>
                  <input
                    type="date"
                    value={customDateRange.end}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="text-sm border border-gray-300 rounded-md p-1.5"
                  />
                </div>
              )}
              
              <button
                onClick={applyDateFilter}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                적용
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* DataTable과 스타일이 일치하는 커스텀 테이블 */}
      {renderTable()}
    </div>
  );
}
