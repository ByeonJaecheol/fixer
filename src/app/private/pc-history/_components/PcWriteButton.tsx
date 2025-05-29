'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function PcWriteButton() {
  return (
    <Link
      href="/private/pc-history/write"
      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium shadow-sm"
    >
      <PlusIcon className="w-5 h-5" />
      PC 이력 작성
    </Link>
  );
} 