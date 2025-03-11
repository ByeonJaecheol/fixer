import { tailwindDesign } from "@/design/tailwindDesign";
import CommonTextArea from "../../common/input/CommonTextArea";

export default function InputTextArea({label, value, setValue, placeholder}:{label:string, value:string, setValue:(value:string) => void, placeholder?:string}) {
    return (
        <div className="flex flex-col ">
            <h3 className={tailwindDesign.inputLabel}>{label}</h3>
            <CommonTextArea value={value} setValue={setValue} name={label} placeholder={placeholder} />
        </div>
    )
}