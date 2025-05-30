'use client'
import { CheckIcon, ViewColumnsIcon, PlusIcon, PhotoIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

export interface IImageCategory {
    id: string;
    name: string;
    value: string;
    icon: React.ComponentType<any> | (() => React.ReactElement);
    color: string;
    href: string;
}

export const imageCategories: IImageCategory[] = [
    {
      id: 'all',
      name: '전체보기',
      value: 'all',
      icon: ViewColumnsIcon,
      color: 'text-gray-600',
      href: '/private/image'
    },
    {
      id: 'image-create',
      name: '이미지 등록',
      value: 'write',
      icon: PlusIcon,
      color: 'text-green-600',
      href: '/private/image/write'
    },
  ];

export default function ImageMenus({categories}:{categories:IImageCategory[]}) {
  const pathname = useSelectedLayoutSegment();
    return (
      // 반응형 모바일 뷰 대응
        <div className="flex flex-wrap gap-x-4 px-4 items-center">
          {categories.map((category : IImageCategory) => {
            // 특별한 컴포넌트 처리
            if (category.id === 'date-filter') {
              const Component = category.icon;
              return (
                <div key={category.id} className="ml-auto">
                  {React.isValidElement(Component) ? Component : typeof Component === 'function' ? <Component /> : null}
                </div>
              );
            }

            // 일반 메뉴 아이템
            const IconComponent = category.icon as React.ComponentType<any>;
            
            // pathname 매칭 로직 개선
            const isActive = (
              (category.value === 'all' && (pathname === null || pathname === '')) ||
              (category.value === pathname) ||
              (category.value === 'write' && pathname === 'write')
            );
            
            return (
              <Link
                key={category.id}
                href={category.href}
                className={`group flex-shrink-0 flex flex-col items-center p-2 md:px-4 border-b-2 border-transparent hover:border-blue-500 focus:outline-none focus:border-blue-500 transition-colors duration-200
                ${isActive ? 'text-blue-600 font-bold ' : 'text-gray-700 font-medium'}
                `}
              >
                <div className={`p-3 rounded-lg bg-gray-50 group-hover:bg-blue-50 transition-colors duration-200 ${isActive ? 'bg-green-300' : 'bg-gray-50'}`}>
                  {isActive ? <CheckIcon className={`w-6 h-6 group-hover:text-violet-300 `} /> : <IconComponent className={`w-6 h-6 ${category.color} group-hover:text-blue-600`} />}
                </div>
                <span className={`mt-2 text-sm group-hover:text-blue-600 ${isActive ? 'text-blue-600 font-bold ' : 'text-gray-700 font-medium'}`}>
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
    )
} 