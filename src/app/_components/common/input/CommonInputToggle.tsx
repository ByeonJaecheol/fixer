import { ICheckBoxOption } from "@/app/constants/objects";

export default function CommonInputToggle({ value, setValue,label,object  }: { value: boolean, setValue: (value: boolean) => void, label: string,object:ICheckBoxOption[] }) {
    return (
        <div className="w-20 flex flex-row">
           <label className=" ">
                <input type="checkbox" value={value.toString()} className="sr-only peer" checked={value} onChange={() => setValue(!value)}/>
                <span className="text-sm">{label}</span>
                <div className="relative w-16 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300
                 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full
                  peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300
                   after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600">
                   <span className="text-sm">{object.find(item => item.value === value)?.label}</span>
                   </div>
            </label>
        </div>
    );
}
