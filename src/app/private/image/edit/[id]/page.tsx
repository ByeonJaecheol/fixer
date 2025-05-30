import { Suspense } from 'react';
import LoadingSpinner from '@/app/_components/common/LoadingSpinner';
import SupabaseService, { IImage } from '@/api/supabase/supabaseApi';
import ImageForm from '../../_components/ImageForm';

async function ImageEditContent({ id }: { id: string }) {
  const supabaseService = SupabaseService.getInstance();
  
  const { success, data } = await supabaseService.select({
    table: 'image',
    columns: '*',
    match: { id: parseInt(id) },
  });

  if (!success || !data || data.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>해당 이미지를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const image: IImage = data[0];
  
  return <ImageForm mode="edit" image={image} />;
}

export default async function ImageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense fallback={
      <div className="p-6 flex justify-center">
        <LoadingSpinner />
      </div>
    }>
      <ImageEditContent id={id} />
    </Suspense>
  );
} 