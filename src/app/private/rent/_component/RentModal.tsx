'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/app/utils/supabase';
import SupabaseService, { IRentResultAsset } from '@/api/supabase/supabaseApi';
import { useRouter } from 'next/navigation';
interface RentFormData {
  workplace: string;
  department: string;
  employeeName: string;
  rentStartDate: string;
  returnDate: string;
  reason: string;
  requester: string;
}

export default function RentModal({id, rentType, rentName, isOpen = false, onClose = () => {} }: { id: number, rentType: string, rentName: string, isOpen: boolean, onClose: () => void }) {
  const router = useRouter();
  const [formData, setFormData] = useState<RentFormData>({
    workplace: '',
    department: '',
    employeeName: '',
    // 기본값으로 오늘 날짜  
    rentStartDate: new Date().toISOString().split('T')[0],
    // 기본값으로 오늘 날짜 + 1일
    returnDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
    reason: '',
    requester: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 폼 제출 로직 구현
    createRentManagementLog();
    
    // console.log(formData);
  };

  const createRentManagementLog = async () => {
    console.log('createRentManagementLog 시작');
    const supabaseService = SupabaseService.getInstance();
    const logResult = await supabaseService.insert({
      table: 'rent_management_log',
      data: {
        rent_id: id,
        rent_type: '대여',
        rent_start_date: formData.rentStartDate,
        return_date: formData.returnDate,
        rent_reason: formData.reason,
        employee_name: formData.employeeName,
        employee_department: formData.department,
        employee_workspace: formData.workplace,
        requester: formData.requester
      }
    });
    console.log('createRentManagementLog 완료',logResult);
    if(logResult.success){
      const updateResult = await supabaseService.update({
        table: 'rent_assets',
        data: {
          rent_start_date: formData.rentStartDate,
          return_date: formData.returnDate,
          rent_reason: formData.reason,
          employee_name: formData.employeeName,
          employee_department: formData.department,
          employee_workspace: formData.workplace,
          is_rented: true,
          requester: formData.requester
        },
        match: { id: id }
      });
      console.log('rent_assets 업데이트 완료',updateResult);
      alert('대여 신청 성공');
      router.refresh();
      setFormData({
        workplace: '',
        department: '',
        employeeName: '',
        rentStartDate: '',
        returnDate: '',
        reason: '',
        requester: ''
      }); 
    }else{
      alert('대여 신청 실패');
    }
    onClose();
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* 배경 오버레이 */}
      <div className="fixed inset-0 bg-black/10" aria-hidden="true" />
      
      {/* 모달 컨테이너 */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-2xl bg-white rounded-xl shadow-xl">
          {/* 모달 헤더 */}
          <div className="flex items-center justify-between p-6 border-b">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              [{rentType} {rentName}] 대여 신청
            </Dialog.Title>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          {/* 모달 본문 */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-6">
              {/* 사업장 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사업장 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="workplace"
                  value={formData.workplace}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* 부서 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  부서 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 사원명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사용자 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="employeeName"
                  value={formData.employeeName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* 의뢰인 */}  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  의뢰인
                </label>
                <input
                  type="text"
                  name="requester"
                  value={formData.requester}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 대여일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  대여일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="rentStartDate"
                  value={formData.rentStartDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 반납예정일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  반납예정일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* 대여사유 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                대여사유 <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                신청하기
              </button>
            </div>
          </form>
          <div>
            {/* 디버깅 영역 */}
            {/* <div>
              {rentResultAsset.id}
              <p>formData: {JSON.stringify(formData)}</p>
            </div> */}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
