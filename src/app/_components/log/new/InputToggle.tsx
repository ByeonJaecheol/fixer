import CommonInputToggle from "../../common/input/CommonInputToggle";
import { ICheckBoxOption } from "@/app/constants/objects";

export default function InputToggle({label, value, setValue, object}:{label:string, value:boolean, setValue:(value:boolean) => void, object:ICheckBoxOption[]}) {  
    return (
            <CommonInputToggle label={label} value={value} setValue={setValue} object={object} />
    )
}