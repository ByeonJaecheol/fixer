'use client'

import { useEffect, useState } from "react";

export default function CommonInputMultiCheckbox({title, value, setValue, options}:{title : string, value:string[], setValue:(value:string[]) => void, options:string[]}) {
    const [checked, setChecked] = useState<string[]>(value);

    const handleChange = (option:string) => {
        if(checked.includes(option)){
            setChecked(checked.filter((item) => item !== option));
        }else{
            setChecked([...checked, option]);
        }
    }

    useEffect(() => {
        setValue(checked);
    }, [checked]);

    console.log(checked);
    return (
        <div>
            <label>{title}</label>
            <div className="flex flex-wrap gap-2">
                {options.map((option:string) => (
                    <label key={option} className="flex items-center justify-center cursor-pointer text-sm">
                        <input
                            type="checkbox"
                            className="w-4 h-4 mr-1 text-white  rounded-sm focus:ring-orange-500 accent-orange-500 focus:bg-orange-500 focus:color-orange-500 dark:focus:ring-orange-500  focus:ring-2 cursor-pointer"
                            value={option}
                            checked={checked.includes(option)}
                            onChange={() => handleChange(option)}
                        />
                        {option}
                    </label>
                ))}
            </div>
        </div>
    )
}
