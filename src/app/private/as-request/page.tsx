'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import SupabaseService, { IAsManagementLog } from '@/api/supabase/supabaseApi';
import { formatToKoreanTime, truncateDescription } from '@/utils/utils';
import { exportAsLogsToExcel } from '@/utils/excelUtils';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { RingLoader } from 'react-spinners';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { ko } from 'date-fns/locale';
import AsWriteButton from './_components/AsWriteButton';
import { AsHwCategoryOptions, AsSwCategoryOptions, AsWorkTypeOptions } from './_components/AsLogForm';

// 필터 타입 정의
type SortField = 'log_id' | 'created_by' | 'work_date' | 'work_type'  | 'category' | 'model_name' | 'employee_department' ;
type SortDirection = 'asc' | 'desc';
type DateFilterType = 'today' | 'week' | 'month' | 'year' | 'custom' | 'all';
type FilterState = {
  sortField: SortField;
  sortDirection: SortDirection;
  workTypeFilter: string | null;
  categoryFilter: string | null;
  searchTerm: string;
  // 페이징 관련 필드 추가
  pageSize: number;
  currentPage: number;
};

// 페이지 크기 옵션
const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// 로컬 스토리지 키
const FILTER_STORAGE_KEY = 'as_request_filter_state';

export default function AsRequestPage() {
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState<IAsManagementLog[]>([]);
  const [filteredByDateLogs, setFilteredByDateLogs] = useState<IAsManagementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  
  // URL에서 기간 파라미터 가져오기
  const period = searchParams.get('period') as DateFilterType || 'all';
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');
  
  // 필터 상태
  const [filterState, setFilterState] = useState<FilterState>({
    sortField: 'work_date',
    sortDirection: 'desc',
    workTypeFilter: null,
    categoryFilter: null,
    searchTerm: '',
    pageSize: 20,
    currentPage: 1,
  });
  
  // 작업 유형 옵션
  const workTypeOptions = ['전체', ...AsWorkTypeOptions];
  
  // 카테고리 옵션 (작업 유형에 따라 동적으로 결정)
  const getCategoryOptions = (workType: string | null) => {
    if (workType === 'H/W') {
      return ['전체', ...AsHwCategoryOptions];
    } else if (workType === 'S/W') {
      return ['전체', ...AsSwCategoryOptions];
    }
    return ['전체', '없음'];
  };
  
  const categoryOptions = getCategoryOptions(filterState.workTypeFilter);
  
  const gridStyle = {
    gridTemplateColumns: "8% 8% 8% 8% 8% 8% 10% 5% 15% 30%"
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
          table: 'as_management_log',
          columns: '*',
          // 기본 정렬은 work_date 기준으로 최신순으로 가져옴
          order: { column: 'work_date', ascending: false }
        });
        
        if (success) {
          setLogs(data || []);
        } else {
          console.error('Error fetching as_management_log:', error);
          setError('데이터를 불러오는 중 오류가 발생했습니다.');
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
        
        // 날짜 범위에 맞는 요청만 필터링 (work_date 기준만 사용)
        const filtered = logs.filter(log => {
          // work_date가 없는 경우 해당 항목은 제외
          if (!log.work_date) return false;
          
          const logDate = new Date(log.work_date);
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
  const sortLogs = (a: IAsManagementLog, b: IAsManagementLog) => {
    const { sortField, sortDirection } = filterState;
    let valueA: any = a[sortField as keyof IAsManagementLog];
    let valueB: any = b[sortField as keyof IAsManagementLog];
    
    // 특수 필드 처리 (null 값, 날짜 등)
    if (sortField === 'created_by') {
      valueA = a.created_by ? a.created_by.split('@')[0] : '';
      valueB = b.created_by ? b.created_by.split('@')[0] : '';
    } else if (sortField === 'work_date') {
      // work_date가 null이거나 빈 값인 경우 가장 뒤로 정렬
      if (!a.work_date && !b.work_date) return 0;
      if (!a.work_date) return 1;
      if (!b.work_date) return -1;
      
      valueA = new Date(a.work_date).getTime();
      valueB = new Date(b.work_date).getTime();
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
  const handleWorkTypeChange = (type: string) => {
    setFilterState(prev => ({
      ...prev,
      workTypeFilter: type === '전체' ? null : type,
      categoryFilter: null, // 작업 유형 변경 시 카테고리 리셋
      currentPage: 1 // 필터 변경 시 1페이지로 리셋
    }));
  };
  
  // 카테고리 필터 변경 함수
  const handleCategoryChange = (category: string) => {
    setFilterState(prev => ({
      ...prev,
      categoryFilter: category === '전체' ? null : category,
      currentPage: 1 // 필터 변경 시 1페이지로 리셋
    }));
  };
  
  // 기간 필터 변경 함수
  const handleDateFilterChange = (filter: DateFilterType) => {
    if (filter === 'all') {
      window.location.href = '/private/as-request';
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
    window.location.href = `/private/as-request?${params.join('&')}`;
  };
  
  // 검색어 변경 함수
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterState(prev => ({
      ...prev,
      searchTerm: e.target.value,
      currentPage: 1 // 검색어 변경 시 1페이지로 리셋
    }));
  };

  // 페이지 크기 변경 함수
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value);
    setFilterState(prev => ({
      ...prev,
      pageSize: newPageSize,
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

  // 필터링된 로그 데이터 (기간 필터 적용 후 나머지 필터 적용)
  const filteredLogs = filteredByDateLogs
    .filter(log => {
      // 작업 유형 필터
      if (filterState.workTypeFilter && filterState.workTypeFilter !== '전체' && log.work_type !== filterState.workTypeFilter) {
        return false;
      }
      // "전체"를 선택했을 때는 모든 작업유형을 보여줌 (추가 필터링 없음)
      
      // 카테고리 필터
      if (filterState.categoryFilter && filterState.categoryFilter !== '전체') {
        if (filterState.categoryFilter === '없음') {
          // "없음"을 선택했을 때: 카테고리가 없거나 빈 값인 경우
          if (log.category && log.category.trim() !== '') {
            return false;
          }
        } else {
          // 특정 카테고리를 선택했을 때
          if (log.category !== filterState.categoryFilter) {
            return false;
          }
        }
      }
      // "전체"를 선택했을 때는 해당 작업유형의 모든 카테고리를 보여줌 (추가 필터링 없음)
      
      // 검색어 필터
      if (filterState.searchTerm) {
        const searchTerm = filterState.searchTerm.toLowerCase();
        return (
          (log.log_id?.toString().includes(searchTerm)) ||
          (log.created_by?.toLowerCase().includes(searchTerm)) ||
          (log.model_name?.toLowerCase().includes(searchTerm)) ||
          (log.employee_name?.toLowerCase().includes(searchTerm)) ||
          (log.employee_department?.toLowerCase().includes(searchTerm)) ||
          (log.question?.toLowerCase().includes(searchTerm)) ||
          (log.detail_description?.toLowerCase().includes(searchTerm)) ||
          (log.category?.toLowerCase().includes(searchTerm)) ||
          (log.solution_detail?.toLowerCase().includes(searchTerm)) ||
          (log.detailed_category?.toLowerCase().includes(searchTerm))
          
        );
      }
      
      return true;
    })
    .sort(sortLogs);
  
  // 페이징 계산
  const totalItems = filteredLogs.length;
  const totalPages = Math.ceil(totalItems / filterState.pageSize);
  
  // 현재 페이지 데이터
  const startIndex = (filterState.currentPage - 1) * filterState.pageSize;
  const paginatedLogs = filteredLogs.slice(
    startIndex,
    startIndex + filterState.pageSize
  );

  // 정렬 헤더 컴포넌트
  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <div 
      className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group flex items-center justify-center"
      onClick={() => toggleSort(field)}
    >
      {label}
      <span className="ml-1">
        {filterState.sortField === field ? (
          filterState.sortDirection === 'asc' ? (
            <ChevronUpIcon className="h-4 w-4 text-blue-500" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 text-blue-500" />
          )
        ) : (
          <ChevronUpIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-400" />
        )}
      </span>
    </div>
  );

  // 페이지네이션 컴포넌트
  const Pagination = () => {
    // 페이지 버튼 범위 계산 (최대 5개 표시)
    let startPage = Math.max(1, filterState.currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // 5개 페이지를 보여주기 위한 조정
    if (endPage - startPage < 4 && totalPages > 5) {
      if (startPage === 1) {
        endPage = Math.min(5, totalPages);
      } else {
        startPage = Math.max(1, endPage - 4);
      }
    }
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex items-center justify-between py-3">
        
        <div className="flex items-center">
       
          <span className="text-sm text-gray-700">
            총 <span className="font-medium">{totalItems}</span>개 중{' '}
            <span className="font-medium">{startIndex + 1}</span>-
            <span className="font-medium">{Math.min(startIndex + filterState.pageSize, totalItems)}</span>개 표시
          </span>
          
          <div className="ml-4">
            <label htmlFor="pageSize" className="text-sm text-gray-600 mr-2">표시 개수:</label>
            <select
              id="pageSize"
              value={filterState.pageSize}
              onChange={handlePageSizeChange}
              className="text-sm border border-gray-300 rounded p-1 bg-white"
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>{size}개</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => handlePageChange(1)}
            disabled={filterState.currentPage === 1}
            className={`px-3 py-1 rounded text-sm border ${
              filterState.currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            &laquo;
          </button>
          
          <button
            onClick={() => handlePageChange(filterState.currentPage - 1)}
            disabled={filterState.currentPage === 1}
            className={`px-3 py-1 rounded text-sm border ${
              filterState.currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            &lsaquo;
          </button>
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-1 rounded text-sm border ${
                filterState.currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              {page}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(filterState.currentPage + 1)}
            disabled={filterState.currentPage === totalPages}
            className={`px-3 py-1 rounded text-sm border ${
              filterState.currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            &rsaquo;
          </button>
          
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={filterState.currentPage === totalPages}
            className={`px-3 py-1 rounded text-sm border ${
              filterState.currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            &raquo;
          </button>
        </div>
      </div>
    );
  };

  // 엑셀 다운로드 함수들
  const handleExportAll = () => {
    setExporting(true);
    try {
      const today = format(new Date(), 'yyyyMMdd');
      const filename = `KET_정비일지_${today}`;
      exportAsLogsToExcel(logs, filename);
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportFiltered = () => {
    setExporting(true);
    try {
      const workType = filterState.workTypeFilter || '전체';
      const category = filterState.categoryFilter || '전체';
      
      let periodStr: string;
      if (period === 'all') {
        periodStr = '전체기간';
      } else if (startDateParam && endDateParam) {
        const start = format(parseISO(startDateParam), 'yyMMdd');
        const end = format(parseISO(endDateParam), 'yyMMdd');
        periodStr = `${start}-${end}`;
      } else {
        periodStr = period;
      }

      const filename = `KET_정비일지_${workType}_${category}_(${periodStr})`;
      exportAsLogsToExcel(filteredLogs, filename);
    } catch (error) {
      console.error('엑셀 다운로드 오류:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <RingLoader  speedMultiplier={1.5} color="#982cd6" />
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
      <div className="space-y-4">
        {/* 필터 컨트롤 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-medium text-gray-900">필터 및 검색</h2>
              <div className="flex items-center space-x-3">
                {/* 엑셀 다운로드 버튼들 */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportAll}
                    disabled={exporting || logs.length === 0}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      exporting || logs.length === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                    }`}
                  >
                    {exporting ? (
                      <div className="flex items-center">
                        <RingLoader size={12} color="#059669" />
                        <span className="ml-2">다운로드 중...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 00-.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        전체 다운로드
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={handleExportFiltered}
                    disabled={exporting || filteredLogs.length === 0}
                    className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                      exporting || filteredLogs.length === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {exporting ? (
                      <div className="flex items-center">
                        <RingLoader size={12} color="#2563eb" />
                        <span className="ml-2">다운로드 중...</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                        </svg>
                        필터 다운로드
                      </div>
                    )}
                  </button>
                </div>
                
                <AsWriteButton />
              </div>
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
                  href="/private/as-request"
                  className="ml-3 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded font-medium transition-colors"
                >
                  초기화
                </Link>
              </div>
            )}
            
            {/* 필터 옵션들 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

              {/* 카테고리 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                <select 
                  value={filterState.categoryFilter || '전체'} 
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categoryOptions.map(option => (
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
                <input
                  type="text"
                  value={filterState.searchTerm}
                  onChange={handleSearchChange}
                  placeholder="ID, 작성자, 모델명, 부서, 내용 검색..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="mt-2 flex justify-between text-xs text-gray-500 p-2">
            <div className="flex items-center space-x-4">
              <span>전체: {logs.length}개</span>
              <span>필터링: {filteredLogs.length}개</span>
            </div>
            {filterState.sortField && (
              <span>
                (정렬: {filterState.sortField === 'log_id' ? 'ID' : 
                       filterState.sortField === 'created_by' ? '작성자' :
                       filterState.sortField === 'work_date' ? '작업일' :
                       filterState.sortField === 'work_type' ? '작업유형' : 
                       filterState.sortField === 'model_name' ? '모델명' : 
                       '부서'} 
                {filterState.sortDirection === 'asc' ? '오름차순' : '내림차순'})
              </span>
            )}
          </div>
        </div>
        
        {/* 페이지네이션 (상단) */}
        {totalItems > 0 && <Pagination />}
        
        {/* 데이터 테이블 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">데이터가 없습니다</h3>
              <p className="text-gray-500">조건에 맞는 AS 요청이 없습니다.</p>
            </div>
          ) : (
            <>
              {/* 테이블 헤더 */}
              <div className="grid bg-gray-50 border-b border-gray-200 p-4" style={gridStyle}>
                <SortHeader field="log_id" label="ID" />
                <SortHeader field="created_by" label="작성자" />
                <SortHeader field="work_date" label="작업일" />
                <SortHeader field="work_type" label="작업유형" />
                <SortHeader field="category" label="분류" />
                <SortHeader field="model_name" label="모델명" />
                <SortHeader field="employee_department" label="부서" />
                <div className="text-sm font-semibold text-gray-700 flex items-center">사용자</div>
                <div className="text-sm font-semibold text-gray-700 flex items-center">문의내용</div>
                <div className="text-sm font-semibold text-gray-700 flex items-center">조치내용</div>
              </div>
              
              {/* 테이블 바디 */}
              <div className="divide-y divide-gray-200">
                {paginatedLogs.map((log: IAsManagementLog) => (
                  <Link 
                    key={log.log_id}
                    href={`/private/as-request/${
                      log.work_type === "H/W" ? "hardware" : 
                      log.work_type === "S/W" ? "software" : 
                      log.work_type === "네트워크" ? "network" : "other"
                    }/detail/${log.log_id}`}
                    className="grid p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    style={gridStyle}
                  >
                    <div className="text-sm text-gray-900">{log.log_id}</div>
                    <div className="text-sm text-gray-900">{log.created_by ? log.created_by.split('@')[0] : '-'}</div>
                    <div className="text-sm text-gray-900">{log.work_date ? formatToKoreanTime(log.work_date, 'date') : '-'}</div>
                    <div className="text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.work_type === 'H/W' ? 'bg-blue-100 text-blue-800' :
                        log.work_type === 'S/W' ? 'bg-green-100 text-green-800' :
                        log.work_type === '네트워크' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.work_type || '-'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900">{log.category && log.category.trim() !== '' ? log.category : '없음'}</div>
                    <div className="text-sm text-gray-900">{log.model_name || '-'}</div>
                    <div className="text-sm text-gray-900">{log.employee_department || '-'}</div>
                    <div className="text-sm text-gray-900">{log.employee_name || '-'}</div>
                    <div className="text-sm text-gray-900">{truncateDescription(log.question, 20) || '-'}</div>
                    <div className="text-sm text-gray-900">{truncateDescription(log.solution_detail, 20) || '-'}</div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* 페이지네이션 (하단) */}
        {totalItems > 0 && <Pagination />}
      </div>
    </div>
  );
}
