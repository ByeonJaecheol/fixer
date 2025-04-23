import { tailwindDesign } from "@/design/tailwindDesign";

export default function CommonInputOnChange({ value, setValue, type, name, placeholder, required, ref, defaultValue, onKeyDown, disabled, min, max }:
     { value: string, setValue: (value: string) => void, type: string, name: string, placeholder?: string, required?: boolean, ref?: React.Ref<HTMLInputElement>, defaultValue?: string, onKeyDown?:()=>void, disabled?:boolean, min?: string, max?: string}) {
    // date 타입일 경우 min, max 값 기본 설정 (년도 4자리 제한)
    const dateMin = type === 'date' ? (min || '1000-01-01') : min;
    const dateMax = type === 'date' ? (max || '9999-12-31') : max;
    
    return (
        <>
            <input 
                type={type} 
                name={name} 
                className={tailwindDesign.input + (disabled ? ' cursor-not-allowed bg-gray-200' : ' cursor-pointer')} 
                value={value||""} 
                ref={ref}
                min={dateMin}
                max={dateMax}
                // 엔터키 눌렀을 때 이벤트 처리
                onKeyDown={(e)=>{
                    if(e.key==="Enter"){
                        onKeyDown?.();
                    }
                }}
                onChange={(e) => {
                    // date 타입이고 입력된 값이 존재할 때 유효성 검사
                    if (type === 'date' && e.target.value) {
                        const dateValue = new Date(e.target.value);
                        const year = dateValue.getFullYear();
                        // 년도가 1000-9999 범위를 벗어나면 값 설정하지 않음
                        if (year < 1000 || year > 9999) {
                            return;
                        }
                    }
                    setValue(e.target.value);
                }} 
                placeholder={placeholder} 
                required={required} 
                defaultValue={defaultValue} 
                disabled={disabled} 
            />
        </>
    );
}
