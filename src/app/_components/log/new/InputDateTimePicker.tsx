'use client';

import { Popover, PopoverButton, PopoverPanel, useClose } from '@headlessui/react';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { tailwindDesign } from '@/design/tailwindDesign';

function ApplyButton({ onApply }: { onApply: () => void }) {
  const close = useClose();
  return (
    <button
      type="button"
      onClick={() => {
        onApply();
        close();
      }}
      className="w-full mt-3 px-3 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
    >
      적용
    </button>
  );
}

interface InputDateTimePickerProps {
  label: string;
  value: string | undefined;
  setValue: (value: string | undefined) => void;
  placeholder?: string;
}

export default function InputDateTimePicker({
  label,
  value,
  setValue,
  placeholder = 'yyyy-MM-dd HH:mm:ss',
}: InputDateTimePickerProps) {
  const [textValue, setTextValue] = useState(value ?? '');

  useEffect(() => {
    setTextValue(value ?? '');
  }, [value]);

  const handleApply = () => {
    if (!textValue.trim()) {
      setValue(undefined);
      return;
    }
    setValue(textValue);
  };

  return (
    <div className="flex flex-col">
      <h3 className={tailwindDesign.inputLabel}>{label}</h3>
      <Popover className="relative">
        <div className="relative">
          <input
            type="text"
            readOnly
            value={value ?? ''}
            placeholder={placeholder}
            className={`${tailwindDesign.input} pr-16 cursor-default bg-white`}
          />
          <PopoverButton
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
          >
            <PencilSquareIcon className="w-4 h-4" />
            수정
          </PopoverButton>
        </div>

        <PopoverPanel
          anchor="bottom start"
          className="z-50 mt-2 w-[min(100vw-2rem,320px)] rounded-lg border border-slate-200 bg-white p-4 shadow-lg"
        >
          <label className="text-xs font-medium text-slate-500 mb-1 block">작성일시 입력</label>
          <input
            type="text"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            placeholder={placeholder}
            className={`${tailwindDesign.input} text-sm`}
          />
          <ApplyButton onApply={handleApply} />
        </PopoverPanel>
      </Popover>
    </div>
  );
}
