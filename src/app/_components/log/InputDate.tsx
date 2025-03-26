import { tailwindDesign } from "@/design/tailwindDesign";
import CommonInputOnChange from "../common/input/CommonInputOnChange";

export default function InputDate({ value, setValue, name, label,secondLabel, type, defaultValue, disabled }: { value: string, setValue: (value: string) => void, name: string, label: string,secondLabel?:string, type: string, defaultValue?: string, disabled?:boolean }) {
  return (
    <div className="flex flex-col">
      <div className="flex flex-row items-center gap-1"> 
        <h3 className={tailwindDesign.inputLabel}>{label}</h3>
        {secondLabel&&<h4 className={tailwindDesign.inputLabel_with_second}>{secondLabel}</h4>}
      </div>
        <CommonInputOnChange value={value} setValue={setValue} type={type} name={name} defaultValue={defaultValue} disabled={disabled} />
    </div>
  );
}
