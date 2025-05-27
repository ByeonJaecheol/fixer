'use client'

import { useEffect, useState } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/utils/supabase'

// 타입 정의
export interface ISearchAsset {
  serial_number: string
  name: string
  model?: string
  status?: string
  // 다른 필요한 속성들 추가
}

export interface IPCManagementLog {
  log_id: number
  asset_id: number
  employee_name: string
  employee_department: string
  employee_workspace: string
  requester: string
  work_date: string
  work_type: string
  is_available: string
  is_new: boolean
  usage_type: string
  security_code: string
  location: string
  detailed_description: string
  created_at: string
  created_by: string
  install_status?: string
  install_type?: string
}

export interface IASManagementLog {
  log_id: number
  category: string
  created_at: string
  created_by: string
  detail_category: string
  detailed_description: string
  employee_department: string
  employee_name: string
  employee_workspace: string
  format: string
  model_name: string
  new_security_code: string | null
  question: string
  security_code: string | null
  serial_number: string | null
  solution_detail: string
  work_date: string
  work_type: string
}

export interface ISearchState {
  term: string
  history: string[]
  isLoading: boolean
  error: string | null
  isFocused: boolean
  activeTab: 'serial' | 'employee'
}

const SEARCH_HISTORY_KEY = 'search_history'
const MAX_HISTORY_ITEMS = 10

