import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import LoadingSpinner from '@/app/_components/common/LoadingSpinner';
import SupabaseService, { IImage } from '@/api/supabase/supabaseApi';
import ImageInfoForm from '../../_components/ImageInfoForm';

async function VersionWriteContent({ searchParams }: { searchParams: { imageId?: string } }) {
  const imageId = searchParams.imageId;
  
  console.log('VersionWriteContent - searchParams:', searchParams);
  console.log('VersionWriteContent - imageId:', imageId);
  
  if (!imageId) {
    console.error('imageId가 없습니다');
    redirect('/private/image');
  }

  // imageId가 숫자인지 확인
  const parsedImageId = parseInt(imageId);
  if (isNaN(parsedImageId)) {
    console.error('유효하지 않은 imageId:', imageId);
    redirect('/private/image');
  }

  try {
    const supabaseService = SupabaseService.getInstance();
    
    // 이미지 정보 확인
    const { success, data, error } = await supabaseService.select({
      table: 'image',
      columns: '*',
      match: { id: parsedImageId },
    });

    console.log('이미지 조회 결과:', { success, data, error });

    if (!success || !data || data.length === 0) {
      return (
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>해당 이미지를 찾을 수 없습니다. (ID: {imageId})</p>
            <p className="text-sm mt-2">에러: {error || '알 수 없는 오류'}</p>
          </div>
        </div>
      );
    }

    const image: IImage = data[0];
    
    return (
      <div>
        <div className="max-w-4xl mx-auto p-6 mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">대상 이미지</h2>
            <p className="text-blue-800">
              <span className="font-medium">{image.brand} {image.model_name}</span> ({image.win_version})
            </p>
          </div>
        </div>
        <ImageInfoForm mode="create" imageId={parsedImageId} />
      </div>
    );
  } catch (error) {
    console.error('VersionWriteContent 에러:', error);
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>페이지를 로드하는 중 오류가 발생했습니다.</p>
          <p className="text-sm mt-2">에러: {String(error)}</p>
        </div>
      </div>
    );
  }
}

export default async function VersionWritePage({ 
  searchParams 
}: { 
  searchParams: Promise<{ imageId?: string }> 
}) {
  try {
    const resolvedSearchParams = await searchParams;
    console.log('VersionWritePage - resolvedSearchParams:', resolvedSearchParams);
    
    return (
      <Suspense fallback={
        <div className="p-6 flex justify-center">
          <LoadingSpinner />
        </div>
      }>
        <VersionWriteContent searchParams={resolvedSearchParams} />
      </Suspense>
    );
  } catch (error) {
    console.error('VersionWritePage 에러:', error);
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>페이지를 로드할 수 없습니다.</p>
          <p className="text-sm mt-2">에러: {String(error)}</p>
        </div>
      </div>
    );
  }
} 