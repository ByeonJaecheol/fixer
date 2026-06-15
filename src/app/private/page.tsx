'use client';

import { useEffect, useState } from 'react';
import {
  format, parseISO, subDays, startOfWeek, startOfYear, isWithinInterval, addDays,
  endOfWeek, endOfYear, startOfDay, endOfDay, startOfMonth, endOfMonth,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LabelList
} from 'recharts';
import { createClient } from '@/app/utils/client';
import Link from 'next/link';
import { RingLoader } from 'react-spinners';
import {
  ComputerDesktopIcon,
  ClipboardDocumentListIcon,
  WrenchScrewdriverIcon,
  DeviceTabletIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import RecentSchedules from './_components/RecentSchedules';
import { Activity, Asset, DateFilterOption, DateFilterType, RentAsset } from '../constants/chart';
import RentStatusChart from './_components/RentStatusChart';
import { IAsManagementLog } from '@/api/supabase/supabaseApi';
import { fetchAllAsManagementLogs, fetchAllTableRows } from '@/utils/asLogExport';

/** yyyy-MM-dd 문자열을 로컬 날짜로 파싱 (타임존 오차 방지) */
function parseDateValue(value: string): Date {
  const datePart = value.split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, d] = datePart.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return parseISO(value);
}

function toDateInterval(dateRange: { start: Date; end: Date }) {
  return { start: startOfDay(dateRange.start), end: endOfDay(dateRange.end) };
}

/** AS 이력의 작업일·등록일 후보 */
function getAsDateCandidates(log: IAsManagementLog): Date[] {
  const dates: Date[] = [];
  if (log.work_date) dates.push(parseDateValue(log.work_date));
  if (log.created_at) dates.push(startOfDay(parseISO(log.created_at)));
  return dates;
}

function matchesDateRange(dates: Date[], dateRange: { start: Date; end: Date }): boolean {
  if (!dates.length) return false;
  const interval = toDateInterval(dateRange);
  return dates.some((d) => isWithinInterval(d, interval));
}

function getAsBucketDate(log: IAsManagementLog): string | null {
  if (log.work_date) return format(parseDateValue(log.work_date), 'yyyy-MM-dd');
  if (log.created_at) return format(parseISO(log.created_at), 'yyyy-MM-dd');
  return null;
}

// 차트 데이터 타입 정의
interface AssetStatusCount {
  status: string;
  count: number;
  color: string;
}

interface DailyActivityCount {
  date: string;
  as_requests: number;
  pc_activities: number;
}

interface ChartData {
  name: string;
  value: number;
}

// 인터페이스 추가
interface WorkTypeStats {
  type: string;
  count: number;
  color: string;
}

interface SwCategoryStats {
  category: string;
  count: number;
  color: string;
}

interface HwCategoryStats {
  category: string;
  count: number;
  color: string;
}

