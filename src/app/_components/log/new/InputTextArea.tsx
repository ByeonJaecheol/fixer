import { tailwindDesign } from "@/design/tailwindDesign";
import CommonTextArea from "../../common/input/CommonTextArea";

export default function InputTextArea({label, value, setValue}:{label:string, value:string, setValue:(value:string) => void}) {
    return (
        <div className="flex flex-col ">
            <h3 className={tailwindDesign.inputLabel}>{label}</h3>
            <CommonTextArea value={value} setValue={setValue} name={label} />
        </div>
    )
}