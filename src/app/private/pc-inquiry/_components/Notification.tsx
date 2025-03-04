export default function Notification() {
    return (
      <div className="mt-8 bg-white rounded-lg p-6 shadow-lg border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">안내사항</h2>
      <ul className="list-disc list-inside text-gray-600 space-y-2">
        <li>신규PC 요청은 부서장 승인이 필요합니다.</li>
        <li>수리 요청은 신청 순서대로 처리하며 최대 n일 소요될 수 있습니다.</li>
        <li>PC 교체는 사용연한 x년 이상 시 검토 가능합니다.</li>
      </ul>
    </div>
    );
  }