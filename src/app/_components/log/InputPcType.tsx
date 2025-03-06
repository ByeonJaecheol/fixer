import { tailwindDesign } from "@/design/tailwindDesign";
import CommonInputOnChange from "../common/input/CommonInputOnChange";

export default function InputPcType({ pcType, setPcType }: { pcType: string, setPcType: (pcType: string) => void }) {
    const pcTypeList = ["데스크탑", "노트북"];
  return (
    <div className="flex flex-col col-span-1 md:col-span-2">
      <h3 className={tailwindDesign.inputLabel}>PC타입</h3>
      <div className="flex flex-row gap-2">
        {pcTypeList.map((type) => (
        <div key={type}>
          <input type="radio" value={type} checked={pcType === type} onChange={(e) => setPcType(e.target.value)} />
          <label htmlFor={`model-${type}`} className="">
            {type}
          </label>
        </div>
      ))}
      </div>
    </div>
  );
}
