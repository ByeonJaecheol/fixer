import { Suspense } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/app/_components/common/LoadingSpinner';
import SupabaseService, { IImage, IImageInfo } from '@/api/supabase/supabaseApi';
import { formatToKoreanTime } from '@/utils/utils';

async function ImageDetailContent({ id }: { id: string }) {
  const supabaseService = SupabaseService.getInstance();
  
  // 기본 이미지 정보 가져오기
  const { success: imageSuccess, data: imageData } = await supabaseService.select({
    table: 'image',
    columns: '*',
    match: { id: parseInt(id) },
  });

  if (!imageSuccess || !imageData || imageData.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>해당 이미지를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const image: IImage = imageData[0];

  // 해당 이미지의 모든 버전 정보 가져오기
  const { success: versionsSuccess, data: versionsData } = await supabaseService.select({
    table: 'imageInfo',
    columns: '*',
    match: { image_id: parseInt(id) },
    order: { column: 'created_at', ascending: false }
  });

  const versions: IImageInfo[] = versionsSuccess ? (versionsData || []) : [];

  const gridStyle = {
    gridTemplateColumns: '80px 120px 120px 120px 250px 200px'
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 기본 이미지 정보 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {image.brand} {image.model_name}
            </h1>
            <p className="text-gray-600">{image.win_version}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link
              href={`/private/image/edit/${image.id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              기본 정보 수정
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">기본 정보</h3>
            <dl className="space-y-2">
              <div className="flex">
                <dt className="w-20 text-sm font-medium text-gray-500">브랜드:</dt>
                <dd className="text-sm text-gray-900">{image.brand}</dd>
              </div>
              <div className="flex">
                <dt className="w-20 text-sm font-medium text-gray-500">모델명:</dt>
                <dd className="text-sm text-gray-900">{image.model_name}</dd>
              </div>
              <div className="flex">
                <dt className="w-20 text-sm font-medium text-gray-500">윈도우:</dt>
                <dd className="text-sm text-gray-900">{image.win_version}</dd>
              </div>
              <div className="flex">
                <dt className="w-20 text-sm font-medium text-gray-500">등록자:</dt>
                <dd className="text-sm text-gray-900">{image.created_by ? image.created_by.split('@')[0] : '-'}</dd>
              </div>
              <div className="flex">
                <dt className="w-20 text-sm font-medium text-gray-500">등록일:</dt>
                <dd className="text-sm text-gray-900">{formatToKoreanTime(image.created_at, 'date')}</dd>
              </div>
            </dl>
          </div>

          {image.base_description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">기본 설명</h3>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{image.base_description}</p>
            </div>
          )}
        </div>
      </div>

      {/* 버전 정보 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">버전 히스토리</h2>
          <Link
            href={`/private/image/version/write?imageId=${image.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            새 버전 추가
          </Link>
        </div>

        {versions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">버전 정보가 없습니다</h3>
            <p className="text-gray-500 mb-4">이 이미지의 첫 번째 버전을 등록해보세요.</p>
            <Link
              href={`/private/image/version/write?imageId=${image.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              버전 추가
            </Link>
          </div>
        ) : (
          <>
            {/* 테이블 헤더 */}
            <div className="grid bg-gray-50 border-b border-gray-200 p-4" style={gridStyle}>
              <div className="text-sm font-semibold text-gray-700">ID</div>
              <div className="text-sm font-semibold text-gray-700">작업일</div>
              <div className="text-sm font-semibold text-gray-700">작업 유형</div>
              <div className="text-sm font-semibold text-gray-700">오피스 버전</div>
              <div className="text-sm font-semibold text-gray-700">다음 업데이트 계획</div>
              <div className="text-sm font-semibold text-gray-700">작성자</div>
            </div>

            {/* 테이블 바디 */}
            <div className="divide-y divide-gray-200">
              {versions.map((version: IImageInfo) => (
                <Link
                  key={version.id}
                  href={`/private/image/version/detail/${version.id}`}
                  className="grid p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  style={gridStyle}
                >
                  <div className="text-sm text-gray-900">{version.id}</div>
                  <div className="text-sm text-gray-900">
                    {version.work_date ? formatToKoreanTime(version.work_date, 'date') : '-'}
                  </div>
                  <div className="text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      version.work_type === '팩토리' ? 'bg-green-100 text-green-800' :
                      version.work_type === '업데이트' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {version.work_type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-900">{version.office_version || '-'}</div>
                  <div className="text-sm text-gray-900 truncate" title={version.next_update || ''}>
                    {version.next_update || '-'}
                  </div>
                  <div className="text-sm text-gray-900">
                    {version.created_by ? version.created_by.split('@')[0] : '-'}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 뒤로가기 버튼 */}
      <div className="mt-6 flex justify-start">
        <Link
          href="/private/image"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          ← 목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default async function ImageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <Suspense fallback={
      <div className="p-6 flex justify-center">
        <LoadingSpinner />
      </div>
    }>
      <ImageDetailContent id={id} />
    </Suspense>
  );
} 