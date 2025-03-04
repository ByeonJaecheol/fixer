import { useState } from 'react';
import { ComputerDesktopIcon, CommandLineIcon, PrinterIcon, GlobeAltIcon, ViewColumnsIcon } from '@heroicons/react/24/outline';
import Container from '@/app/_components/Container';
import InputHistory from '@/app/_components/log/InputHistory';

const categories = [
  {
    id: 'all',
    name: '전체보기',
    icon: ViewColumnsIcon,
    color: 'text-gray-600'
  },
  {
    id: 'hw',
    name: 'H/W',
    icon: ComputerDesktopIcon,
    color: 'text-blue-600'
  },
  {
    id: 'sw',
    name: 'S/W',
    icon: CommandLineIcon,
    color: 'text-green-600'
  },
  {
    id: 'printer',
    name: '프린터',
    icon: PrinterIcon,
    color: 'text-purple-600'
  },
  {
    id: 'network',
    name: '네트워크',
    icon: GlobeAltIcon,
    color: 'text-orange-600'
  }
];

export default function HistoryPage() {
  return (
    <Container title="이력관리" description="카테고리별 이력을 확인하실 수 있습니다.">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              className="group flex-shrink-0 flex flex-col items-center px-6 py-4 border-b-2 border-transparent hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors duration-200"
            >
              <div className={`p-3 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors duration-200`}>
                <category.icon className={`w-6 h-6 ${category.color} group-hover:text-blue-600`} />
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600">
                {category.name}
              </span>
            </button>
          ))}
        </div>
        {/* 입력폼 */}
        <InputHistory />
        {/* 컨텐츠 영역 */}
        <div className="p-6">
          <div className="space-y-4">
            {/* 임시 데이터 테이블 */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구분</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">내용</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2024-03-14</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">H/W</td>
                  <td className="px-6 py-4 text-sm text-gray-500">메모리 증설 요청</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">완료</span>
                  </td>
                </tr>
                {/* 더 많은 행 추가 가능 */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Container>
  );
}
