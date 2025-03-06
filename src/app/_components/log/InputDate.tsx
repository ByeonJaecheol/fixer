import { tailwindDesign } from "@/design/tailwindDesign";
import CommonInputOnChange from "../common/input/CommonInputOnChange";

export default function InputDate({ value, setValue, name, label, type }: { value: string, setValue: (value: string) => void, name: string, label: string, type: string }) {
  return (
    <div className="flex flex-col">
        <h3 className={tailwindDesign.inputLabel}>{label}</h3>
        <CommonInputOnChange value={value} setValue={setValue} type={type} name={name}  />
    </div>
  );
}
