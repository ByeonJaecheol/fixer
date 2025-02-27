'use client';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface UserData {
  name?: string;
  department?: string;
  position?: string;
  [key: string]: any;
}

export default function ExcelSearch() {
  const [excelData, setExcelData] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // 컴포넌트 마운트 시 저장된 데이터 불러오기
  useEffect(() => {
    const savedData = localStorage.getItem('excelData');
    const savedDate = localStorage.getItem('lastUpdated');
    
    if (savedData) {
      setExcelData(JSON.parse(savedData));
      setLastUpdated(savedDate || '');
    }
  }, []);

  // 엑셀 파일 처리
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    const file = e.target.files?.[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json<UserData>(worksheet);
          
          // 데이터를 상태와 로컬 스토리지에 저장
          setExcelData(jsonData);
          const now = new Date().toLocaleString();
          setLastUpdated(now);
          
          localStorage.setItem('excelData', JSON.stringify(jsonData));
          localStorage.setItem('lastUpdated', now);
          
          setIsLoading(false);
        } catch (error) {
          console.error('엑셀 파일 처리 중 오류:', error);
          setIsLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  // 데이터 초기화 함수
  const handleReset = () => {
    if (window.confirm('저장된 데이터를 모두 삭제하시겠습니까?')) {
      localStorage.removeItem('excelData');
      localStorage.removeItem('lastUpdated');
      setExcelData([]);
      setSearchResults([]);
      setLastUpdated('');
    }
  };

  // 검색 처리
  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    if (!searchValue.trim()) {
      setSearchResults([]);
      return;
    }

    const results = excelData.filter((user) => {
      return Object.values(user).some((value) =>
        value?.toString().toLowerCase().includes(searchValue.toLowerCase())
      );
    });

    setSearchResults(results);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-4">사용자 검색</h2>
        
        {/* 파일 업로드 및 데이터 관리 */}
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept=".xlsx, .xls"
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

        {/* 검색 입력 */}
        <div className="mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="이름, 부서, 직급 등으로 검색"
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        {/* 데이터 통계 */}
        {excelData.length > 0 && (
          <div className="text-sm text-gray-400 mb-4">
            총 {excelData.length}개의 데이터가 로드되었습니다.
          </div>
        )}

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-white">데이터를 불러오는 중...</div>
        )}

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-700">
                <tr>
                  {Object.keys(searchResults[0]).map((header) => (
                    <th key={header} className="px-4 py-2 text-left text-white">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {searchResults.map((result, index) => (
                  <tr key={index} className="border-t border-gray-700">
                    {Object.values(result).map((value, i) => (
                      <td key={i} className="px-4 py-2 text-white">
                        {value?.toString() || ''}
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