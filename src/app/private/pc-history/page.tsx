'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SupabaseService, { IPcManagementLog } from '@/api/supabase/supabaseApi';
import { formatToKoreanTime, truncateDescription } from '@/utils/utils';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { RingLoader } from 'react-spinners';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import PcWriteButton from './_components/PcWriteButton';

// 필터 타입 정의
type SortField = 'log_id' | 'created_by' | 'work_date' | 'work_type' | 'pc_type' | 'model_name' | 'security_code';
type SortDirection = 'asc' | 'desc';
type DateFilterType = 'today' | 'week' | 'month' | 'year' | 'custom' | 'all';
type FilterState = {
  sortField: SortField;
  sortDirection: SortDirection;
  workTypeFilter: string | null;
  pcTypeFilter: string | null;
  searchTerm: string;
  pageSize: number;
  currentPage: number;
};

// 페이지 크기 옵션
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// 로컬 스토리지 키
const FILTER_STORAGE_KEY = 'pc_history_filter_state';

export default function PcHistoryPage() {
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState<IPcManagementLog[]>([]);
  const [filteredByDateLogs, setFilteredByDateLogs] = useState<IPcManagementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // URL에서 기간 파라미터 가져오기
  const period = searchParams.get('period') as DateFilterType || 'all';
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');
  
  // 필터 상태
  const [filterState, setFilterState] = useState<FilterState>({
    sortField: 'work_date',
    sortDirection: 'desc',
    workTypeFilter: null,
    pcTypeFilter: null,
    searchTerm: '',
    pageSize: 20,
    currentPage: 1,
  });
  
  // 작업 유형 옵션
  const workTypeOptions = ['전체', '입고', '출고', '반납', '폐기', '변경'];
  
  // PC 타입 옵션
  const pcTypeOptions = ['전체', 'Desktop', 'Laptop', 'All-in-One'];
  
  const gridStyle = {
    gridTemplateColumns: "8% 8% 8% 8% 8% 8% 10% 8% 30%"
  };
  
  // 기간 라벨 표시
  const getPeriodLabel = () => {
    switch (period) {
      case 'today': return '오늘';
      case 'week': return '이번 주';
      case 'month': return '이번달';
      case 'year': return '올해';
      case 'custom': return '선택 기간';
      default: return '전체 기간';
    }
  };

  // 필터 상태 로컬 스토리지에서 불러오기
  useEffect(() => {
    const savedFilter = localStorage.getItem(FILTER_STORAGE_KEY);
    if (savedFilter) {
      try {
        const parsedFilter = JSON.parse(savedFilter);
        setFilterState(parsedFilter);
      } catch (e) {
        console.error('Failed to parse saved filter:', e);
      }
    }
  }, []);

  // 필터 상태 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filterState));
  }, [filterState]);

  // 데이터 가져오기
  useEffect(() => {
    async function fetchData() {
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
          setLogs(data || []);
        } else {
          console.error('Error fetching pc_management_log:', error);
          setError('PC 이력 데이터를 불러오는 중 오류가 발생했습니다.');
          setLogs([]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // 데이터 날짜 필터링
  useEffect(() => {
    if (!logs.length) return;
    
    // 날짜 필터링이 필요한 경우
    if (period !== 'all' && startDateParam && endDateParam) {
      try {
        const startDate = parseISO(startDateParam);
        const endDate = parseISO(endDateParam);
        
        // 하루 끝까지 포함하기 위해 endDate 조정
        endDate.setHours(23, 59, 59, 999);
        
        // 날짜 범위에 맞는 이력만 필터링
        const filtered = logs.filter(log => {
          const logDate = new Date(log.created_at);
          return isWithinInterval(logDate, { start: startDate, end: endDate });
        });
        
        setFilteredByDateLogs(filtered);
      } catch (err) {
        console.error('날짜 필터링 오류:', err);
        // 필터링 오류 시 모든 데이터 표시
        setFilteredByDateLogs(logs);
      }
    } else {
      // 필터링이 필요 없는 경우 모든 데이터 표시
      setFilteredByDateLogs(logs);
    }
  }, [logs, period, startDateParam, endDateParam]);

  // 정렬 함수
  const sortLogs = (a: IPcManagementLog, b: IPcManagementLog) => {
    const { sortField, sortDirection } = filterState;
    let valueA: any, valueB: any;
    
    // 중첩 객체 값 가져오기
    if (sortField === 'pc_type' || sortField === 'model_name') {
      valueA = a.pc_assets?.[sortField] || '';
      valueB = b.pc_assets?.[sortField] || '';
    } else {
      valueA = a[sortField as keyof IPcManagementLog];
      valueB = b[sortField as keyof IPcManagementLog];
    }
    
    // 특수 필드 처리
    if (sortField === 'created_by') {
      valueA = a.created_by ? a.created_by.split('@')[0] : '';
      valueB = b.created_by ? b.created_by.split('@')[0] : '';
    } else if (sortField === 'work_date') {
      valueA = new Date(a.work_date || '').getTime();
      valueB = new Date(b.work_date || '').getTime();
    }
    
    // 정렬 방향에 따라 결과 반환
    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  };

  // 정렬 방향 토글 함수
  const toggleSort = (field: SortField) => {
    setFilterState(prev => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === 'asc' ? 'desc' : 'asc',
      currentPage: 1 // 정렬 변경 시 1페이지로 리셋
    }));
  };
  
  // 작업 유형 필터 변경 함수
  const handleWorkTypeChange = (workType: string) => {
    setFilterState(prev => ({
      ...prev,
      workTypeFilter: workType === '전체' ? null : workType,
      currentPage: 1 // 필터 변경 시 1페이지로 리셋
    }));
  };
  
  // PC 타입 필터 변경 함수
  const handlePcTypeChange = (pcType: string) => {
    setFilterState(prev => ({
      ...prev,
      pcTypeFilter: pcType === '전체' ? null : pcType,
      currentPage: 1 // 필터 변경 시 1페이지로 리셋
    }));
  };

  // 기간 필터 변경 함수
  const handleDateFilterChange = (filter: DateFilterType) => {
    if (filter === 'all') {
      window.location.href = '/private/pc-history';
      return;
    }

    let startDate, endDate;
    const today = new Date();

    switch (filter) {
      case 'today':
        startDate = endDate = format(today, 'yyyy-MM-dd');
        break;
      case 'week':
        // 이번 주 월요일부터 일요일까지
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
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

    const params = [`period=${filter}`, `startDate=${startDate}`, `endDate=${endDate}`];
    window.location.href = `/private/pc-history?${params.join('&')}`;
  };

  // 검색어 변경 함수
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterState(prev => ({
      ...prev,
      searchTerm: e.target.value,
      currentPage: 1 // 검색 시 1페이지로 리셋
    }));
  };

  // 페이지 크기 변경 함수
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterState(prev => ({
      ...prev,
      pageSize: parseInt(e.target.value),
      currentPage: 1 // 페이지 크기 변경 시 1페이지로 리셋
    }));
  };

  // 페이지 변경 함수
  const handlePageChange = (page: number) => {
    setFilterState(prev => ({
      ...prev,
      currentPage: page
    }));
  };

  // 필터링 및 정렬된 데이터
  const filteredAndSortedLogs = filteredByDateLogs
    .filter(log => {
      // 작업 유형 필터
      if (filterState.workTypeFilter && log.work_type !== filterState.workTypeFilter) {
        return false;
      }
      
      // PC 타입 필터
      if (filterState.pcTypeFilter && log.pc_assets?.pc_type !== filterState.pcTypeFilter) {
        return false;
      }
      
      // 검색어 필터 (여러 필드에서 검색)
      if (filterState.searchTerm) {
        const searchTerm = filterState.searchTerm.toLowerCase();
        const searchableFields = [
          log.security_code,
          log.pc_assets?.model_name,
          log.pc_assets?.serial_number,
          log.detailed_description,
          log.created_by?.split('@')[0]
        ];
        
        const matchesSearch = searchableFields.some(field => 
          field?.toLowerCase().includes(searchTerm)
        );
        
        if (!matchesSearch) return false;
      }
      
      return true;
    })
    .sort(sortLogs);

  // 페이지네이션
  const totalItems = filteredAndSortedLogs.length;
  const totalPages = Math.ceil(totalItems / filterState.pageSize);
  const startIndex = (filterState.currentPage - 1) * filterState.pageSize;
  const endIndex = startIndex + filterState.pageSize;
  const currentPageLogs = filteredAndSortedLogs.slice(startIndex, endIndex);

  // 정렬 헤더 컴포넌트
  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <div 
      className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded"
      onClick={() => toggleSort(field)}
    >
      <span className="font-semibold text-gray-700">{label}</span>
      <div className="ml-1 flex flex-col">
        <ChevronUpIcon 
          className={`w-3 h-3 ${filterState.sortField === field && filterState.sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'}`} 
        />
        <ChevronDownIcon 
          className={`w-3 h-3 ${filterState.sortField === field && filterState.sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'}`} 
        />
      </div>
    </div>
  );

  // 페이지네이션 컴포넌트
  const Pagination = () => {
    const getVisiblePages = () => {
      const delta = 2;
      const start = Math.max(1, filterState.currentPage - delta);
      const end = Math.min(totalPages, filterState.currentPage + delta);
      
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6 px-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">
            전체 {totalItems}개 중 {startIndex + 1}-{Math.min(endIndex, totalItems)}개 표시
          </span>
          <select 
            value={filterState.pageSize} 
            onChange={handlePageSizeChange}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size}개씩</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={filterState.currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            처음
          </button>
          <button
            onClick={() => handlePageChange(filterState.currentPage - 1)}
            disabled={filterState.currentPage === 1}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          
          {getVisiblePages().map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 text-sm border rounded ${
                page === filterState.currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(filterState.currentPage + 1)}
            disabled={filterState.currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={filterState.currentPage === totalPages}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            마지막
          </button>
        </div>
      </div>
    );
  };

  // 중첩 객체에서 값 가져오기
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // 셀 렌더링 함수
  const renderCell = (column: any, item: IPcManagementLog) => {
    let value = column.accessor ? getNestedValue(item, column.accessor) : item[column.key as keyof IPcManagementLog];
    
    switch (column.type) {
      case 'date':
        return value ? formatToKoreanTime(value, 'date') : '-';
      case 'email':
        return value ? value.split('@')[0] : '-';
      case 'truncate':
        return value ? truncateDescription(value, column.truncateLength || 30) : '-';
      case 'pc_type':
        const pcTypeColors: Record<string, string> = {
          'Desktop': 'bg-blue-100 text-blue-800',
          'Laptop': 'bg-green-100 text-green-800',
          'All-in-One': 'bg-purple-100 text-purple-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${pcTypeColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value || '-'}
          </span>
        );
      case 'work_type':
        const workTypeColors: Record<string, string> = {
          '입고': 'bg-green-100 text-green-800',
          '출고': 'bg-blue-100 text-blue-800',
          '반납': 'bg-yellow-100 text-yellow-800',
          '폐기': 'bg-red-100 text-red-800',
          '변경': 'bg-purple-100 text-purple-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${workTypeColors[value] || 'bg-gray-100 text-gray-800'}`}>
            {value || '-'}
          </span>
        );
      default:
        return value || '-';
    }
  };

  // 작업 유형을 URL 경로로 매핑하는 함수
  const getUrlPathByWorkType = (workType: string) => {
    switch (workType) {
      case '입고': return 'in';
      case '출고': return 'install';
      case '반납': return 'return';
      case '폐기': return 'disposal';
      case '변경': return 'change';
      default: return 'in';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RingLoader color="#3B82F6" size={60} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // 테이블 열 정의
  const columns = [
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

  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* 필터 컨트롤 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-medium text-gray-900">필터 및 검색</h2>
              <PcWriteButton />
            </div>
          </div>
          
          <div className="p-6">
            {/* 현재 선택된 기간 표시 */}
            {period !== 'all' && startDateParam && endDateParam && (
              <div className="mb-6 bg-blue-50 text-blue-700 px-4 py-3 rounded-md border border-blue-200 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-sm">
                  {getPeriodLabel()} ({format(parseISO(startDateParam), 'yyyy-MM-dd')} ~ {format(parseISO(endDateParam), 'yyyy-MM-dd')})
                </span>
                <Link 
                  href="/private/pc-history"
                  className="ml-3 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded font-medium transition-colors"
                >
                  초기화
                </Link>
              </div>
            )}
            
            {/* 필터 옵션들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {/* 작업 유형 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">작업 유형</label>
                <select 
                  value={filterState.workTypeFilter || '전체'} 
                  onChange={(e) => handleWorkTypeChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {workTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* PC 타입 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PC 타입</label>
                <select 
                  value={filterState.pcTypeFilter || '전체'} 
                  onChange={(e) => handlePcTypeChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {pcTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* 기간 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
                <select 
                  value={period} 
                  onChange={(e) => handleDateFilterChange(e.target.value as DateFilterType)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">전체 기간</option>
                  <option value="today">오늘</option>
                  <option value="week">이번 주</option>
                  <option value="month">이번달</option>
                  <option value="year">올해</option>
                </select>
              </div>

              {/* 검색 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
                <input
                  type="text"
                  value={filterState.searchTerm}
                  onChange={handleSearchChange}
                  placeholder="코드번호, 모델명, 제조번호, 작업내용, 작성자로 검색..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 데이터 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredAndSortedLogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">데이터가 없습니다</h3>
              <p className="text-gray-500">조건에 맞는 PC 이력이 없습니다.</p>
            </div>
          ) : (
            <>
              {/* 테이블 헤더 */}
              <div className="grid bg-gray-50 border-b border-gray-200 p-4" style={gridStyle}>
                {columns.map((column) => (
                  <SortHeader 
                    key={column.key} 
                    field={column.key as SortField} 
                    label={column.header} 
                  />
                ))}
              </div>

              {/* 테이블 바디 */}
              <div className="divide-y divide-gray-200">
                {currentPageLogs.map((log) => (
                  <Link
                    key={log.log_id}
                    href={`/private/pc-history/${getUrlPathByWorkType(log.work_type)}/detail/${log.log_id}`}
                    className="grid p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    style={gridStyle}
                  >
                    {columns.map((column) => (
                      <div key={column.key} className="text-sm text-gray-900">
                        {renderCell(column, log)}
                      </div>
                    ))}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 페이지네이션 */}
        <Pagination />
      </div>
    </div>
  );
}
