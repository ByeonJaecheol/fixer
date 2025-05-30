'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import LoadingSpinner from '@/app/_components/common/LoadingSpinner';
import SupabaseService, { IImage } from '@/api/supabase/supabaseApi';
import { formatToKoreanTime } from '@/utils/utils';

interface FilterState {
  brand: string;
  winVersion: string;
  isActive: string;
  searchTerm: string;
  sortField: keyof IImage | null;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
}

const FILTER_STORAGE_KEY = 'image-filter-state';

function ImagePage() {
  const searchParams = useSearchParams();
  
  const [images, setImages] = useState<IImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filterState, setFilterState] = useState<FilterState>({
    brand: '',
    winVersion: '',
    isActive: '',
    searchTerm: '',
    sortField: 'brand',
    sortDirection: 'asc',
    currentPage: 1,
    itemsPerPage: 20,
  });

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
        const { success, error, data } = await supabaseService.select({
          table: 'image',
          columns: '*',
          order: { column: 'created_at', ascending: false }
        });
        
        if (success) {
          setImages(data || []);
        } else {
          console.error('Error fetching images:', error);
          setError('이미지 데이터를 불러오는 중 오류가 발생했습니다.');
          setImages([]);
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

  // 검색 및 필터링
  const filteredImages = images.filter((image) => {
    const matchesBrand = !filterState.brand || image.brand === filterState.brand;
    const matchesWinVersion = !filterState.winVersion || image.win_version === filterState.winVersion;
    const matchesIsActive = !filterState.isActive || 
      (filterState.isActive === 'active' && image.is_active) ||
      (filterState.isActive === 'inactive' && !image.is_active);
    
    const matchesSearch = !filterState.searchTerm || 
      image.id.toString().includes(filterState.searchTerm) ||
      image.brand.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
      image.model_name.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
      image.win_version.toLowerCase().includes(filterState.searchTerm.toLowerCase()) ||
      (image.created_by && image.created_by.toLowerCase().includes(filterState.searchTerm.toLowerCase())) ||
      (image.base_description && image.base_description.toLowerCase().includes(filterState.searchTerm.toLowerCase()));
    
    return matchesBrand && matchesWinVersion && matchesIsActive && matchesSearch;
  });

  // 정렬
  const sortedImages = [...filteredImages].sort((a, b) => {
    if (!filterState.sortField) return 0;
    
    const aValue = a[filterState.sortField];
    const bValue = b[filterState.sortField];
    
    // 브랜드 정렬일 때 HP, LG, 삼성 순으로 정렬
    if (filterState.sortField === 'brand') {
      const brandOrder = ['HP', 'LG', '삼성'];
      const aIndex = brandOrder.indexOf(aValue as string);
      const bIndex = brandOrder.indexOf(bValue as string);
      
      if (aIndex !== -1 && bIndex !== -1) {
        return filterState.sortDirection === 'asc' ? aIndex - bIndex : bIndex - aIndex;
      } else if (aIndex !== -1) {
        return filterState.sortDirection === 'asc' ? -1 : 1;
      } else if (bIndex !== -1) {
        return filterState.sortDirection === 'asc' ? 1 : -1;
      }
    }
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return filterState.sortDirection === 'asc' ? comparison : -comparison;
    }
    
    if (aValue < bValue) return filterState.sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return filterState.sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // 브랜드별로 그룹화
  const groupedImages = sortedImages.reduce((groups, image) => {
    const brand = image.brand;
    if (!groups[brand]) {
      groups[brand] = [];
    }
    groups[brand].push(image);
    return groups;
  }, {} as Record<string, IImage[]>);

  // 브랜드 순서 정의
  const brandOrder = ['HP', 'LG', '삼성'];
  const orderedBrands = brandOrder.filter(brand => groupedImages[brand] && groupedImages[brand].length > 0);

  // 페이지네이션
  const totalItems = sortedImages.length;
  const totalPages = Math.ceil(totalItems / filterState.itemsPerPage);
  const startIndex = (filterState.currentPage - 1) * filterState.itemsPerPage;
  const paginatedImages = sortedImages.slice(startIndex, startIndex + filterState.itemsPerPage);

  // 페이지네이션된 이미지들도 브랜드별로 그룹화
  const paginatedGroupedImages = paginatedImages.reduce((groups, image) => {
    const brand = image.brand;
    if (!groups[brand]) {
      groups[brand] = [];
    }
    groups[brand].push(image);
    return groups;
  }, {} as Record<string, IImage[]>);

  const paginatedOrderedBrands = brandOrder.filter(brand => paginatedGroupedImages[brand] && paginatedGroupedImages[brand].length > 0);

  // 필터 핸들러들
  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilterState(prev => ({
      ...prev,
      [key]: value,
      currentPage: 1, // 필터 변경 시 첫 페이지로
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterChange('searchTerm', e.target.value);
  };

  const handleSort = (field: keyof IImage) => {
    setFilterState(prev => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === 'asc' ? 'desc' : 'asc',
      currentPage: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilterState(prev => ({ ...prev, currentPage: page }));
  };

  // 페이지네이션 컴포넌트
  const Pagination = () => {
    if (totalPages <= 1) return null;
    
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      
      for (let i = Math.max(2, filterState.currentPage - delta); 
           i <= Math.min(totalPages - 1, filterState.currentPage + delta); i++) {
        range.push(i);
      }
      
      if (filterState.currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }
      
      rangeWithDots.push(...range);
      
      if (filterState.currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }
      
      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => handlePageChange(filterState.currentPage - 1)}
            disabled={filterState.currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <button
            onClick={() => handlePageChange(filterState.currentPage + 1)}
            disabled={filterState.currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
        
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              총 <span className="font-medium">{totalItems}</span>개 중{' '}
              <span className="font-medium">{startIndex + 1}</span>-
              <span className="font-medium">{Math.min(startIndex + filterState.itemsPerPage, totalItems)}</span>개 표시
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
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
              &lt;
            </button>
            
            {getVisiblePages().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? handlePageChange(page) : undefined}
                disabled={typeof page !== 'number'}
                className={`px-3 py-1 rounded text-sm border ${
                  page === filterState.currentPage
                    ? 'bg-blue-600 text-white border-blue-600'
                    : typeof page === 'number'
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-white text-gray-400 cursor-default'
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
              &gt;
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <LoadingSpinner />
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
    <div className="space-y-4">
      {/* 필터 컨트롤 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between">
          <h2 className="text-base font-medium text-gray-900">필터 및 검색</h2>
          <Link href="/private/image/write" className="text-sm font-medium bg-blue-500 text-white px-4 py-2 rounded-md">
            이미지 추가
          </Link>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 브랜드 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">브랜드</label>
              <select
                value={filterState.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체</option>
                <option value="HP">HP</option>
                <option value="LG">LG</option>
                <option value="삼성">삼성</option>
              </select>
            </div>

            {/* 윈도우 버전 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">윈도우 버전</label>
              <select
                value={filterState.winVersion}
                onChange={(e) => handleFilterChange('winVersion', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">전체</option>
                <option value="Windows 7">Windows 7</option>
                <option value="Windows 10">Windows 10</option>
                <option value="Windows 11">Windows 11</option>
              </select>
            </div>


            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
              <input
                type="text"
                value={filterState.searchTerm}
                onChange={handleSearchChange}
                placeholder="ID, 브랜드, 모델명, 작성자 검색..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div className="mt-2 flex justify-end text-xs text-gray-500 p-2">
          <span>{filteredImages.length}개의 결과가 있습니다</span>
        </div>
      </div>
      
      {/* 정렬 옵션 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">정렬:</span>
            <select
              value={`${filterState.sortField}-${filterState.sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [keyof IImage, 'asc' | 'desc'];
                setFilterState(prev => ({ ...prev, sortField: field, sortDirection: direction, currentPage: 1 }));
              }}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="brand-asc">브랜드 순 (HP → LG → 삼성)</option>
              <option value="brand-desc">브랜드 역순 (삼성 → LG → HP)</option>
              <option value="created_at-desc">최신순</option>
              <option value="created_at-asc">오래된순</option>
              <option value="model_name-asc">모델명 A-Z</option>
              <option value="model_name-desc">모델명 Z-A</option>
              <option value="win_version-asc">윈도우 버전 오름차순</option>
              <option value="win_version-desc">윈도우 버전 내림차순</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* 페이지네이션 (상단) */}
      {totalItems > 0 && <Pagination />}
      
      {/* 브랜드별 그룹화된 카드 표시 */}
      <div className="space-y-6">
        {filteredImages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">데이터가 없습니다</h3>
            <p className="text-gray-500">조건에 맞는 이미지가 없습니다.</p>
          </div>
        ) : (
          paginatedOrderedBrands.map((brand) => (
            <div key={brand} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* 브랜드 헤더 */}
              <div className="bg-gray-100 border-b border-gray-200 px-6 py-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">{brand}</h2>
                  <span className="text-sm text-gray-600">
                    {paginatedGroupedImages[brand].length}개
                  </span>
                </div>
              </div>
              
              {/* 브랜드별 카드들 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4">
                {paginatedGroupedImages[brand].map((image: IImage) => (
                  <div 
                    key={image.id}
                    className="bg-white rounded border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
                  >
                    {/* 컴팩트한 헤더 */}
                    <div className="bg-gray-50 border-b border-gray-200 p-2">
                      <div className="flex justify-between items-center">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{image.model_name}</h3>
                          <p className="text-xs text-gray-500 mt-1">{image.win_version}</p>
                        </div>
                      </div>
                    </div>

                    {/* 컴팩트한 정보 */}
                    <div className="p-2">
                      <div className="space-y-1 mb-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">ID</span>
                          <span className="text-gray-900 font-medium">{image.id}</span>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">작성자</span>
                          <span className="text-gray-900 truncate ml-1" title={image.created_by || '-'}>
                            {image.created_by ? image.created_by.split('@')[0] : '-'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">등록일</span>
                          <span className="text-gray-900">{formatToKoreanTime(image.created_at, 'date')}</span>
                        </div>
                      </div>

                      {/* 설명 - 컴팩트 */}
                      {image.base_description && (
                        <div className="mb-2 p-1.5 bg-gray-50 rounded text-xs">
                          <p 
                            className="text-gray-700"
                            style={{
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}
                            title={image.base_description}
                          >
                            {image.base_description}
                          </p>
                        </div>
                      )}

                      {/* 컴팩트한 버튼 */}
                      <div className="flex gap-1 pt-2 border-t border-gray-100">
                        <Link
                          href={`/private/image/detail/${image.id}`}
                          className="flex-1 bg-blue-600 text-white px-2 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition-colors duration-200 text-center"
                        >
                          상세
                        </Link>
                        <Link
                          href={`/private/image/edit/${image.id}`}
                          className="flex-1 bg-white border border-gray-300 text-gray-700 px-2 py-1.5 rounded text-xs font-medium hover:bg-gray-50 transition-colors duration-200 text-center"
                        >
                          수정
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* 페이지네이션 (하단) */}
      {totalItems > 0 && <Pagination />}
    </div>
  );
}

export default function ImagePageWrapper() {
  return (
    <Suspense fallback={
      <div className="p-6 flex justify-center">
        <LoadingSpinner />
      </div>
    }>
      <ImagePage />
    </Suspense>
  );
} 