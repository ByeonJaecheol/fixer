'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import SupabaseService, { IImage } from '@/api/supabase/supabaseApi';
import OkButton from '@/app/_components/common/input/button/OkButton';
import InputDropDown from '@/app/_components/log/new/InputDropDown';
import InputLog from '@/app/_components/log/new/InputLog';
import InputTextArea from '@/app/_components/log/new/InputTextArea';

// 브랜드 옵션
const BRAND_OPTIONS = [
  { value: 'HP', label: 'HP' },
  { value: 'LG', label: 'LG' },
  { value: '삼성', label: '삼성' }
];

// 윈도우 버전 옵션
const WIN_VERSION_OPTIONS = [
  { value: 'Windows 7', label: 'Windows 7' },
  { value: 'Windows 10', label: 'Windows 10' },
  { value: 'Windows 11', label: 'Windows 11' }
];

interface ImageFormProps {
  mode: 'create' | 'edit';
  image?: IImage;
}

export default function ImageForm({ mode, image }: ImageFormProps) {
  const { user } = useUser();
  const router = useRouter();
  
  // 각 드롭다운마다 개별적인 ref 사용
  const brandRef = useRef<HTMLSelectElement>(null);
  const winVersionRef = useRef<HTMLSelectElement>(null);
  
  const [brand, setBrand] = useState(image?.brand || '');
  const [modelName, setModelName] = useState(image?.model_name || '');
  const [winVersion, setWinVersion] = useState(image?.win_version || '');
  const [baseDescription, setBaseDescription] = useState(image?.base_description || '');
  const [isActive, setIsActive] = useState(image?.is_active ?? true);
  const [isLoading, setIsLoading] = useState(false);

  // 등록/수정 처리
  const handleSubmit = async () => {
    if (!brand.trim()) {
      alert('브랜드를 선택해주세요.');
      return;
    }
    if (!modelName.trim()) {
      alert('모델명을 입력해주세요.');
      return;
    }
    if (!winVersion.trim()) {
      alert('윈도우 버전을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const supabaseService = SupabaseService.getInstance();
      
      const data = {
        brand: brand,
        model_name: modelName,
        win_version: winVersion,
        created_by: user?.email
      };

      if (mode === 'create') {
        const result = await supabaseService.insert({
          table: 'image',
          data: data
        });

        if (result.success) {
          alert('이미지가 등록되었습니다.');
          router.push('/private/image');
        } else {
          alert('등록에 실패했습니다.');
          console.error('등록 실패:', result);
        }
      } else if (mode === 'edit' && image) {
        const result = await supabaseService.update({
          table: 'image',
          data: data,
          match: { id: image.id }
        });

        if (result.success) {
          alert('이미지가 수정되었습니다.');
          router.push('/private/image');
        } else {
          alert('수정에 실패했습니다.');
          console.error('수정 실패:', result);
        }
      }
    } catch (error) {
      console.error('오류 발생:', error);
      alert('처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 삭제 처리
  const handleDelete = async () => {
    if (!image) return;
    
    if (!confirm('정말로 삭제하시겠습니까? 이 이미지와 관련된 모든 버전 정보도 함께 삭제됩니다.')) {
      return;
    }

    setIsLoading(true);
    try {
      const supabaseService = SupabaseService.getInstance();
      
      // 먼저 관련된 imageInfo 데이터 삭제
      const deleteInfoResult = await supabaseService.delete({
        table: 'imageInfo',
        match: { image_id: image.id }
      });

      if (!deleteInfoResult.success) {
        alert('관련 정보 삭제에 실패했습니다.');
        console.error('관련 정보 삭제 실패:', deleteInfoResult);
        return;
      }

      // 이미지 삭제
      const result = await supabaseService.delete({
        table: 'image',
        match: { id: image.id }
      });

      if (result.success) {
        alert('이미지가 삭제되었습니다.');
        router.push('/private/image');
      } else {
        alert('삭제에 실패했습니다.');
        console.error('삭제 실패:', result);
      }
    } catch (error) {
      console.error('오류 발생:', error);
      alert('삭제 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            이미지 {mode === 'create' ? '등록' : '수정'}
          </h1>
          <p className="text-gray-600">
            윈도우 이미지 기본 정보를 {mode === 'create' ? '등록' : '수정'}합니다.
          </p>
        </div>

        {/* 기본 정보 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">기본 정보</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputDropDown
              label="브랜드"
              value={brand}
              setValue={setBrand}
              ref={brandRef}
              options={BRAND_OPTIONS}
              placeholder="브랜드를 선택하세요"
            />
            
            <InputLog
              label="모델명"
              value={modelName}
              setValue={(value) => setModelName(value || '')}
              required={true}
              placeholder="모델명을 입력해주세요"
            />

            <InputDropDown
              label="윈도우 버전"
              value={winVersion}
              setValue={setWinVersion}
              ref={winVersionRef}
              options={WIN_VERSION_OPTIONS}
              placeholder="윈도우 버전을 선택하세요"
            />

            <div className="flex items-center">
              
            </div>
          </div>
        </div>

        {/* 설명 */}
        <div className="mb-6">
          <InputTextArea
            label="기본 설명"
            value={baseDescription}
            setValue={setBaseDescription}
            placeholder="이미지에 대한 기본 설명을 입력해주세요"
          />
        </div>

        {/* 버튼 */}
        <div className="flex justify-between">
          <div>
            {mode === 'edit' && (
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                삭제
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              취소
            </button>
            
            <OkButton
              onClick={handleSubmit}
              isLoading={isLoading}
              buttonText={mode === 'create' ? '등록' : '수정'}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 