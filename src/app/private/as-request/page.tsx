'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SupabaseService, { IAsManagementLog } from '@/api/supabase/supabaseApi';
import { formatToKoreanTime, truncateDescription } from '@/utils/utils';
import { ChevronUpIcon, ChevronDownIcon, FunnelIcon } from '@heroicons/react/24/outline';

// 필터 타입 정의
type SortField = 'log_id' | 'created_by' | 'work_date' | 'work_type' | 'model_name' | 'employee_department';
type SortDirection = 'asc' | 'desc';
type FilterState = {
  sortField: SortField;
  sortDirection: SortDirection;
  workTypeFilter: string | null;
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
  const [logs, setLogs] = useState<IAsManagementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필터 상태
  const [filterState, setFilterState] = useState<FilterState>({
    sortField: 'work_date',
    sortDirection: 'desc',
    workTypeFilter: null,
    searchTerm: '',
    pageSize: 20,
    currentPage: 1,
  });
  
  // 작업 유형 옵션
  const workTypeOptions = ['전체', 'H/W', 'S/W', '네트워크', '장비관리', '기타'];
  
  const gridStyle = {
    gridTemplateColumns: "8% 8% 8% 8% 8% 10% 5% 15% 30%"
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
          // 기본 정렬은 서버에서 최신순으로 가져옴
          order: { column: 'created_at', ascending: false }
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
  const handleWorkTypeChange = (type: string) => {
    setFilterState(prev => ({
      ...prev,
      workTypeFilter: type === '전체' ? null : type,
      currentPage: 1 // 필터 변경 시 1페이지로 리셋
    }));
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

  // 필터링된 로그 데이터
  const filteredLogs = logs
    .filter(log => {
      // 작업 유형 필터
      if (filterState.workTypeFilter && log.work_type !== filterState.workTypeFilter) {
        return false;
      }
      
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
          (log.detail_description?.toLowerCase().includes(searchTerm))
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

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">작업 유형:</span>
              <div className="ml-2 flex space-x-1">
                {workTypeOptions.map(type => (
                  <button
                    key={type}
                    onClick={() => handleWorkTypeChange(type)}
                    className={`px-2.5 py-1 text-xs rounded-md ${
                      (type === '전체' && !filterState.workTypeFilter) || 
                      filterState.workTypeFilter === type
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="검색어 입력..."
                value={filterState.searchTerm}
                onChange={handleSearchChange}
                className="pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full md:w-64"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            <span>{filteredLogs.length}개의 결과가 있습니다</span>
            {filterState.sortField && (
              <span className="ml-2">
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
        
        {/* 테이블 */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              {/* 헤더 부분 */}
              <div className="grid border-b border-gray-200" style={gridStyle}>
                <SortHeader field="log_id" label="ID" />
                <SortHeader field="created_by" label="작성자" />
                <SortHeader field="work_date" label="작업일" />
                <SortHeader field="work_type" label="작업유형" />
                <SortHeader field="model_name" label="모델명" />
                <SortHeader field="employee_department" label="부서" />
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">사용자</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">문의내용</div>
                <div className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">조치내용</div>
              </div>
              
              {/* 데이터 행 */}
              {paginatedLogs.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  데이터가 없습니다
                </div>
              ) : (
                paginatedLogs.map((log: IAsManagementLog) => (
                  <Link 
                    href={`/private/as-request/${
                      log.work_type === "H/W" ? "hardware" : 
                      log.work_type === "S/W" ? "software" : 
                      log.work_type === "네트워크" ? "network" : 
                      log.work_type === "장비관리" ? "device" : "other"
                    }/detail/${log.log_id}`}
                    key={log.log_id}
                    style={gridStyle}
                    className="grid border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="px-2 py-4 text-sm text-gray-500 text-center bg-gray-50">{log.log_id}</div>
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.created_by ? log.created_by.split("@")[0] : "-"}</div>
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{formatToKoreanTime(log.work_date, 'date')}</div>
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium 
                        ${log.work_type === "H/W" ? "bg-blue-100 text-blue-800" : 
                          log.work_type === "S/W" ? "bg-orange-100 text-orange-800" : 
                          log.work_type === "네트워크" ? "bg-green-100 text-green-800" : 
                          log.work_type === "장비관리" ? "bg-purple-100 text-purple-800" : 
                          "bg-gray-100 text-gray-800"}`}>
                        {log.work_type}
                      </span>
                    </div>
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">
                      {truncateDescription(log.model_name, 9)}
                    </div>
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.employee_department ?? '-'}</div>
                    <div className="px-2 py-4 text-sm text-gray-500 text-center">{log.employee_name ?? '-'}</div>
                    <div className="px-2 py-4 text-sm text-gray-500 border-l border-gray-200" title={log.question}>
                      {truncateDescription(log.question, 30)}
                    </div>
                    <div className="px-2 py-4 text-sm text-gray-500 overflow-hidden border-l border-gray-200" title={log.solution_detail}>
                      {truncateDescription(log.solution_detail, 30)}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* 페이지네이션 (하단) */}
        {totalItems > 0 && <Pagination />}
      </div>
    </div>
  );
}
