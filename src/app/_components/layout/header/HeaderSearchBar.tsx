'use client';

import { useState } from 'react';   
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface SearchState {
  term: string;
  isFocused: boolean;
  isLoading: boolean;
}

export default function HeaderSearchBar() {
  const router = useRouter();
  const [searchState, setSearchState] = useState<SearchState>({
    term: '',
    isFocused: false,
    isLoading: false,
  });

  const handleInputChange = (value: string) => {
    setSearchState(prev => ({ ...prev, term: value }));
  }

  const handleClear = () => {
    setSearchState(prev => ({ ...prev, term: '' }));
  }

  const handleSearch = () => {
    const term = searchState.term.trim();
    if (!term) return;
    
    router.push(`/private/pc-assets/${term}`);
  }

  return (
    <div className="relative w-64">
      <div className={`flex items-center h-9 border bg-white rounded-lg ${
        searchState.isFocused ? 'ring-2 ring-blue-500' : ''
      }`}>
        <MagnifyingGlassIcon className="w-4 h-4 ml-3 text-gray-500" />
        <input
          type="text"
          value={searchState.term}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setSearchState(prev => ({ ...prev, isFocused: true }))}
          onBlur={() => setSearchState(prev => ({ ...prev, isFocused: false }))}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full px-2 py-1 text-sm bg-transparent border-none focus:outline-none"
          placeholder="자산 검색 (시리얼 번호)"
        />
        {searchState.term && (
          <button
            onClick={handleClear}
            className="p-1 hover:text-gray-700"
          >
            <XMarkIcon className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
}
