import { tailwindDesign } from "@/design/tailwindDesign";
import CommonInputOnChange from "../../common/input/CommonInputOnChange";

export default function InputLog({label, value, setValue, required,onKeyDown,placeholder,disabled}:{label:string, value:string|undefined, setValue:(value:string|undefined) => void, required?:boolean,onKeyDown?:()=>void,placeholder?:string,disabled?:boolean}) {
    return (
        <div className="flex flex-col ">
            <h3 className={tailwindDesign.inputLabel}>{label}</h3>
                <CommonInputOnChange value={value||""} setValue={setValue} type="text" name={label} required={required} onKeyDown={onKeyDown} placeholder={placeholder} disabled={disabled} />
        </div>
    )
}