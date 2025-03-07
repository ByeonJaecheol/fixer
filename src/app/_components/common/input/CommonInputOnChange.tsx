import { tailwindDesign } from "@/design/tailwindDesign";

export default function CommonInputOnChange({ value, setValue, type, name, placeholder, required, ref, defaultValue }:
     { value: string, setValue: (value: string) => void, type: string, name: string, placeholder?: string, required?: boolean, ref?: React.Ref<HTMLInputElement>, defaultValue?: string}) {
    return (
        <>
            <input type={type} name={name} className={tailwindDesign.input} value={value} ref={ref}
                 onChange={(e) => setValue(e.target.value)} placeholder={placeholder} required={required} defaultValue={defaultValue}   />
        </>
    );
}
