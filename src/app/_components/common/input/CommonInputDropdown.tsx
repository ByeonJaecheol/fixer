import { IDropDownOption } from "@/app/constants/objects";
import { tailwindDesign } from "@/design/tailwindDesign";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

  
export default function CommonInputDropdown({ value, setValue, type, name, placeholder, required, ref, options, disabled }:
     { value: string, setValue: (value: string) => void, type: string, name: string, placeholder?: string, required?: boolean, ref: React.Ref<HTMLSelectElement>, options: IDropDownOption[], disabled?:boolean }) {
    return (
        <>
           <div className="relative">
      <select
        id={name}
        name={name}
        value={value||''}
        onChange={(e) => setValue(e.target.value)}
        ref={ref}
        required={required}
        disabled={disabled}
        className={`
          ${tailwindDesign.input}
          appearance-none
          pr-10
          cursor-pointer
          ${disabled ? 'cursor-not-allowed bg-gray-200' : 'cursor-pointer'}
          ${!value ? 'text-gray-500' : 'text-gray-900'}
        `}
      >
        <option value="" disabled className="text-gray-500">
          {placeholder || '선택하세요'}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-gray-900">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
            {/* <input type={type} name={name} className={tailwindDesign.input} value={value} ref={ref} */}
                 {/* onChange={(e) => setValue(e.target.value)} placeholder={placeholder} required={required} /> */}
        </>
    );
}
