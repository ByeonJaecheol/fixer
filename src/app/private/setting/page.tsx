'use client';

import { useState } from 'react';
import { Cog6ToothIcon, UsersIcon } from '@heroicons/react/24/outline';
import EmployeeRefreshTab from './_components/EmployeeRefreshTab';

type SettingTab = 'general' | 'employees';

const TABS: { id: SettingTab; label: string; icon: typeof Cog6ToothIcon }[] = [
  { id: 'general', label: '일반', icon: Cog6ToothIcon },
  { id: 'employees', label: '사원목록 최신화', icon: UsersIcon },
];

export default function SettingPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>('employees');

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1200px]">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-slate-900">설정</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          시스템 설정 및 데이터 관리를 할 수 있습니다.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <nav className="lg:w-52 shrink-0">
          <div className="flex lg:flex-col rounded-lg overflow-hidden border border-slate-200 bg-white">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b lg:border-b-0 lg:border-r-0 last:border-b-0 ${
                    isActive
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {activeTab === 'general' && (
            <div className="bg-white border border-slate-200 rounded-lg p-8">
              <h2 className="text-base font-semibold text-slate-900 mb-2">일반 설정</h2>
              <p className="text-sm text-slate-500">
                추가 설정 항목은 추후 이 탭에서 관리할 수 있습니다.
              </p>
            </div>
          )}

          {activeTab === 'employees' && <EmployeeRefreshTab />}
        </div>
      </div>
    </div>
  );
}
