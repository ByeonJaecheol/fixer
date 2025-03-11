import { tailwindDesign } from "@/design/tailwindDesign";
import CommonInputOnChange from "../common/input/CommonInputOnChange";

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
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            className={tailwindDesign.input}
          >
            <option value="all">전체</option>
            <option value="user">작업자</option>
            <option value="client">고객사</option>
            <option value="department">부서</option>
            <option value="model_name">모델명</option>
            <option value="serial">제조번호</option>
            <option value="code">코드</option>
            <option value="pc_name">PC 이름</option>
            <option value="task_details">작업내용</option>
            <option value="work_type">작업구분</option>
          </select>
        </div>
        <div className="flex-1">
          <CommonInputOnChange value={searchTerm} setValue={setSearchTerm} type="text" name="searchTerm" placeholder="검색어를 입력하세요" />
        </div>
      </div>
    );
  }