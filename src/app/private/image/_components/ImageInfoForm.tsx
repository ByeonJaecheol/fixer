'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import SupabaseService, { IImageInfo, IImageInfoWithImage } from '@/api/supabase/supabaseApi';
import OkButton from '@/app/_components/common/input/button/OkButton';
import InputDate from '@/app/_components/log/InputDate';
import InputDropDown from '@/app/_components/log/new/InputDropDown';
import InputLog from '@/app/_components/log/new/InputLog';
import InputTextArea from '@/app/_components/log/new/InputTextArea';

// 오피스 버전 옵션
const OFFICE_VERSION_OPTIONS = [
  { value: 'Office 2016 32bit', label: 'Office 2016 32bit' },
  { value: 'Office 2016 64bit', label: 'Office 2016 64bit' },
  { value: 'Office 2010 32bit', label: 'Office 2010 32bit' },
  { value: 'Office 2010 64bit', label: 'Office 2010 64bit' },
  { value: 'Office 2019 32bit', label: 'Office 2019 32bit' },
  { value: 'Office 2019 64bit', label: 'Office 2019 64bit' },
  { value: '없음', label: '없음' }
];

// 작업 유형 옵션
const WORK_TYPE_OPTIONS = [
  { value: '팩토리', label: '팩토리' },
  { value: '업데이트', label: '업데이트' },
];

interface ImageInfoFormProps {
  mode: 'create' | 'edit';
  imageId: number;
  imageInfo?: IImageInfoWithImage;
}

export default function ImageInfoForm({ mode, imageId, imageInfo }: ImageInfoFormProps) {
  const { user } = useUser();
  const router = useRouter();
  
  // 각 드롭다운마다 개별적인 ref 사용
  const workTypeRef = useRef<HTMLSelectElement>(null);
  const officeVersionRef = useRef<HTMLSelectElement>(null);
  
  const [workDate, setWorkDate] = useState(imageInfo?.work_date || new Date().toISOString().split('T')[0]);
  const [workType, setWorkType] = useState(imageInfo?.work_type || '');
  const [officeVersion, setOfficeVersion] = useState(imageInfo?.office_version || '');
  const [detailDescription, setDetailDescription] = useState(imageInfo?.detail_description || '');
  const [nextUpdate, setNextUpdate] = useState(imageInfo?.next_update || '');
  const [isLoading, setIsLoading] = useState(false);

  // 등록/수정 처리
  const handleSubmit = async () => {
    if (!workType.trim()) {
      alert('작업 유형을 선택해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const supabaseService = SupabaseService.getInstance();
      
      const data = {
        image_id: imageId,
        work_date: workDate,
        work_type: workType,
        office_version: officeVersion,
        detail_description: detailDescription,
        next_update: nextUpdate,
        created_by: user?.email
      };

      if (mode === 'create') {
        const result = await supabaseService.insert({
          table: 'imageInfo',
          data: data
        });

        if (result.success) {
          alert('버전 정보가 등록되었습니다.');
          router.push(`/private/image/detail/${imageId}`);
        } else {
          alert('등록에 실패했습니다.');
          console.error('등록 실패:', result);
        }
      } else if (mode === 'edit' && imageInfo) {
        const result = await supabaseService.update({
          table: 'imageInfo',
          data: data,
          match: { id: imageInfo.id }
        });

        if (result.success) {
          alert('버전 정보가 수정되었습니다.');
          router.push(`/private/image/detail/${imageId}`);
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
    if (!imageInfo) return;
    
    if (!confirm('정말로 삭제하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    try {
      const supabaseService = SupabaseService.getInstance();
      
      const result = await supabaseService.delete({
        table: 'imageInfo',
        match: { id: imageInfo.id }
      });

      if (result.success) {
        alert('버전 정보가 삭제되었습니다.');
        router.push(`/private/image/detail/${imageId}`);
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
            버전 정보 {mode === 'create' ? '등록' : '수정'}
          </h1>
          <p className="text-gray-600">
            이미지 버전 상세 정보를 {mode === 'create' ? '등록' : '수정'}합니다.
          </p>
          {imageInfo?.image && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <span className="font-medium">대상 이미지:</span> {imageInfo.image.brand} {imageInfo.image.model_name} ({imageInfo.image.win_version})
              </p>
            </div>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">버전 정보</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <InputDate
              label="작업일"
              value={workDate}
              setValue={setWorkDate}
              name="workDate"
              type="date"
            />
            
            <InputDropDown
              label="작업 유형"
              value={workType}
              setValue={setWorkType}
              ref={workTypeRef}
              options={WORK_TYPE_OPTIONS}
              placeholder="작업 유형을 선택하세요"
            />
            
            <InputDropDown
              label="오피스 버전"
              value={officeVersion}
              setValue={setOfficeVersion}
              ref={officeVersionRef}
              options={OFFICE_VERSION_OPTIONS}
              placeholder="오피스 버전을 선택하세요"
            />

            <InputLog
              label="다음 업데이트에 수정/추가할 내용"
              value={nextUpdate}
              setValue={(value) => setNextUpdate(value || '')}
              required={true}
              placeholder="예: 패치 적용, 보안패치 적용, 드라이버 업데이트 등"
            />
          </div>
        </div>

        {/* 상세 설명 */}
        <div className="mb-6">
          <InputTextArea
            label="상세 설명"
            value={detailDescription}
            setValue={setDetailDescription}
            placeholder="이번 버전의 변경사항, 특이사항 등을 상세히 입력해주세요"
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