export default function PrivateDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 최근 일정 상태
  const [recentSchedules, setRecentSchedules] = useState<any[]>([]);
  
  // 원시 데이터 상태
  const [assets, setAssets] = useState<Asset[]>([]);
  const [rentAssets, setRentAssets] = useState<RentAsset[]>([]);
  const [asActivities, setAsActivities] = useState<IAsManagementLog[]>([]);
  const [pcActivities, setPcActivities] = useState<Activity[]>([]);
  
  // 계산된 데이터 상태
  const [assetStatusData, setAssetStatusData] = useState<AssetStatusCount[]>([]);
  const [activityData, setActivityData] = useState<DailyActivityCount[]>([]);
  const [assetTypeData, setAssetTypeData] = useState<ChartData[]>([]);
  const [rentedAssetsData, setRentedAssetsData] = useState<ChartData[]>([]);
  
  // 새로운 상태 추가
  const [workTypeStats, setWorkTypeStats] = useState<WorkTypeStats[]>([]);
  const [swCategoryStats, setSwCategoryStats] = useState<SwCategoryStats[]>([]);
  const [hwCategoryStats, setHwCategoryStats] = useState<HwCategoryStats[]>([]);
  
  // 필터 상태 추가
  const [activeFilter, setActiveFilter] = useState<DateFilterType>('month');
  const [customDateRange, setCustomDateRange] = useState({
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  // 필터 옵션
  const filterOptions: DateFilterOption[] = [
    { id: 'today', label: '오늘' },
    { id: 'week', label: '이번 주' },
    { id: 'month', label: '이번달' },
    { id: 'year', label: '올해' },
    { id: 'custom', label: '기간 선택' }
  ];

  // 날짜 필터 함수
  const getDateRangeByFilter = (filter: DateFilterType): { start: Date, end: Date } => {
    const now = new Date();

    switch (filter) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        // 달력 주(월~일)가 아닌 최근 7일(오늘 포함) — 주 초반에도 최근 작업이 보이도록
        return {
          start: startOfDay(subDays(now, 6)),
          end: endOfDay(now),
        };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        return {
          start: startOfDay(parseISO(customDateRange.start)),
          end: endOfDay(parseISO(customDateRange.end)),
        };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  // 필터에 따른 데이터 필터링 함수
  const filterDataByDateRange = <T extends { created_at: string }>(
    data: T[],
    dateRange: { start: Date, end: Date }
  ): T[] => {
    const interval = toDateInterval(dateRange);
    return data.filter(item => {
      const itemDate = parseISO(item.created_at);
      return isWithinInterval(itemDate, interval);
    });
  };

  // AS 활동: 작업일(work_date) 또는 등록일(created_at) 중 하나라도 기간에 포함되면 집계
  const filterAsDataByDateRange = (
    data: IAsManagementLog[],
    dateRange: { start: Date, end: Date }
  ): IAsManagementLog[] => {
    return data.filter((item) => matchesDateRange(getAsDateCandidates(item), dateRange));
  };

  // 타입 정의에 새로운 상태 추가
  const [rentStatusData, setRentStatusData] = useState<{ type: string; total: number; rented: number }[]>([]);

  // 원시 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [assetsData, rentAssetsData, asActivitiesData, pcActivitiesData] = await Promise.all([
          fetchAllTableRows<Asset>('pc_assets', 'asset_id', true),
          fetchAllTableRows<RentAsset>('rent_assets', 'id', true),
          fetchAllAsManagementLogs(),
          fetchAllTableRows<Activity>('pc_management_log', 'created_at', false),
        ]);

        setAssets(assetsData);
        setRentAssets(rentAssetsData);
        setAsActivities(asActivitiesData);
        setPcActivities(pcActivitiesData);

        const rentTypeMap: Record<string, { total: number; rented: number }> = {};
        rentAssetsData.forEach((asset) => {
          const type = asset.rent_type || '미분류';
          if (!rentTypeMap[type]) rentTypeMap[type] = { total: 0, rented: 0 };
          rentTypeMap[type].total += 1;
          if (asset.is_rented) rentTypeMap[type].rented += 1;
        });

        setRentStatusData(
          Object.entries(rentTypeMap).map(([type, stats]) => ({
            type,
            total: stats.total,
            rented: stats.rented,
          }))
        );
      } catch (error) {
        console.error('데이터 처리 중 오류:', error);
        setError(error instanceof Error ? error.message : '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const fetchRecentSchedules = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .gte('start_date', today.toISOString())
          .order('start_date', { ascending: true })
          .limit(3);

        if (error) throw error;
        setRecentSchedules(data || []);
      } catch (error) {
        console.error('최근 일정을 불러오는 중 오류 발생:', error);
      }
    };

    fetchRecentSchedules();
  }, []);


  // 데이터 집계 로직 - 필터에 따라 다시 계산
  useEffect(() => {
    if (loading) return;
    
    try {
      const dateRange = getDateRangeByFilter(activeFilter);
      
      // 해당 기간 데이터만 필터링
      const filteredAsActivities = filterAsDataByDateRange(asActivities, dateRange);
      const filteredPcActivities = filterDataByDateRange(pcActivities, dateRange);
      
      // 1. 자산 상태별 통계 (자산 상태는 필터링하지 않음)
      const statusCounts: Record<string, number> = {};
      assets.forEach(asset => {
        const status = asset.status || '미분류';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });
      
      const statusColors = {
        available: '#2E7D32',
        rented: '#1565C0',
        maintenance: '#EF6C00',
        deprecated: '#C62828',
      };
      
      const formattedStatusData = Object.keys(statusCounts).map(status => ({
        status,
        count: statusCounts[status],
        color: statusColors[status as keyof typeof statusColors] || '#607D8B'
      }));
      
      setAssetStatusData(formattedStatusData);
      
      // 2. 활동 데이터 - 날짜 범위에 맞게 조정
      const activityByDate: Record<string, {as_requests: number, pc_activities: number}> = {};
      
      // 날짜 범위 초기화
      let currentDate = new Date(dateRange.start);
      while (currentDate <= dateRange.end) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        activityByDate[dateStr] = { as_requests: 0, pc_activities: 0 };
        currentDate = addDays(currentDate, 1);
      }
      
      // AS 활동 집계
      filteredAsActivities.forEach(activity => {
        const date = getAsBucketDate(activity);
        if (date && activityByDate[date]) {
          activityByDate[date].as_requests++;
        }
      });
      
      // PC 활동 집계
      filteredPcActivities.forEach(activity => {
        const date = format(parseISO(activity.created_at), 'yyyy-MM-dd');
        if (activityByDate[date]) {
          activityByDate[date].pc_activities++;
        }
      });
      
      // 날짜 표시 형식 조정 (필터에 따라)
      const dateFormat = activeFilter === 'year' ? 'MM월' : 'MM/dd';
      
      const formattedActivityData = Object.entries(activityByDate)
        .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
        .map(([date, counts]) => ({
          date: format(parseISO(date), dateFormat),
          as_requests: counts.as_requests,
          pc_activities: counts.pc_activities
        }));
      
      setActivityData(formattedActivityData);
      
      // 3. PC 타입별 통계 (자산 유형은 필터링하지 않음)
      const typeCounts: Record<string, number> = {};
      assets.forEach(asset => {
        const type = asset.pc_type || '미분류';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      
      const formattedTypeData = Object.keys(typeCounts).map(type => ({
        name: type,
        value: typeCounts[type]
      }));
      
      setAssetTypeData(formattedTypeData);
      
      // 4. 부서별 대여 현황
      const deptCounts: Record<string, number> = {};
      rentAssets
        .filter(asset => asset.is_rented)
        .forEach(asset => {
          const dept = asset.rent_type || '미할당';
          deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });
      
      const formattedDeptData = Object.keys(deptCounts).map(dept => ({
        name: dept,
        value: deptCounts[dept]
      }));
      
      setRentedAssetsData(formattedDeptData);
      
      // 작업 유형별 통계
      const workTypeCounts: Record<string, number> = {
        'H/W': 0,
        'S/W': 0,
        '네트워크': 0,
        '보안': 0,
        '기타': 0,
      };
      
      // S/W 카테고리별 통계
      const swCategoryCounts: Record<string, number> = {
        '프로그램': 0,
        '드라이버': 0,
        'OS/성능': 0,
        'DATA': 0,
        '기타': 0
      };
      
      filteredAsActivities.forEach(activity => {
        // 작업 유형 카운트
        if (activity.work_type) {
          workTypeCounts[activity.work_type] = (workTypeCounts[activity.work_type] || 0) + 1;
        } else {
          workTypeCounts['기타'] = (workTypeCounts['기타'] || 0) + 1;
        }
        
        // S/W 카테고리 카운트
        if (activity.work_type === 'S/W' && activity.category) {
          swCategoryCounts[activity.category] = (swCategoryCounts[activity.category] || 0) + 1;
        }
      });
      
      // H/W 카테고리별 통계
      const hwCategoryCounts: Record<string, number> = {
        'PC': 0,
        '모니터': 0,
        '프린터': 0,
        '기타': 0
      };
      filteredAsActivities.forEach(activity => {
        // H/W 카테고리 카운트
        if (activity.work_type === 'H/W' && activity.category) {
          hwCategoryCounts[activity.category] = (hwCategoryCounts[activity.category] || 0) + 1;
        }
      });
      
      // 작업 유형 통계 데이터 포맷 (색상: 빨주노초파남보)
      const formattedWorkTypeStats = Object.entries(workTypeCounts).map(([type, count], idx) => ({
        type,
        count,
        color:
          type === 'H/W' ? '#FF3B30' :      // 빨강
          type === 'S/W' ? '#FF9500' :      // 주황
          type === '네트워크' ? '#FFD600' : // 노랑
          type === '보안' ? '#34C759' :     // 초록
          type === '기타' ? '#007AFF' :    // 파랑
          idx === 5 ? '#5856D6' :           // 남색(6번째 항목)
          idx === 6 ? '#AF52DE' :           // 보라(7번째 항목)
          '#BDBDBD'
      }));
      
      // S/W 카테고리 통계 데이터 포맷
      const formattedSwCategoryStats = Object.entries(swCategoryCounts).map(([category, count]) => ({
        category,
        count,
        color:
          category === '프로그램' ? '#FF9500' : // 주황
          category === '드라이버' ? '#FFD600' : // 노랑
          category === 'OS/성능' ? '#34C759' :   // 초록
          category === 'DATA' ? '#007AFF' :      // 파랑
          '#AF52DE' // 보라(기타)
      }));

      // H/W 카테고리 통계 데이터 포맷
      const formattedHwCategoryStats = Object.entries(hwCategoryCounts).map(([category, count]) => ({
        category,
        count,
        color:
          category === 'PC' ? '#FF3B30' :      // 빨강
          category === '모니터' ? '#FF9500' : // 주황
          category === '프린터' ? '#FFD600' : // 노랑
          category === '기타' ? '#34C759' :   // 초록
          '#007AFF' // 파랑(남색, 보라까지 필요시 추가)
      }));
      
      setWorkTypeStats(formattedWorkTypeStats);
      setSwCategoryStats(formattedSwCategoryStats);
      setHwCategoryStats(formattedHwCategoryStats);
      
      // 보안, 네트워크 전체 건수 계산 (filteredAsActivities 기준)
      const securityCount = filteredAsActivities.filter(a => a.work_type === '보안').length;
      const networkCount = filteredAsActivities.filter(a => a.work_type === '네트워크').length;
      
    } catch (error) {
      console.error('데이터 계산 오류:', error);
      setError('데이터 처리 중 오류가 발생했습니다.');
    }
  }, [assets, rentAssets, asActivities, pcActivities, loading, activeFilter, customDateRange]);

  // 전문적인 차트 색상
  const COLORS = ['#1976D2', '#388E3C', '#F57C00', '#D32F2F', '#7B1FA2', '#0097A7'];

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-96">
        <RingLoader  speedMultiplier={1.5} color="#475569" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <h2 className="font-semibold text-lg">오류 발생</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // 선택된 날짜 범위 텍스트 생성
  const getDateRangeText = () => {
    const dateRange = getDateRangeByFilter(activeFilter);
    const formattedStart = format(dateRange.start, 'yyyy년 MM월 dd일', { locale: ko });
    const formattedEnd = format(dateRange.end, 'yyyy년 MM월 dd일', { locale: ko });
    
    if (activeFilter === 'today') {
      return `${formattedStart} 기준`;
    }
    
    return `${formattedStart} ~ ${formattedEnd}`;
  };

  const dateRange = getDateRangeByFilter(activeFilter);
  const filteredAsActivities = filterAsDataByDateRange(asActivities, dateRange);
  const securityCount = filteredAsActivities.filter(a => a.work_type === '보안').length;
  const networkCount = filteredAsActivities.filter(a => a.work_type === '네트워크').length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">자산 관리 대시보드</h1>
          <p className="text-sm text-slate-500 mt-0.5">PC 자산 현황 및 관리 통계</p>
        </div>
        
        {/* 날짜 필터 컨트롤 */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-xs text-slate-500 font-medium">조회 기간</div>
          <div className="inline-flex rounded-md border border-slate-300 bg-white overflow-hidden">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveFilter(option.id)}
                className={`px-3 py-1.5 text-xs font-medium border-r border-slate-300 last:border-r-0 transition-colors ${
                  activeFilter === option.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* 커스텀 기간 선택 */}
          {activeFilter === 'custom' && (
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-700"
              />
              <span className="text-slate-400 text-xs">~</span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-700"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* 선택된 날짜 범위 표시 */}
      <div className="mb-6 bg-white text-slate-700 px-4 py-2.5 rounded-md border border-slate-200 flex items-center justify-between">
        <span className="text-sm font-medium flex items-center">
          <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {getDateRangeText()}
        </span>
          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
          {activeFilter === 'week' ? '최근 7일' : activeFilter === 'today' ? '일간' : activeFilter === 'month' ? '월간' : activeFilter === 'year' ? '연간' : '사용자 지정'}
        </span>
      </div>

      {/* 상단 영역: 왼쪽에 통계 카드, 오른쪽에 최근 등록된 일정 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* 왼쪽: 통계 카드 영역 */}
        <div className="lg:col-span-9">
          <StatsCardGrid 
            assets={assets}
            pcActivities={pcActivities}
            asActivities={asActivities}
            rentAssets={rentAssets}
            activeFilter={activeFilter}
            getDateRangeByFilter={getDateRangeByFilter}
          />
        </div>
        
        {/* 오른쪽: 최근 등록된 일정 영역 */}
        <div className="lg:col-span-3">
          <RecentSchedules recentSchedules={recentSchedules} setRecentSchedules={setRecentSchedules} loading={loading} setLoading={setLoading} />
        </div>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* 활동 차트 */}
        <ChartCard title={`${activeFilter === 'today' ? '오늘' : activeFilter === 'week' ? '이번 주' : activeFilter === 'month' ? '이번달' : activeFilter === 'year' ? '올해' : '선택 기간'} 활동`}>
          {loading ? (
            <ChartSkeleton />
          ) : activityData.length > 0 ? (
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tick={{ fill: '#616161', fontSize: 11 }} />
                <YAxis tick={{ fill: '#616161', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="as_requests" name="작업이력" fill="#1E3A5F" />
                <Bar dataKey="pc_activities" name="장비이력" fill="#64748B" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataDisplay />
          )}
        </ChartCard>

          {/* 작업 유형별 통계 차트 - 수평 막대 차트 */}
          <ChartCard title="작업 유형별 통계">
          {loading ? (
            <ChartSkeleton />
          ) : workTypeStats.length > 0 ? (
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={workTypeStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fill: '#616161', fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="type" tick={{ fill: '#616161', fontSize: 13, fontWeight: 600 }} width={80} />
                <Tooltip formatter={(value: number) => [`${value}건`, '처리 건수']} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="count" name="처리 건수">
                  {workTypeStats.map((entry) => (
                    <Cell key={`cell-${entry.type}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="count"
                    content={({ x, y, width, height, value }) => {
                      const threshold = 40; // px
                      const w = typeof width === 'number' ? width : Number(width);
                      const h = typeof height === 'number' ? height : Number(height);
                      const xx = typeof x === 'number' ? x : Number(x);
                      const yy = typeof y === 'number' ? y : Number(y);
                      const isInside = w > threshold;
                      return (
                        <text
                          x={isInside ? (xx + w - 8) : (xx + w + 8)}
                          y={yy + h / 2}
                          fill={isInside ? '#fff' : '#222'}
                          fontWeight={600}
                          fontSize={15}
                          textAnchor={isInside ? 'end' : 'start'}
                          alignmentBaseline="middle"
                        >
                          {value ? `${value}건` : ''}
                        </text>
                      );
                    }}
                  />
                </Bar>
            </BarChart>
          </ResponsiveContainer>
          ) : (
            <NoDataDisplay />
          )}
        </ChartCard>

          {/* 임대PC 대여 현황 차트 */}
          <ChartCard title="임대PC 대여 현황">
          {loading ? (
            <ChartSkeleton />
          ) : rentStatusData && rentStatusData.length > 0 ? (
            <RentStatusChart data={rentStatusData} />
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-gray-500">데이터가 없습니다</p>
            </div>
          )}
        </ChartCard>
        
        {/* S/W 카테고리별 통계 차트 */}
        <ChartCard title="S/W 카테고리별 통계">
          {loading ? (
            <ChartSkeleton />
          ) : swCategoryStats.length > 0 ? (
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={swCategoryStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fill: '#616161', fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="category" tick={{ fill: '#616161', fontSize: 11 }} width={70} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  formatter={(value: number) => [`${value}건`, '처리 건수']}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar 
                  dataKey="count" 
                  name="처리 건수" 
                >
                  {swCategoryStats.map((entry) => (
                    <Cell key={`cell-${entry.category}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="count"
                    content={({ x, y, width, height, value }) => {
                      const threshold = 40;
                      const w = typeof width === 'number' ? width : Number(width);
                      const h = typeof height === 'number' ? height : Number(height);
                      const xx = typeof x === 'number' ? x : Number(x);
                      const yy = typeof y === 'number' ? y : Number(y);
                      const isInside = w > threshold;
                      return (
                        <text
                          x={isInside ? (xx + w - 8) : (xx + w + 8)}
                          y={yy + h / 2}
                          fill={isInside ? '#fff' : '#222'}
                          fontWeight={600}
                          fontSize={15}
                          textAnchor={isInside ? 'end' : 'start'}
                          alignmentBaseline="middle"
                        >
                          {value ? `${value}건` : ''}
                        </text>
                      );
                    }}
                  />
                </Bar>
        </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataDisplay />
          )}
        </ChartCard>

        {/* H/W 카테고리별 통계 차트 */}
        <ChartCard title="H/W 카테고리별 통계">
          {loading ? (
            <ChartSkeleton />
          ) : hwCategoryStats.length > 0 ? (
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={hwCategoryStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fill: '#616161', fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="category" tick={{ fill: '#616161', fontSize: 11 }} width={70} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  formatter={(value: number) => [`${value}건`, '처리 건수']}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar 
                  dataKey="count" 
                  name="처리 건수" 
                >
                  {hwCategoryStats.map((entry) => (
                    <Cell key={`cell-${entry.category}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="count"
                    content={({ x, y, width, height, value }) => {
                      const threshold = 40;
                      const w = typeof width === 'number' ? width : Number(width);
                      const h = typeof height === 'number' ? height : Number(height);
                      const xx = typeof x === 'number' ? x : Number(x);
                      const yy = typeof y === 'number' ? y : Number(y);
                      const isInside = w > threshold;
                      return (
                        <text
                          x={isInside ? (xx + w - 8) : (xx + w + 8)}
                          y={yy + h / 2}
                          fill={isInside ? '#fff' : '#222'}
                          fontWeight={600}
                          fontSize={15}
                          textAnchor={isInside ? 'end' : 'start'}
                          alignmentBaseline="middle"
                        >
                          {value ? `${value}건` : ''}
                        </text>
                      );
                    }}
                  />
                </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <NoDataDisplay />
        )}
      </ChartCard>

      

        {/* 보안/네트워크 전체 건수 카드 */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-800">보안 · 네트워크</h2>
          </div>
          <div className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-700">보안</span>
                <div className="text-2xl font-semibold text-slate-900 tabular-nums">{securityCount.toLocaleString()}<span className="text-sm font-normal text-slate-500 ml-1">건</span></div>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-700">네트워크</span>
                <div className="text-2xl font-semibold text-slate-900 tabular-nums">{networkCount.toLocaleString()}<span className="text-sm font-normal text-slate-500 ml-1">건</span></div>
              </div>
            </div>
          </div>
        </div>
      
      </div>
    </div>
  );
}

// 차트 카드 컴포넌트
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50">
        <h2 className="text-sm font-semibold text-slate-800 truncate">{title}</h2>
      </div>
      <div className="p-3 sm:p-4 h-[220px] sm:h-[250px] md:h-[280px]">
        {children}
      </div>
    </div>
  );
}

// 데이터 없음 디스플레이
function NoDataDisplay() {
  return (
    <div className="flex items-center justify-center h-full bg-slate-50 rounded border border-dashed border-slate-200">
      <div className="text-center">
        <svg className="w-8 h-8 mx-auto text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="mt-2 text-xs text-slate-400">데이터가 없습니다</p>
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
interface StatCardProps {
  title: string;
  value: number;
  trend: string;
  trendType: 'up' | 'down' | 'neutral';
  dateFilter: DateFilterType;
  link?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconBg: string;
}

function StatCard({ title, value, trend, trendType, dateFilter, link, icon: Icon, iconBg }: StatCardProps) {
  const getPeriodLabel = (filter: DateFilterType): string => {
    switch (filter) {
      case 'today': return '오늘';
      case 'week': return '최근 7일';
      case 'month': return '이번달';
      case 'year': return '올해';
      case 'custom': return '선택 기간';
      default: return '전체';
    }
  };

  const getComparisonText = (filter: DateFilterType): string => {
    switch (filter) {
      case 'today': return '지난주 같은 요일';
      case 'week': return '이전 7일';
      case 'month': return '지난달';
      case 'year': return '지난해';
      case 'custom': return '작년 동일 기간';
      default: return '이전 기간';
    }
  };

  const getPeriodParams = (filter: DateFilterType): string => {
    const today = new Date();
    let startDate = '';
    let endDate = '';

    switch (filter) {
      case 'today': {
        const date = format(today, 'yyyy-MM-dd');
        startDate = date;
        endDate = date;
        break;
      }
      case 'week': {
        startDate = format(startOfDay(subDays(today, 6)), 'yyyy-MM-dd');
        endDate = format(endOfDay(today), 'yyyy-MM-dd');
        break;
      }
      case 'month': {
        startDate = format(startOfMonth(today), 'yyyy-MM-dd');
        endDate = format(endOfMonth(today), 'yyyy-MM-dd');
        break;
      }
      case 'year': {
        startDate = format(startOfYear(today), 'yyyy-MM-dd');
        endDate = format(endOfYear(today), 'yyyy-MM-dd');
        break;
      }
      case 'custom':
        break;
    }

    return `period=${filter}&startDate=${startDate}&endDate=${endDate}`;
  };

  const trendStyles =
    trendType === 'up'
      ? 'bg-emerald-50 text-emerald-700'
      : trendType === 'down'
        ? 'bg-red-50 text-red-600'
        : 'bg-slate-100 text-slate-600';

  const cardBody = (
    <div className="flex flex-col h-full min-h-[148px]">
      <div className="p-4 pb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shadow-sm`}>
            <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 leading-tight">{title}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{getPeriodLabel(dateFilter)}</p>
          </div>
        </div>
        {link && (
          <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-1" />
        )}
      </div>

      <div className="px-4 py-2 flex-1">
        <p className="text-[2rem] font-bold text-slate-900 tabular-nums leading-none tracking-tight">
          {value.toLocaleString()}
        </p>
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/80 flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-semibold ${trendStyles}`}>
          {trendType === 'up' && <ArrowTrendingUpIcon className="w-3.5 h-3.5" />}
          {trendType === 'down' && <ArrowTrendingDownIcon className="w-3.5 h-3.5" />}
          {trend}
        </span>
        <span className="text-[11px] text-slate-400">{getComparisonText(dateFilter)} 대비</span>
      </div>
    </div>
  );

  const cardClass =
    'group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all h-full overflow-hidden block';

  if (link) {
    return (
      <Link href={`${link}?${getPeriodParams(dateFilter)}`} className={cardClass}>
        {cardBody}
      </Link>
    );
  }

  return <div className={cardClass}>{cardBody}</div>;
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse flex flex-col h-full justify-center items-center">
      <div className="h-48 w-full bg-gray-200 rounded"></div>
    </div>
  );
}


// StatsCardGrid 컴포넌트
function StatsCardGrid({ 
  assets, 
  pcActivities, 
  asActivities, 
  rentAssets, 
  activeFilter,
  getDateRangeByFilter
}: { 
  assets: Asset[]; 
  pcActivities: Activity[]; 
  asActivities: IAsManagementLog[]; 
  rentAssets: RentAsset[]; 
  activeFilter: DateFilterType;
  getDateRangeByFilter: (filter: DateFilterType) => { start: Date, end: Date };
}) {
  // 현재 선택된 기간 범위 가져오기
  const currentDateRange = getDateRangeByFilter(activeFilter);
  
  // 과거 데이터 비교용 함수 (AS 활동용)
  const calculatePreviousPeriodData = (activities: IAsManagementLog[], filter: DateFilterType): number => {
    // 현재 범위
    const currentRange = getDateRangeByFilter(filter);
    
    // 비교 범위 (과거 데이터)
    let previousRange = { start: new Date(), end: new Date() };
    
    switch (filter) {
      case 'today':
        // 지난주 같은 요일
        previousRange.start = new Date(currentRange.start);
        previousRange.end = new Date(currentRange.end);
        previousRange.start.setDate(previousRange.start.getDate() - 7);
        previousRange.end.setDate(previousRange.end.getDate() - 7);
        break;
      case 'week':
        // 지난주
        previousRange.start = new Date(currentRange.start);
        previousRange.end = new Date(currentRange.end);
        previousRange.start.setDate(previousRange.start.getDate() - 7);
        previousRange.end.setDate(previousRange.end.getDate() - 7);
        break;
      case 'month':
        // 지난달
        previousRange.start = new Date(currentRange.start);
        previousRange.end = new Date(currentRange.end);
        previousRange.start.setMonth(previousRange.start.getMonth() - 1);
        previousRange.end.setMonth(previousRange.end.getMonth() - 1);
        break;
      case 'year':
        // 지난해
        previousRange.start = new Date(currentRange.start);
        previousRange.end = new Date(currentRange.end);
        previousRange.start.setFullYear(previousRange.start.getFullYear() - 1);
        previousRange.end.setFullYear(previousRange.end.getFullYear() - 1);
        break;
      case 'custom':
        // 작년 동일 기간
        const duration = currentRange.end.getTime() - currentRange.start.getTime();
        previousRange.start = new Date(currentRange.start);
        previousRange.end = new Date(currentRange.end);
        previousRange.start.setFullYear(previousRange.start.getFullYear() - 1);
        previousRange.end.setFullYear(previousRange.end.getFullYear() - 1);
        break;
    }
    
    // 과거 기간에 해당하는 활동 개수 계산 (work_date 기준)
    return activities.filter(activity => {
      return matchesDateRange(getAsDateCandidates(activity), previousRange);
    }).length;
  };

  // 과거 데이터 비교용 함수 (PC 활동용)
  const calculatePreviousPeriodPcData = (activities: Activity[], filter: DateFilterType): number => {
    // 현재 범위
    const currentRange = getDateRangeByFilter(filter);
    
    // 비교 범위 (과거 데이터)
    let previousRange = { start: new Date(), end: new Date() };
    
    switch (filter) {
      case 'today':
        // 지난주 같은 요일
        previousRange.start = new Date(currentRange.start);
        previousRange.end = new Date(currentRange.end);
        previousRange.start.setDate(previousRange.start.getDate() - 7);
        previousRange.end.setDate(previousRange.end.getDate() - 7);
        break;
      case 'week':
        // 지난주
        previousRange.start = new Date(currentRange.start);
        previousRange.end = new Date(currentRange.end);
        previousRange.start.setDate(previousRange.start.getDate() - 7);
        previousRange.end.setDate(previousRange.end.getDate() - 7);
        break;
      case 'month':
        // 지난달
        previousRange.start = new Date(currentRange.start);
        previousRange.end = new Date(currentRange.end);
        previousRange.start.setMonth(previousRange.start.getMonth() - 1);
        previousRange.end.setMonth(previousRange.end.getMonth() - 1);
        break;
      case 'year':
        // 지난해
        previousRange.start = new Date(currentRange.start);
        previousRange.end = new Date(currentRange.end);
        previousRange.start.setFullYear(previousRange.start.getFullYear() - 1);
        previousRange.end.setFullYear(previousRange.end.getFullYear() - 1);
        break;
      case 'custom':
        // 작년 동일 기간
        const duration = currentRange.end.getTime() - currentRange.start.getTime();
        previousRange.start = new Date(currentRange.start);
        previousRange.end = new Date(currentRange.end);
        previousRange.start.setFullYear(previousRange.start.getFullYear() - 1);
        previousRange.end.setFullYear(previousRange.end.getFullYear() - 1);
        break;
    }
    
    // 과거 기간에 해당하는 활동 개수 계산 (created_at 기준)
    return activities.filter(activity => {
      const activityDate = new Date(activity.created_at);
      return activityDate >= previousRange.start && activityDate <= previousRange.end;
    }).length;
  };
  
  // PC 자산 비교 (선택된 기간에 맞게 과거 데이터와 비교)
  const calculateAssetComparison = () => {
    // 현재 데이터는 전체 PC 자산 (이 예시에서는)
    const currentAssetCount = assets.length;
    
    // 과거 데이터는 1달 전 자산 수로 가정 (실제로는 DB에 더 정확한 데이터가 있어야 함)
    let previousAssetCount: number;
    
    switch (activeFilter) {
      case 'today':
        // 지난주 같은 요일
        previousAssetCount = Math.round(currentAssetCount * 0.98);
        break;
      case 'week':
        // 지난주
        previousAssetCount = Math.round(currentAssetCount * 0.97);
        break;
      case 'month':
        // 지난달
        previousAssetCount = Math.round(currentAssetCount * 0.95);
        break;
      case 'year':
        // 지난해
        previousAssetCount = Math.round(currentAssetCount * 0.85);
        break;
      case 'custom':
        // 작년 동일 기간
        previousAssetCount = Math.round(currentAssetCount * 0.9);
        break;
      default:
        previousAssetCount = Math.round(currentAssetCount * 0.95);
    }
    
    const diff = currentAssetCount - previousAssetCount;
    return {
      diff,
      diffText: `${Math.abs(diff)}대`,
      trendType: diff >= 0 ? 'up' : 'down'
    };
  };
  
  // 대여 자산 비교 (선택된 기간에 맞게 과거 데이터와 비교)
  const calculateRentComparison = () => {
    // 현재 대여 중인 자산 수
    const currentRentedCount = rentAssets.filter(asset => asset.is_rented).length;
    
    // 과거 대여 수 (실제로는 DB에 더 정확한 데이터가 있어야 함)
    let previousRentedCount: number;
    
    switch (activeFilter) {
      case 'today':
        // 지난주 같은 요일
        previousRentedCount = Math.round(currentRentedCount * 0.98);
        break;
      case 'week':
        // 지난주
        previousRentedCount = Math.round(currentRentedCount * 0.96);
        break;
      case 'month':
        // 지난달
        previousRentedCount = Math.round(currentRentedCount * 0.93);
        break;
      case 'year':
        // 지난해
        previousRentedCount = Math.round(currentRentedCount * 0.80);
        break;
      case 'custom':
        // 작년 동일 기간
        previousRentedCount = Math.round(currentRentedCount * 0.9);
        break;
      default:
        previousRentedCount = Math.round(currentRentedCount * 0.95);
    }
    
    const diff = currentRentedCount - previousRentedCount;
    return {
      currentCount: currentRentedCount,
      diff,
      diffText: `${Math.abs(diff)}대`,
      trendType: diff >= 0 ? 'up' : 'down'
    };
  };
  
  // 현재 기간의 PC 활동 이력 건수
  const currentPcActivitiesCount = pcActivities.filter(activity => {
    const dateRange = getDateRangeByFilter(activeFilter);
    const interval = { start: startOfDay(dateRange.start), end: endOfDay(dateRange.end) };
    return isWithinInterval(parseISO(activity.created_at), interval);
  }).length;
  
  // 과거 기간의 PC 활동 이력 건수
  const previousPcActivitiesCount = calculatePreviousPeriodPcData(pcActivities, activeFilter);
  
  // PC 활동 이력 증감률 및 트렌드 계산
  const pcActivitiesDiff = currentPcActivitiesCount - previousPcActivitiesCount;
  const pcActivitiesDiffText = `${Math.abs(pcActivitiesDiff)}건`;
  const pcActivitiesTrendType = pcActivitiesDiff >= 0 ? 'up' : 'down';
  
  // 현재 기간의 AS 요청 건수
  const currentAsActivitiesCount = asActivities.filter(activity =>
    matchesDateRange(getAsDateCandidates(activity), getDateRangeByFilter(activeFilter))
  ).length;
  
  // 과거 기간의 AS 요청 건수
  const previousAsActivitiesCount = calculatePreviousPeriodData(asActivities, activeFilter);
  
  // AS 요청 증감률 및 트렌드 계산
  const asActivitiesDiff = currentAsActivitiesCount - previousAsActivitiesCount;
  const asActivitiesDiffText = `${Math.abs(asActivitiesDiff)}건`;
  const asActivitiesTrendType = asActivitiesDiff >= 0 ? 'up' : 'down';
  
  // 자산 비교 결과 계산
  const assetComparison = calculateAssetComparison();
  
  // 대여 비교 결과 계산
  const rentComparison = calculateRentComparison();
  
  // 보안, 네트워크 전체 건수 계산 (filteredAsActivities 기준)
  const securityCount = asActivities.filter(a => a.work_type === '보안').length;
  const networkCount = asActivities.filter(a => a.work_type === '네트워크').length;
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 h-full">
      <StatCard
        title="전체 PC"
        value={assets.length}
        trend={assetComparison.diffText}
        trendType={assetComparison.trendType as 'up' | 'down' | 'neutral'}
        dateFilter={activeFilter}
        link="/private/pc-assets"
        icon={ComputerDesktopIcon}
        iconBg="bg-slate-800"
      />
      <StatCard
        title="장비이력"
        value={currentPcActivitiesCount}
        trend={pcActivitiesDiffText}
        trendType={pcActivitiesTrendType as 'up' | 'down' | 'neutral'}
        dateFilter={activeFilter}
        link="/private/pc-history"
        icon={ClipboardDocumentListIcon}
        iconBg="bg-slate-600"
      />
      <StatCard
        title="작업이력"
        value={currentAsActivitiesCount}
        trend={asActivitiesDiffText}
        trendType={asActivitiesTrendType as 'up' | 'down' | 'neutral'}
        dateFilter={activeFilter}
        link="/private/as-request"
        icon={WrenchScrewdriverIcon}
        iconBg="bg-slate-700"
      />
      <StatCard
        title="현재 대여 중"
        value={rentComparison.currentCount}
        trend={rentComparison.diffText}
        trendType={rentComparison.trendType as 'up' | 'down' | 'neutral'}
        dateFilter={activeFilter}
        link="/private/rent"
        icon={DeviceTabletIcon}
        iconBg="bg-teal-700"
      />
    </div>
  );
}
