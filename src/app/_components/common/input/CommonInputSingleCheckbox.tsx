'use client'

import { useEffect, useState } from "react";

export default function CommonInputSingleCheckbox({
  title, 
  value, 
  setValue, 
  options
}: {
  title: string, 
  value: string, 
  setValue: (value: string) => void, 
  options: string[]
}) {
    const [selected, setSelected] = useState<string>(value);

    const handleChange = (option: string) => {
        // 이미 선택된 항목을 다시 클릭하면 선택 해제하지 않음
        // 항상 하나의 항목은 선택되어 있어야 함
        if (option !== selected) {
            setSelected(option);
        }
    }

    useEffect(() => {
        setValue(selected);
    }, [selected, setValue]);

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
            <div className="flex flex-wrap gap-2">
                {options.map((option: string) => (
                    <label 
                        key={option} 
                        className={`flex items-center justify-center px-3 py-1.5 rounded-md cursor-pointer text-sm transition-colors
                            ${selected === option 
                                ? 'bg-orange-100 text-orange-700 border border-orange-300' 
                                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}
                    >
                        <input
                            type="radio"
                            className="sr-only" // 실제 라디오 버튼은 숨기고 커스텀 스타일 적용
                            value={option}
                            checked={selected === option}
                            onChange={() => handleChange(option)}
                            name={title} // name 속성 추가하여 그룹화
                        />
                        {option}
                    </label>
                ))}
            </div>
        </div>
    )
}
