import { tailwindDesign } from "@/design/tailwindDesign";

export default function CommonInputOnChange({ value, setValue, type, name, placeholder, required, ref, defaultValue, onKeyDown, disabled }:
     { value: string, setValue: (value: string) => void, type: string, name: string, placeholder?: string, required?: boolean, ref?: React.Ref<HTMLInputElement>, defaultValue?: string, onKeyDown?:()=>void, disabled?:boolean}) {
    return (
        <>
            <input type={type} name={name} className={tailwindDesign.input + (disabled ? 'cursor-not-allowed bg-gray-200' : 'cursor-pointer')} value={value||""} ref={ref}
            // 엔터키 눌렀을 때 이벤트 처리
            onKeyDown={(e)=>{
                if(e.key==="Enter"){
                    onKeyDown?.();
                }
            }}
                 onChange={(e) => setValue(e.target.value)} placeholder={placeholder} required={required} defaultValue={defaultValue} disabled={disabled} />
        </>
    );
}