export default function PcAssetsPage() {
  const router = useRouter()
  
  // 상태 통합 관리
  const [searchState, setSearchState] = useState<ISearchState>({
    term: '',
    history: [],
    isLoading: false,
    error: null,
    isFocused: false,
    activeTab: 'serial'
  })
  
  const [pcLogs, setPcLogs] = useState<IPCManagementLog[]>([])
  const [asLogs, setAsLogs] = useState<IASManagementLog[]>([])
  
  // 로컬 스토리지 유틸리티 함수들
  const getStoredHistory = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]')
    } catch {
      return []
    }
  }

  const updateSearchHistory = (newTerm: string) => {
    const previousSearches = getStoredHistory()
    const updatedSearches = [
      newTerm,
      ...previousSearches.filter(term => term !== newTerm)
    ].slice(0, MAX_HISTORY_ITEMS)

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updatedSearches))
    setSearchState(prev => ({ ...prev, history: updatedSearches }))
  }

  // 검색어 입력 처리
  const handleInputChange = (value: string) => {
    setSearchState(prev => ({ ...prev, term: value }))
  }

  // 검색 실행 - 제조번호 검색
  const handleSerialSearch = async () => {
    const term = searchState.term.trim()
    if (!term) return

    setSearchState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const { data, error } = await supabase
        .from('pc_assets')
        .select('*')
        .eq('serial_number', term)
        .single()

      if (error) throw new Error('존재하지 않는 시리얼 번호입니다.')

      updateSearchHistory(term)
      router.push(`/private/pc-assets/${data.serial_number}`)
    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '검색 중 오류가 발생했습니다.'
      }))
    } finally {
      setSearchState(prev => ({ ...prev, isLoading: false }))
    }
  }

  // 사원명 검색 처리
  const handleEmployeeSearch = async () => {
    const term = searchState.term.trim()
    if (!term) return

    setSearchState(prev => ({ ...prev, isLoading: true, error: null }))
    setPcLogs([])
    setAsLogs([])

    try {
      // PC 관리 로그 검색
      const { data: pcData, error: pcError } = await supabase
        .from('pc_management_log')
        .select('*')
        .ilike('employee_name', `%${term}%`)
      
      console.log('search page - pcData', pcData)
      if (pcError) throw pcError

      // AS 관리 로그 검색
      const { data: asData, error: asError } = await supabase
        .from('as_management_log')
        .select('*')
        .ilike('employee_name', `%${term}%`)
      
      console.log('search page - asData', asData)
      if (asError) throw asError

      setPcLogs(pcData || [])
      setAsLogs(asData || [])
      
      if ((pcData || []).length === 0 && (asData || []).length === 0) {
        setSearchState(prev => ({
          ...prev,
          error: '검색 결과가 없습니다. 다른 사원명으로 검색해보세요.'
        }))
      } else {
        updateSearchHistory(term)
      }
    } catch (error) {
      console.error('검색 중 오류:', error)
      setSearchState(prev => ({
        ...prev,
        error: '검색 중 오류가 발생했습니다.'
      }))
    } finally {
      setSearchState(prev => ({ ...prev, isLoading: false }))
    }
  }

  // 검색 버튼 클릭 처리
  const handleSearch = () => {
    if (searchState.activeTab === 'serial') {
      handleSerialSearch()
    } else {
      handleEmployeeSearch()
    }
  }

  // 탭 변경 처리
  const handleTabChange = (tab: 'serial' | 'employee') => {
    setSearchState(prev => ({ 
      ...prev, 
      activeTab: tab,
      error: null
    }))
    setPcLogs([])
    setAsLogs([])
  }

  // 초기 검색 기록 로드
  useEffect(() => {
    const history = getStoredHistory()
    setSearchState(prev => ({ ...prev, history }))
  }, [])

  // 작업 상태에 따른 색상 반환
  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch(status.toLowerCase()) {
      case '사용중':
        return 'bg-green-100 text-green-800';
      case '사용불가':
        return 'bg-red-100 text-red-800';
      case '수리중':
        return 'bg-yellow-100 text-yellow-800';
      case '대기중':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 작업 유형에 따른 색상 반환
  const getWorkTypeColor = (type: string) => {
    if (!type) return 'bg-gray-100 text-gray-800';
    
    switch(type.toLowerCase()) {
      case '지급':
        return 'bg-green-100 text-green-800';
      case '반납':
        return 'bg-red-100 text-red-800';
      case '교체':
        return 'bg-yellow-100 text-yellow-800';
      case '수리':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 카테고리에 따른 색상 반환
  const getCategoryColor = (category: string) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    
    switch(category.toLowerCase()) {
      case 'pc':
        return 'bg-blue-100 text-blue-800';
      case '주변기기':
        return 'bg-purple-100 text-purple-800';
      case '소프트웨어':
        return 'bg-green-100 text-green-800';
      case '네트워크':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // PC 관리 로그 상세 페이지로 이동
  const navigateToPcManagementDetail = (workType: string, logId: number) => {
    let workTypeDetail = workType
    if (workType === '입고') {
      workTypeDetail = 'in'
    } else if (workType === '설치') {
      workTypeDetail = 'install'
    } else if (workType === '반납') {
      workTypeDetail = 'return'
    } else if (workType === '폐기') {
      workTypeDetail = 'dispose'
    }
    
    router.push(`/private/pc-history/${workTypeDetail}/detail/${logId}`)
  }

  // AS 관리 로그 상세 페이지로 이동
  const navigateToAsManagementDetail = (workType: string, logId: number) => {
    let workTypeDetail = workType
    if (workType === 'H/W') {
      workTypeDetail = 'hardware'
    } else if (workType === 'S/W') {
      workTypeDetail = 'software'
    } else if (workType === '네트워크') {
      workTypeDetail = 'network'
    } else if (workType === '기타') {
      workTypeDetail = 'other'
    }
    
    router.push(`/private/as-request/${workTypeDetail}/detail/${logId}`)
  }

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center px-4 py-8">
      {/* 검색 헤더 */}
      <div className="w-full max-w-7xl text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">자산 검색</h1>
        <p className="text-gray-500">
          {searchState.activeTab === 'serial' 
            ? '시리얼 번호를 입력하여 PC 자산을 검색하세요' 
            : '사원명을 입력하여 관련 PC 관리 기록 및 AS 기록을 검색하세요'}
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="w-full max-w-2xl mb-4">
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          <button
            onClick={() => handleTabChange('serial')}
            className={`flex-1 py-3 text-center font-medium text-sm transition-colors ${
              searchState.activeTab === 'serial'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            시리얼 번호 검색
          </button>
          <button
            onClick={() => handleTabChange('employee')}
            className={`flex-1 py-3 text-center font-medium text-sm transition-colors ${
              searchState.activeTab === 'employee'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            사원명 검색
          </button>
        </div>
      </div>

      {/* 검색 컨테이너 */}
      <div className="w-full max-w-7xl">
        <div className={`relative group ${
          searchState.isFocused ? 'ring-2 ring-blue-500 ring-offset-2' : ''
        }`}>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchState.term}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setSearchState(prev => ({ ...prev, isFocused: true }))}
              onBlur={() => setSearchState(prev => ({ ...prev, isFocused: false }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="block w-full pl-12 pr-12 py-4 text-lg bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 transition-all duration-200"
              placeholder={searchState.activeTab === 'serial' 
                ? "시리얼 번호 입력 (예: 6CR721WP7V)" 
                : "사원명 입력 (예: 홍길동)"}
            />
            {searchState.term && (
              <button
                onClick={() => setSearchState(prev => ({ ...prev, term: '' }))}
                className="absolute right-20 top-1/2 transform -translate-y-1/2"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <button
            onClick={handleSearch}
            disabled={searchState.isLoading}
            className="absolute right-0 top-0 h-full px-6 bg-blue-600 text-white rounded-r-2xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-blue-400"
          >
            {searchState.isLoading ? '검색 중...' : '검색'}
          </button>
        </div>

        {/* 에러 메시지 */}
        {searchState.error && (
          <div className="mt-2 text-red-500 text-sm">{searchState.error}</div>
        )}

        {/* 최근 검색 기록 - 검색 결과가 없을 때만 표시 */}
        {searchState.history.length > 0 && !(searchState.activeTab === 'employee' && (pcLogs.length > 0 || asLogs.length > 0)) && (
          <div className="mt-8">
            <h2 className="text-sm font-medium text-gray-500 mb-3">최근 검색</h2>
            <div className="flex flex-wrap gap-2">
              {searchState.history.map((term) => (
                <button
                  key={term}
                  onClick={() => handleInputChange(term)}
                  className="px-4 py-2 rounded-lg bg-gray-50 text-gray-600 text-sm hover:bg-gray-100 transition-colors duration-200"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 검색 결과 - 사원명 검색인 경우에만 표시 (넓은 컨테이너로 변경) */}
      {searchState.activeTab === 'employee' && (pcLogs.length > 0 || asLogs.length > 0) && (
        <div className="w-full mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">검색 결과: {searchState.term}</h2>
          
          {/* PC 관리 로그 테이블 */}
          {pcLogs.length > 0 && (
            <div className="mb-8">
              <h3 className="text-md font-medium text-gray-700 mb-2">PC 관리 기록 ({pcLogs.length}건)</h3>
              <div className="w-full bg-white shadow rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">부서</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업 유형</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">상세 내용</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pcLogs.map((log) => (
                        <tr 
                          key={log.log_id} 
                          className="hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => navigateToPcManagementDetail(log.work_type, log.log_id)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{log.work_date}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            <div>{log.employee_department}</div>
                            <div className="text-gray-400 text-xs">{log.employee_workspace}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getWorkTypeColor(log.work_type)}`}>
                              {log.work_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="tooltip relative cursor-pointer group">
                              <p className="line-clamp-2">{log.detailed_description || '-'}</p>
                              <div className="tooltip-content absolute left-0 top-0 transform -translate-y-full mt-1 w-64 bg-gray-900 text-white text-xs rounded p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                                {log.detailed_description || '상세 내용 없음'}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* AS 관리 로그 테이블 */}
          {asLogs.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-700 mb-2">AS 기록 ({asLogs.length}건)</h3>
              <div className="w-full bg-white shadow rounded-lg">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">부서/사업장</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업 유형</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">모델명</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">문제 내용</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {asLogs.map((log) => (
                        <tr 
                          key={log.log_id} 
                          className="hover:bg-blue-50 cursor-pointer transition-colors"
                          onClick={() => navigateToAsManagementDetail(log.work_type, log.log_id)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{log.work_date}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            <div>{log.employee_department}</div>
                            <div className="text-gray-400 text-xs">{log.employee_workspace}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getWorkTypeColor(log.work_type)}`}>
                              {log.work_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{log.model_name || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="tooltip relative cursor-pointer group">
                              <p className="line-clamp-2">{log.question || '-'}</p>
                              <div className="tooltip-content absolute left-0 top-0 transform -translate-y-full mt-1 w-64 bg-gray-900 text-white text-xs rounded p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                                <p className="font-semibold mb-1">문제:</p>
                                <p className="mb-2">{log.question || '내용 없음'}</p>
                                <p className="font-semibold mb-1">해결방법:</p>
                                <p>{log.solution_detail || '내용 없음'}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
