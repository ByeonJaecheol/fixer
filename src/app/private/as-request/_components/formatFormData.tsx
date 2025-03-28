'use client'

import { useState } from "react";

interface InputFieldProps {
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
  }
  

  
export const FormatFormData = ({formData,setFormData}:{formData:any,setFormData:any}) => {


    const handleChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement>
      ) => {
        setFormData((prev:any) => ({
          ...prev,
          [field]: e.target.value
        }));
      };
  
  return (
    <div className="flex flex-col gap-y-4">
                <InputField
                  label="컴퓨터 설명"
                  placeholder="컴퓨터의 세부 설명을 입력하세요"
                  value={formData.pcDescription}
                  onChange={handleChange('pcDescription')}
                  required
                />
                <InputField
                  label="컴퓨터 이름"
                  placeholder="컴퓨터 이름을 입력하세요"
                  value={formData.pcName}
                  onChange={handleChange('pcName')}
                  required
                />
                <InputField
                  label="알약 정보"
                  placeholder="알약 버전 정보를 입력하세요"
                  value={formData.alYac}
                  onChange={handleChange('alYac')}
                />
                <InputField
                  label="IT 자산"
                  placeholder="IT 자산 정보를 입력하세요"
                  value={formData.jaSan}
                  onChange={handleChange('jaSan')}
                />
                <InputField
                  label="프린터"
                  placeholder="프린터 정보를 입력하세요"
                  value={formData.printer}
                  onChange={handleChange('printer')}
                />
                <InputField
                  label="아웃룩"
                  placeholder="아웃룩 설정 정보를 입력하세요"
                  value={formData.outlook}
                  onChange={handleChange('outlook')}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="프로그램"
                    placeholder="설치된 프로그램 목록을 입력하세요"
                    value={formData.program}
                    onChange={handleChange('program')}
                  />
                </div>
              </div>
  )
};


const InputField = ({ label, placeholder, value, onChange, required = false }: InputFieldProps) => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  placeholder-gray-400 transition-all duration-200
                  hover:border-gray-400"
        required={required}
      />
    </div>
  );
  