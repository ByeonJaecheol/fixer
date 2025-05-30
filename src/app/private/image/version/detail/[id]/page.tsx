import { Suspense } from 'react';
import LoadingSpinner from '@/app/_components/common/LoadingSpinner';
import SupabaseService, { IImageInfoWithImage } from '@/api/supabase/supabaseApi';
import ImageInfoForm from '../../../_components/ImageInfoForm';

async function VersionDetailContent({ id }: { id: string }) {
  const supabaseService = SupabaseService.getInstance();
  
  // 버전 정보와 이미지 정보를 함께 가져오기
  const { success, data } = await supabaseService.selectWithRelations({
    table: 'imageInfo',
    columns: '*',
    relations: [
      { table: 'image', columns: '*' }
    ],
    match: { id: parseInt(id) },
  });

  if (!success || !data || data.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>해당 버전 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const imageInfo: IImageInfoWithImage = data[0];
  
  return <ImageInfoForm mode="edit" imageId={imageInfo.image_id} imageInfo={imageInfo} />;
}

export default async function VersionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense fallback={
      <div className="p-6 flex justify-center">
        <LoadingSpinner />
      </div>
    }>
      <VersionDetailContent id={id} />
    </Suspense>
  );
} 