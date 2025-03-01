import { tailwindDesign } from "@/design/tailwindDesign";

interface WorkTypeProps {
    workType: string;
    setWorkType: (workType: string) => void;
}

export default function WorkType({ workType, setWorkType }: WorkTypeProps) {
        
  return (
 <div className="mb-6">
 <h3 className={tailwindDesign.inputLabel}>작업 유형</h3>
 <div className="flex flex-wrap gap-4">
   {["신규","신규_재배치", "교체_재배치", "교체_신규", "수리", "반납","폐기"].map((type) => (
     <label key={type} className="flex items-center gap-2">
       <input
         type="radio"
         name="workType"
         value={type}
         checked={workType === type}
         onChange={(e) => setWorkType(e.target.value)}
         className="w-4 h-4"
       />
       <span className="">{type}</span>
     </label>
   ))}
 </div>
 </div>        
);
}
