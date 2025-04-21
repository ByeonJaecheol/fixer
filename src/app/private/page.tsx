'use client';

import { useEffect, useState } from 'react';
import { format, parseISO, subDays, startOfWeek, startOfYear, isWithinInterval, addDays, endOfWeek, endOfYear } from 'date-fns';
import { ko } from 'date-fns/locale';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { supabase } from "@/utils/supabase";
import Link from 'next/link';
import { RingLoader } from 'react-spinners';
import RecentSchedules from './_components/RecentSchedules';

// 기존 인터페이스는 유지하고, 필터 타입 추가
type DateFilterType = 'today' | 'week' | 'month' | 'year' | 'custom';

interface DateFilterOption {
  id: DateFilterType;
  label: string;
}

interface Asset {
  id: string;
  status: string;
  pc_type: string;
  created_at: string;
  [key: string]: any;
}

interface RentAsset {
  id: string;
  employee_department: string;
  is_rented: boolean;
  created_at: string;
  [key: string]: any;
}

interface Activity {
  id: string;
  created_at: string;
  [key: string]: any;
}

// 차트 데이터 타입들은 기존 코드 유지
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

export default function PrivateDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 최근 일정 상태
  const [recentSchedules, setRecentSchedules] = useState<any[]>([]);
  
  // 원시 데이터 상태
  const [assets, setAssets] = useState<Asset[]>([]);
  const [rentAssets, setRentAssets] = useState<RentAsset[]>([]);
  const [asActivities, setAsActivities] = useState<Activity[]>([]);
  const [pcActivities, setPcActivities] = useState<Activity[]>([]);
  
  // 계산된 데이터 상태
  const [assetStatusData, setAssetStatusData] = useState<AssetStatusCount[]>([]);
  const [activityData, setActivityData] = useState<DailyActivityCount[]>([]);
  const [assetTypeData, setAssetTypeData] = useState<ChartData[]>([]);
  const [rentedAssetsData, setRentedAssetsData] = useState<ChartData[]>([]);
  
  // 새로운 상태 추가
  const [workTypeStats, setWorkTypeStats] = useState<WorkTypeStats[]>([]);
  const [swCategoryStats, setSwCategoryStats] = useState<SwCategoryStats[]>([]);
  
  // 필터 상태 추가
  const [activeFilter, setActiveFilter] = useState<DateFilterType>('week');
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
    const today = new Date();
    
    switch (filter) {
      case 'today':
        return {
          start: new Date(today.setHours(0, 0, 0, 0)),
          end: new Date(today.setHours(23, 59, 59, 999))
        };
      case 'week':
        return {
          start: startOfWeek(today, { weekStartsOn: 1 }), // 월요일 시작
          end: endOfWeek(today, { weekStartsOn: 1 })
        };
      case 'month':
        return {
          start: new Date(today.getFullYear(), today.getMonth(), 1),
          end: new Date(today.getFullYear(), today.getMonth() + 1, 0)
        };
      case 'year':
        return {
          start: startOfYear(today),
          end: endOfYear(today)
        };
      case 'custom':
        return {
          start: parseISO(customDateRange.start),
          end: parseISO(customDateRange.end)
        };
      default:
        return {
          start: startOfWeek(today, { weekStartsOn: 1 }),
          end: endOfWeek(today, { weekStartsOn: 1 })
        };
    }
  };

  // 필터에 따른 데이터 필터링 함수
  const filterDataByDateRange = <T extends { created_at: string }>(
    data: T[],
    dateRange: { start: Date, end: Date }
  ): T[] => {
    return data.filter(item => {
      const itemDate = new Date(item.created_at);
      return isWithinInterval(itemDate, dateRange);
    });
  };

  // 원시 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. PC 자산 데이터 가져오기
        const { data: assetsData, error: assetsError } = await supabase
          .from('pc_assets')
          .select('*');
        
        if (assetsError) throw new Error('PC 자산 데이터를 불러올 수 없습니다: ' + assetsError.message);
        
        // 2. 렌트 자산 데이터 가져오기
        const { data: rentAssetsData, error: rentAssetsError } = await supabase
          .from('rent_assets')
          .select('*');
        
        if (rentAssetsError) throw new Error('렌트 자산 데이터를 불러올 수 없습니다: ' + rentAssetsError.message);
        
        // 3. AS 활동 로그 가져오기
        // 일단 1년치 데이터를 가져와서 클라이언트에서 필터링
        const oneYearAgo = format(subDays(new Date(), 365), 'yyyy-MM-dd');
        const { data: asActivitiesData, error: asActivitiesError } = await supabase
          .from('as_management_log')
          .select('*')
          .gte('created_at', oneYearAgo);
        
        if (asActivitiesError) throw new Error('AS 활동 데이터를 불러올 수 없습니다: ' + asActivitiesError.message);
        
        // 4. PC 활동 로그 가져오기
        const { data: pcActivitiesData, error: pcActivitiesError } = await supabase
          .from('pc_management_log')
          .select('*')
          .gte('created_at', oneYearAgo);
        
        if (pcActivitiesError) throw new Error('PC 활동 데이터를 불러올 수 없습니다: ' + pcActivitiesError.message);
        
        // 원시 데이터 설정
        setAssets(assetsData || []);
        setRentAssets(rentAssetsData || []);
        setAsActivities(asActivitiesData || []);
        setPcActivities(pcActivitiesData || []);
        
        console.log('Data loaded:', {
          assets: assetsData?.length || 0,
          rentAssets: rentAssetsData?.length || 0,
          asActivities: asActivitiesData?.length || 0,
          pcActivities: pcActivitiesData?.length || 0
        });
      } catch (error) {
        console.error('데이터 불러오기 오류:', error);
        setError(error instanceof Error ? error.message : '데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchRecentSchedules = async () => {
      try {
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        setRecentSchedules(data || []);
      } catch (error) {
        console.error('최근 일정을 불러오는 중 오류 발생:', error);
      } finally {
        setLoading(false);
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
      const filteredAsActivities = filterDataByDateRange(asActivities, dateRange);
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
        const date = format(new Date(activity.created_at), 'yyyy-MM-dd');
        if (activityByDate[date]) {
          activityByDate[date].as_requests++;
        }
      });
      
      // PC 활동 집계
      filteredPcActivities.forEach(activity => {
        const date = format(new Date(activity.created_at), 'yyyy-MM-dd');
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
        '장비관리': 0,
        '기타': 0
      };
      
      // S/W 카테고리별 통계
      const swCategoryCounts: Record<string, number> = {
        '보안': 0,
        '프로그램': 0,
        'OS': 0,
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
      
      // 작업 유형 통계 데이터 포맷
      const formattedWorkTypeStats = Object.entries(workTypeCounts).map(([type, count]) => ({
        type,
        count,
        color: 
          type === 'H/W' ? '#1976D2' :
          type === 'S/W' ? '#388E3C' :
          type === '네트워크' ? '#F57C00' :
          type === '장비관리' ? '#7B1FA2' :
          '#607D8B'
      }));
      
      // S/W 카테고리 통계 데이터 포맷
      const formattedSwCategoryStats = Object.entries(swCategoryCounts).map(([category, count]) => ({
        category,
        count,
        color: 
          category === '보안' ? '#D32F2F' :
          category === '프로그램' ? '#388E3C' :
          category === 'OS' ? '#1976D2' :
          '#F57C00'
      }));
      
      setWorkTypeStats(formattedWorkTypeStats);
      setSwCategoryStats(formattedSwCategoryStats);
      
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
        <RingLoader  speedMultiplier={1.5} color="#982cd6" />
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

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50">
      <div className="mb-6 flex items-center justify-between">
        {/* 최근 등록된 일정 리스트 5개 표시 */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">자산 관리 대시보드</h1>
          <p className="text-gray-600 mt-1">PC 자산 현황 및 관리 통계</p>
        </div>
        
        {/* 날짜 필터 컨트롤 */}
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500 mr-2">기간:</div>
          <div className="inline-flex rounded-md shadow-sm">
            {filterOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveFilter(option.id)}
                className={`px-4 py-2 text-sm font-medium ${
                  activeFilter === option.id
                    ? 'bg-blue-700 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } ${
                  option.id === filterOptions[0].id ? 'rounded-l-md' : ''
                } ${
                  option.id === filterOptions[filterOptions.length - 1].id ? 'rounded-r-md' : ''
                } border border-gray-300`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          {/* 커스텀 기간 선택 */}
          {activeFilter === 'custom' && (
            <div className="flex items-center ml-2 space-x-2">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
              <span className="text-gray-500">~</span>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* 선택된 날짜 범위 표시 */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-3 rounded-lg border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-medium flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {getDateRangeText()}
          </span>
          <span className="text-sm bg-blue-100 px-2 py-1 rounded-full text-blue-800 font-medium">
            {activeFilter === 'week' ? '주간 데이터' : activeFilter === 'today' ? '오늘 데이터' : activeFilter === 'month' ? '월간 데이터' : activeFilter === 'year' ? '연간 데이터' : '커스텀 기간'}
          </span>
        </div>
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
        <ChartCard title={`${activeFilter === 'today' ? '오늘' : activeFilter === 'week' ? '이번 주' : activeFilter === 'month' ? '이번달' : activeFilter === 'year' ? '올해' : '선택 기간'} 활동`} theme="blue">
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
                <Bar dataKey="as_requests" name="작업이력" fill="#3949AB" />
                <Bar dataKey="pc_activities" name="장비이력" fill="#00796B" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataDisplay />
          )}
        </ChartCard>

          {/* 작업 유형별 통계 차트 */}
          <ChartCard title="작업 유형별 통계" theme="amber">
          {loading ? (
            <ChartSkeleton />
          ) : workTypeStats.length > 0 ? (
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={workTypeStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={55}
                  dataKey="count"
                  nameKey="type"
                  label={({ name, percent }) => 
                    percent > 0.01 ? `${name}: ${(percent * 100).toFixed(0)}%` : null
                  }
                >
                  {workTypeStats.map((entry) => (
                    <Cell key={`cell-${entry.type}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  formatter={(value: number) => [`${value}건`, '처리 건수']}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoDataDisplay />
          )}
        </ChartCard>
        
        {/* S/W 카테고리별 통계 차트 */}
        <ChartCard title="S/W 카테고리별 통계" theme="rose">
          {loading ? (
            <ChartSkeleton />
          ) : swCategoryStats.length > 0 ? (
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={swCategoryStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fill: '#616161', fontSize: 11 }} />
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
                </Bar>
        </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataDisplay />
          )}
        </ChartCard>
        
          
        {/* PC 유형 분포 차트 */}
        <ChartCard title="PC 유형 분포" theme="green">
          {loading ? (
            <ChartSkeleton />
          ) : assetTypeData.length > 0 ? (
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={assetTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={50}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {assetTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`#0B815A${90 - index * 10}`} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  formatter={(value: number) => [value, '대수']}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoDataDisplay />
          )}
        </ChartCard>

        {/* 임대PC 대여 현황 차트 */}
        <ChartCard title="임대PC 대여 현황" theme="purple">
          {loading ? (
            <ChartSkeleton />
          ) : rentedAssetsData.length > 0 ? (
            <ResponsiveContainer width="99%" height="100%">
              <PieChart>
                <Pie
                  data={rentedAssetsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={50}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {rentedAssetsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`#7B1FA2${90 - index * 10}`} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  formatter={(value: number) => [value, '대수']}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoDataDisplay />
          )}
        </ChartCard>

      
      </div>
    </div>
  );
}

// 차트 카드 컴포넌트
function ChartCard({ title, children, theme = 'blue' }: { title: string; children: React.ReactNode; theme?: 'blue' | 'green' | 'amber' | 'purple' | 'rose' | 'cyan' }) {
  // 테마별 스타일 매핑
  const themeStyles = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    amber: 'border-amber-200 bg-amber-50', 
    purple: 'border-purple-200 bg-purple-50',
    rose: 'border-rose-200 bg-rose-50',
    cyan: 'border-cyan-200 bg-cyan-50'
  };

  // 테마별 헤더 스타일
  const headerStyles = {
    blue: 'text-blue-800',
    green: 'text-green-800',
    amber: 'text-amber-800',
    purple: 'text-purple-800',
    rose: 'text-rose-800',
    cyan: 'text-cyan-800'
  };

  return (
    <div className={`bg-white p-3 sm:p-4 rounded-lg shadow-sm border ${themeStyles[theme]}`}>
      <h2 className={`text-sm sm:text-base font-semibold ${headerStyles[theme]} mb-2 truncate`}>{title}</h2>
      <div className="h-[220px] sm:h-[250px] md:h-[280px]">
        {children}
      </div>
    </div>
  );
}

// 데이터 없음 디스플레이
function NoDataDisplay() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
      <div className="text-center">
        <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="mt-2 text-xs text-gray-500">데이터가 없습니다</p>
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
  color: string;
  dateFilter: DateFilterType;
  link?: string;
}

function StatCard({ title, value, trend, trendType, color, dateFilter, link }: StatCardProps) {
  // 필터에 따른 레이블 생성
  const getPeriodLabel = (filter: DateFilterType): string => {
    switch (filter) {
      case 'today':
        return '오늘';
      case 'week':
        return '이번 주';
      case 'month':
        return '이번달';
      case 'year':
        return '올해';
      case 'custom':
        return '선택 기간';
      default:
        return '전체';
    }
  };

  const cardContent = (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-opacity-80 bg-blue-100 text-blue-800">
          {getPeriodLabel(dateFilter)}
        </span>
      </div>
      <p className="text-3xl font-bold mb-3 text-gray-800">{value.toLocaleString()}</p>
      <div className="flex items-center mt-2 bg-gray-50 bg-opacity-70 rounded-lg p-2">
        {trendType === 'up' && (
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )}
        {trendType === 'down' && (
          <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
          </svg>
        )}
        <span className={`ml-2 text-sm font-medium ${trendType === 'up' ? 'text-green-700' : trendType === 'down' ? 'text-red-700' : 'text-gray-600'}`}>
          {trend} 지난 {dateFilter === 'today' ? '일' : dateFilter === 'week' ? '주' : '달'} 대비
        </span>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link href={link} className="block h-full hover:opacity-95 transition-opacity duration-300">
        {cardContent}
      </Link>
    );
  }
  
  return <div className="h-full">{cardContent}</div>;
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
  asActivities: Activity[]; 
  rentAssets: RentAsset[]; 
  activeFilter: DateFilterType;
  getDateRangeByFilter: (filter: DateFilterType) => { start: Date, end: Date };
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
        <div className="p-5 h-full border-b-4 border-blue-600 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600 opacity-10 rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="absolute -left-3 -top-3 w-10 h-10 flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <StatCard
            title="전체 PC 자산"
            value={assets.length}
            trend={`${Math.round(assets.length * 0.05)}대`}
            trendType="up"
            color="bg-transparent"
            dateFilter={activeFilter}
          />
        </div>
      </div>
      <div className="bg-gradient-to-br from-white to-green-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
        <div className="p-5 h-full border-b-4 border-green-600 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-600 opacity-10 rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="absolute -left-3 -top-3 w-10 h-10 flex items-center justify-center rounded-lg bg-green-600 text-white shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
          <StatCard
            title="장비이력"
            value={pcActivities.filter(activity => {
              const dateRange = getDateRangeByFilter(activeFilter);
              return isWithinInterval(new Date(activity.created_at), dateRange);
            }).length}
            trend={`${activeFilter === 'today' ? '3건' : activeFilter === 'week' ? '8건' : '15건'}`}
            trendType="up"
            color="bg-transparent"
            dateFilter={activeFilter}
            link="/private/pc-history"
          />
        </div>
      </div>
      <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
        <div className="p-5 h-full border-b-4 border-amber-600 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-600 opacity-10 rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="absolute -left-3 -top-3 w-10 h-10 flex items-center justify-center rounded-lg bg-amber-600 text-white shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
          </div>
          <StatCard
            title="AS 요청"
            value={asActivities.filter(activity => {
              const dateRange = getDateRangeByFilter(activeFilter);
              return isWithinInterval(new Date(activity.created_at), dateRange);
            }).length}
            trend={`${activeFilter === 'today' ? '3건' : activeFilter === 'week' ? '8건' : '15건'}`}
            trendType="up"
            color="bg-transparent"
            dateFilter={activeFilter}
            link="/private/as-request"
          />
        </div>
      </div>
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
        <div className="p-5 h-full border-b-4 border-purple-600 relative">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-600 opacity-10 rounded-full -mr-6 -mt-6 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="absolute -left-3 -top-3 w-10 h-10 flex items-center justify-center rounded-lg bg-purple-600 text-white shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <StatCard
            title="현재 대여 중"
            value={rentAssets.filter(asset => asset.is_rented).length}
            trend="2대"
            trendType="up"
            color="bg-transparent"
            dateFilter={activeFilter}
            link="/private/rent?type=사무용"
          />
        </div>
      </div>
    </div>
  );
}
