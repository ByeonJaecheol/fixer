'use client';

import { supabase } from "@/app/utils/supabase";
import { parseISO, format } from "date-fns";
import { ko } from "date-fns/locale";
import { useEffect, useState } from "react";


interface ISchedule {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    created_by: string;
    created_at: string;
    color: string;
}
// 최근 등록된 일정 컴포넌트
export default function RecentSchedules( {recentSchedules, setRecentSchedules, loading, setLoading}: {recentSchedules: any, setRecentSchedules: any, loading: any, setLoading: any} ) {

  
   
    // 날짜 형식 변환 (YYYY-MM-DD -> YYYY년 MM월 DD일)
    const formatDate = (dateString: string) => {
      const date = parseISO(dateString);
      return format(date, 'yyyy년 MM월 dd일', { locale: ko });
    };
  
    // 시간 형식 변환 (ISO -> MM월 DD일 HH:MM)
    const formatDateTime = (dateTimeString: string) => {
      const date = new Date(dateTimeString);
      return format(date, 'MM월 dd일 HH:mm', { locale: ko });
    };
  
    // 이메일에서 이니셜 추출
    const getInitials = (email: string): string => {
      if (email.includes('@')) {
        const name = email.split('@')[0];
        return name.length > 1 ? name.substring(0, 2).toUpperCase() : name.toUpperCase();
      }
      return email.length > 1 ? email.substring(0, 2).toUpperCase() : email.toUpperCase();
    };
  
    // 데이터가 없거나 로딩 중일 때 최소 높이 계산
    const minHeight = loading || recentSchedules.length === 0 ? 'min-h-[100px]' : '';
  
    return (
      <div className="w-full rounded-xl bg-gradient-to-br from-white to-indigo-50 shadow-md flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="p-4 border-b border-indigo-100 flex items-center">
          <svg className="w-5 h-5 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-800">최근 등록된 일정</h2>
        </div>
        <div className={`divide-y divide-indigo-100 ${minHeight}`}>
          {loading ? (
            <div className="p-6 flex justify-center items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : recentSchedules.length > 0 ? (
            recentSchedules.map((schedule: ISchedule) => (
              <div key={schedule.id} className="p-4 hover:bg-indigo-50 transition-colors duration-200">
                <div className="flex items-start">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white mr-3 flex-shrink-0 shadow-sm transform hover:scale-105 transition-transform duration-200"
                    style={{ backgroundColor: schedule.color }}
                  >
                    <span className="font-bold text-xs">{getInitials(schedule.created_by)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{schedule.title}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {formatDate(schedule.start_date)} ~ {formatDate(schedule.end_date)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-gray-500 truncate flex items-center">
                        <svg className="w-3 h-3 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {schedule.created_by}
                      </span>
                      <span className="text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">
                        {schedule.created_at ? formatDateTime(schedule.created_at) : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center justify-center">
              <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              등록된 일정이 없습니다.
            </div>
          )}
        </div>
        <div className="p-3 bg-indigo-50 text-right rounded-b-lg border-t border-indigo-100 mt-auto group">
          <a href="/private/schedule" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 inline-flex items-center transition-colors duration-200">
            모든 일정 보기
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    );
  }