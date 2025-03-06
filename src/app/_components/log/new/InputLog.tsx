import { tailwindDesign } from "@/design/tailwindDesign";
import CommonInputOnChange from "../../common/input/CommonInputOnChange";

export default function InputLog({label, value, setValue}:{label:string, value:string, setValue:(value:string) => void}) {
    return (
        <div className="flex flex-col ">
            <h3 className={tailwindDesign.inputLabel}>{label}</h3>
            <CommonInputOnChange value={value} setValue={setValue} type="text" name={label} />
        </div>
    )
}