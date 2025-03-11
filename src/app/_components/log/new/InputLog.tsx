import { tailwindDesign } from "@/design/tailwindDesign";
import CommonInputOnChange from "../../common/input/CommonInputOnChange";

export default function InputLog({label, value, setValue, required,onKeyDown,placeholder}:{label:string, value:string, setValue:(value:string) => void, required?:boolean,onKeyDown?:()=>void,placeholder?:string}) {
    return (
        <div className="flex flex-col ">
            <h3 className={tailwindDesign.inputLabel}>{label}</h3>
            <CommonInputOnChange value={value} setValue={setValue} type="text" name={label} required={required} onKeyDown={onKeyDown} placeholder={placeholder} />
        </div>
    )
}