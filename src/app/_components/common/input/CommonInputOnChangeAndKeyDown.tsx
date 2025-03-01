import { tailwindDesign } from "@/design/tailwindDesign";

export default function CommonInputOnChangeAndKeyDown({ value, setValue, type, name, placeholder, required, onKeyDown }:
     { value: string, setValue: (value: string) => void, type: string, name: string, placeholder?: string, required?: boolean, onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void   }) {
    return (
        <>
            <input type={type} name={name} className={tailwindDesign.input_with_border} value={value}
                 onChange={(e) => setValue(e.target.value)} placeholder={placeholder} required={required} onKeyDown={onKeyDown} />
        </>
    );
}
