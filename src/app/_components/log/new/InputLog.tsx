import { tailwindDesign } from "@/design/tailwindDesign";
import CommonInputOnChange from "../../common/input/CommonInputOnChange";

export default function InputLog({label, value, setValue, required,onKeyDown,placeholder,disabled,secondLabel}:{label:string, value:string|undefined, setValue:(value:string|undefined) => void, required?:boolean,onKeyDown?:()=>void,placeholder?:string,disabled?:boolean,secondLabel?:string}) {
    return (
        <div className="flex flex-col ">
            <div className="flex flex-row items-center gap-x-2">
            <h3 className={tailwindDesign.inputLabel}>{label}</h3>
            <h4 className="flex flex-row text-xs text-center items-center justify-center text-red-500">
                {secondLabel&&<div className="text-xs ">{secondLabel}</div>}
            </h4>
            </div>
                <CommonInputOnChange value={value||""} setValue={setValue} type="text" name={label} required={required} onKeyDown={onKeyDown} placeholder={placeholder} disabled={disabled} />
        </div>
    )
}