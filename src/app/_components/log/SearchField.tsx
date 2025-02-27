interface SearchFieldProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    searchField: string;
    setSearchField: (field: string) => void;
  }
  
  export default function SearchField({ searchTerm, setSearchTerm, searchField, setSearchField }: SearchFieldProps) {
    return (
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <label className="text-white">검색 필드:</label>
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className="bg-gray-700 text-white rounded-md px-2 py-1"
          >
            <option value="all">전체</option>
            <option value="user">작업자</option>
            <option value="client">고객사</option>
            <option value="department">부서</option>
            <option value="model_name">모델명</option>
            <option value="serial">시리얼</option>
            <option value="code">코드</option>
            <option value="pc_name">PC 이름</option>
            <option value="task_details">작업내용</option>
            <option value="work_type">작업구분</option>
          </select>
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="검색어를 입력하세요"
            className="w-full bg-gray-700 text-white rounded-md px-3 py-1"
          />
        </div>
      </div>
    );
  }