import { tailwindDesign } from "@/design/tailwindDesign";

interface SortFieldProps {
  sortField: 'id' | 'created_at' | 'receivedDate' | 'pc_name';
  setSortField: (field: 'id' | 'created_at' | 'receivedDate' | 'pc_name') => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
}

export default function SortField({ sortField, setSortField, sortOrder, setSortOrder }: SortFieldProps) {

  return (
    <>
    {/* 정렬 컨트롤 */}
    <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
            <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as 'id' | 'created_at' | 'receivedDate' | 'pc_name')}
                className={tailwindDesign.input}
            >
                <option value="created_at">작업일</option>
                <option value="receivedDate">입고일</option>
                <option value="id">ID</option>
                <option value="pc_name">PC 이름</option>
            </select>
            </div>
            <div className="flex items-center gap-2">
            <label className="text-white">정렬 순서:</label>
            <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="bg-gray-700 text-white rounded-md px-2 py-1"
            >
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
            </select>
            </div>
        </div>
    </>
  );
}
