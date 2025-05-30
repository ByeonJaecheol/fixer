import { tailwindDesign } from "@/design/tailwindDesign";
import CommonInputDropdown from "../../common/input/CommonInputDropdown";
import { IDropDownOption } from "@/app/constants/objects";

export default function InputDropDown({label, value, setValue, ref, options, disabled, placeholder}:{label:string, value:string, setValue:(value:string) => void, ref:React.Ref<HTMLSelectElement>, options:IDropDownOption[], disabled?:boolean, placeholder?:string}) {  
    return (
        <div className="flex flex-col ">
            <h3 className={tailwindDesign.inputLabel}>{label}</h3>
            <CommonInputDropdown value={value} setValue={setValue} type="dropdown" name={label} ref={ref} options={options} disabled={disabled} placeholder={placeholder} />
        </div>
    )
}