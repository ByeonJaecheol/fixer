'use client';

import { supabase } from "@/app/utils/supabase";
import { parseISO, format, differenceInCalendarDays, startOfDay } from "date-fns";
import { ko } from "date-fns/locale";
import { useEffect, useState } from "react";
import { formatAuthorName, getAuthorInitials } from "@/utils/userProfile";


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

  
   
    // 날짜 형식 — 읽기 쉬우면서도 카드 너비에 맞는 길이
    const formatScheduleRange = (startDate: string, endDate: string) => {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const sameDay =
        start.getFullYear() === end.getFullYear() &&
        start.getMonth() === end.getMonth() &&
        start.getDate() === end.getDate();

      if (sameDay) {
        return format(start, 'M월 d일', { locale: ko });
      }
      if (start.getFullYear() === end.getFullYear()) {
        return `${format(start, 'M월 d일', { locale: ko })} ~ ${format(end, 'M월 d일', { locale: ko })}`;
      }
      return `${format(start, 'yy.M.d', { locale: ko })} ~ ${format(end, 'yy.M.d', { locale: ko })}`;
    };

    const formatDateTime = (dateTimeString: string) => {
      const date = new Date(dateTimeString);
      return format(date, 'MM월 dd일 HH:mm', { locale: ko });
    };

    /** D-day: 당일/종료 후 -NN일(빨강), 시작 전 -NN일 */
    const getDDay = (startDate: string, endDate: string) => {
      const today = startOfDay(new Date());
      const start = startOfDay(parseISO(startDate));
      const end = startOfDay(parseISO(endDate));
      const pad = (n: number) => String(n).padStart(2, '0');

      if (end < today) {
        const days = differenceInCalendarDays(today, end);
        return { text: `-${pad(days)}일`, isRed: true };
      }
      if (start <= today && end >= today) {
        return { text: '-00일', isRed: true };
      }
      const days = differenceInCalendarDays(start, today);
      return { text: `-${pad(days)}일`, isRed: false };
    };
  
    // 작성자 이니셜
    const getInitials = (author: string): string => getAuthorInitials(author);
  
    // 데이터가 없거나 로딩 중일 때 최소 높이 계산
    const minHeight = loading || recentSchedules.length === 0 ? 'min-h-[100px]' : '';
  
    return (
      <div className="w-full rounded-lg bg-white border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center">
          <svg className="w-4 h-4 text-slate-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 className="text-base font-semibold text-slate-800">최근 등록된 일정</h2>
        </div>
        <div className={`divide-y divide-slate-100 ${minHeight}`}>
          {loading ? (
            <div className="p-6 flex justify-center items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-600"></div>
            </div>
          ) : recentSchedules.length > 0 ? (
            recentSchedules.map((schedule: ISchedule) => {
              const dday = getDDay(schedule.start_date, schedule.end_date);
              return (
              <div key={schedule.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-md flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: schedule.color }}
                  >
                    <span className="font-bold text-xs">{getInitials(schedule.created_by)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-base font-semibold text-slate-900 truncate">{schedule.title}</p>
                      <span
                        className={`text-sm font-bold shrink-0 tabular-nums ${
                          dday.isRed ? 'text-red-600' : 'text-slate-600'
                        }`}
                      >
                        {dday.text}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 mt-1 text-sm text-slate-600 leading-relaxed">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="break-keep">
                        {formatScheduleRange(schedule.start_date, schedule.end_date)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-sm text-slate-500 flex items-center min-w-0">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="truncate">{formatAuthorName(schedule.created_by)}</span>
                      </span>
                      {schedule.created_at && (
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                          {formatDateTime(schedule.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
            })
          ) : (
            <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center justify-center">
              <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              등록된 일정이 없습니다.
            </div>
          )}
        </div>
        <div className="px-4 py-2.5 bg-slate-50 text-right border-t border-slate-200 mt-auto">
          <a href="/private/schedule" className="text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center transition-colors">
            모든 일정 보기
            <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    );
  }