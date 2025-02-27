'use client';
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

interface UserData {
  이름: string;
  아이디: string;
  사번: string;
  회사: string;
  부서: string;
  직위: string;
  직책: string;
  성별: string;
  퇴사: string;
  [key: string]: string;
}

export default function ExcelSearch() {
  const [csvData, setCsvData] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const searchFields = [
    { value: 'all', label: '전체' },
    { value: '이름', label: '이름' },
    { value: '아이디', label: '아이디' },
    { value: '사번', label: '사번' },
    { value: '회사', label: '회사' },
    { value: '부서', label: '부서' },
    { value: '직위', label: '직위' },
    { value: '직책', label: '직책' },
    { value: '성별', label: '성별' },
    { value: '퇴사', label: '퇴사' }
  ];

  // 컴포넌트 마운트 시 저장된 데이터 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem('csvData');
    const savedDate = localStorage.getItem('lastUpdated');
    
    if (savedData) {
      setCsvData(JSON.parse(savedData));
      setLastUpdated(savedDate || '');
    }
  }, []);

  // CSV 파일 처리
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const file = e.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          Papa.parse(event.target?.result as string, {
            header: true,
            encoding: "UTF-8",
            skipEmptyLines: true,
            transformHeader: (header) => {
              const headerMap: { [key: string]: string } = {
                'Ãƒâ€¦': '이름',
                'Ã¬â€žÂ¤Ã«â€¹Â¤': '아이디',
                'Ã¬â€¹Å"Ã«Â²': '사번',
                'Ã­â€¢Å¡Ã¬â€¹Â¤': '회사',
                'Ã«Â¶â‚¬Ã¬â€¹Â¤': '부서',
                'Ã¬Â§â‚¬Ã¬â€°Â': '직위',
                'Ã¬Â§â‚¬Ã¬Â±â€¦': '직책',
                'Ã¬â€¦â€žÃ«Â³â€': '성별',
                'Ã¬â€¦â€žÃ«Â³â€': '퇴사',
              };
              console.log(headerMap[header]);
              return headerMap[header] || header;
            },
            complete: (results) => {
              const jsonData = results.data as UserData[];
              
              const cleanedData = jsonData.map(row => {
                const cleanRow: { [key: string]: string } = {};
                Object.entries(row).forEach(([key, value]) => {
                  try {
                    cleanRow[key] = decodeURIComponent(escape(value as string));
                  } catch {
                    cleanRow[key] = value as string;
                  }
                });
                return cleanRow as UserData;
              });
              
              setCsvData(cleanedData);
              const now = new Date().toLocaleString();
              setLastUpdated(now);
              
              localStorage.setItem('csvData', JSON.stringify(cleanedData));
              localStorage.setItem('lastUpdated', now);
              
              setIsLoading(false);
            },
            error: (error) => {
              console.error('CSV 파일 처리 중 오류:', error);
              setIsLoading(false);
            }
          });
        } catch (error) {
          console.error('CSV 파일 처리 중 오류:', error);
          setIsLoading(false);
        }
      };
      reader.readAsText(file, "UTF-8");
    }
  };

  // 데이터 초기화 함수
  const handleReset = () => {
    if (window.confirm('저장된 데이터를 모두 삭제하시겠습니까?')) {
      localStorage.removeItem('csvData');
      localStorage.removeItem('lastUpdated');
      setCsvData([]);
      setSearchResults([]);
      setLastUpdated('');
    }
  };

  // 검색 처리
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    const searchValue = value.toLowerCase();
    const results = csvData.filter((user) => {
      if (searchField === 'all') {
        return Object.values(user).some(val => 
          val?.toString().toLowerCase().includes(searchValue)
        );
      } else {
        return user[searchField]?.toString().toLowerCase().includes(searchValue);
      }
    });

    setSearchResults(results);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">사용자 검색</h2>
        
        {/* 파일 업로드 및 데이터 관리 */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-500"
            />
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-500 text-sm font-semibold"
            >
              데이터 초기화
            </button>
          </div>
          
          {/* 마지막 업데이트 시간 표시 */}
          {lastUpdated && (
            <div className="text-sm text-gray-400">
              마지막 업데이트: {lastUpdated}
            </div>
          )}
        </div>

        {/* 검색 필드 선택 및 검색 입력 */}
        <div className="mb-4 flex gap-4">
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="bg-gray-700 text-white rounded-md px-3 py-2"
          >
            {searchFields.map(field => (
              <option key={field.value} value={field.value}>
                {field.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="검색어를 입력하세요"
            className="flex-1 p-2 rounded-md bg-gray-700 text-white"
          />
        </div>

        {/* 데이터 통계 */}
        {csvData.length > 0 && (
          <div className="text-sm text-gray-400 mb-4">
            총 {csvData.length}개의 데이터가 로드되었습니다.
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-white">데이터를 불러오는 중...</div>
        )}

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="bg-gray-800 rounded-lg overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-700">
                <tr>
                  {searchFields.slice(1).map(field => (
                    <th key={field.value} className="px-4 py-2 text-left text-white whitespace-nowrap">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {searchResults.map((result, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    {searchFields.slice(1).map(field => (
                      <td key={field.value} className="px-4 py-2 text-white whitespace-nowrap">
                        {result[field.value] || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 검색 결과 없음 */}
        {searchTerm && searchResults.length === 0 && (
          <div className="text-white">검색 결과가 없습니다.</div>
        )}
      </div>
    </div>
  );
} 