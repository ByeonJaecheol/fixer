'use client'

import { useEffect, useState } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/utils/supabase'

// 타입 정의
export interface ISearchAsset {
  serial_number: string
  name: string
  // 다른 필요한 속성들 추가
}

export interface ISearchState {
  term: string
  history: string[]
  isLoading: boolean
  error: string | null
  isFocused: boolean
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
    isFocused: false
  })
  
  const [assets, setAssets] = useState<ISearchAsset[]>([])
  const [suggestions, setSuggestions] = useState<ISearchAsset[]>([])

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
    setSearchState(prev => ({ ...prev, term: value, isLoading: true }))

    const filtered = assets.filter(asset => 
      asset.name.toLowerCase().includes(value.toLowerCase())
    )
    
    setSuggestions(filtered)
    setSearchState(prev => ({ ...prev, isLoading: false }))
  }

  // 검색 실행
  const handleSearch = async () => {
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

  // 초기 검색 기록 로드
  useEffect(() => {
    const history = getStoredHistory()
    setSearchState(prev => ({ ...prev, history }))
  }, [])

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[50vh] px-4">
      {/* 검색 헤더 */}
      <div className="w-full max-w-3xl text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">자산 검색</h1>
        <p className="text-gray-500">시리얼 번호를 입력하여 PC 자산을 검색하세요</p>
      </div>

      {/* 검색 컨테이너 */}
      <div className="w-full max-w-2xl">
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
              placeholder="시리얼 번호 입력 (예: 6CR721WP7V)"
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

        {/* 최근 검색 기록 */}
        {searchState.history.length > 0 && (
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
    </div>
  )
}
