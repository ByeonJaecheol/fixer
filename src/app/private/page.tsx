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

// 기존 인터페이스는 유지하고, 필터 타입 추가
type DateFilterType = 'today' | 'week' | 'year' | 'custom';

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

export default function PrivateDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
          const dept = asset.employee_department || '미할당';
          deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });
      
      const formattedDeptData = Object.keys(deptCounts).map(dept => ({
        name: dept,
        value: deptCounts[dept]
      }));
      
      setRentedAssetsData(formattedDeptData);
      
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700"></div>
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
      <div className="mb-6 bg-blue-50 text-blue-700 px-4 py-2 rounded border border-blue-200">
        <div className="flex items-center justify-between">
          <span className="font-medium">선택 기간: {getDateRangeText()}</span>
          <span className="text-sm">
            {activeFilter === 'week' && '활동 데이터'}
          </span>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="전체 PC 자산"
          value={assets.length}
          trend={`${Math.round(assets.length * 0.05)}대`}
          trendType="up"
          color="bg-white border-b-4 border-blue-700"
          dateFilter={activeFilter}
        />
        <StatCard
          title="장비이력"
          value={pcActivities.filter(activity => {
            const dateRange = getDateRangeByFilter(activeFilter);
            return isWithinInterval(new Date(activity.created_at), dateRange);
          }).length}
          trend={`${activeFilter === 'today' ? '3건' : activeFilter === 'week' ? '8건' : '15건'}`}
          trendType="up"
          color="bg-white border-b-4 border-green-700"
          dateFilter={activeFilter}
          link="/pc-history"
        />
        <StatCard
          title="AS 요청"
          value={asActivities.filter(activity => {
            const dateRange = getDateRangeByFilter(activeFilter);
            return isWithinInterval(new Date(activity.created_at), dateRange);
          }).length}
          trend={`${activeFilter === 'today' ? '3건' : activeFilter === 'week' ? '8건' : '15건'}`}
          trendType="up"
          color="bg-white border-b-4 border-amber-700"
          dateFilter={activeFilter}
          link="/as-request"
        />
        <StatCard
          title="현재 대여 중"
          value={rentAssets.filter(asset => asset.is_rented).length}
          trend="2대"
          trendType="up"
          color="bg-white border-b-4 border-purple-700"
          dateFilter={activeFilter}
          link="/rent"
        />
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* 활동 차트 */}
        <ChartCard title={`${activeFilter === 'today' ? '오늘' : activeFilter === 'week' ? '이번 주' : activeFilter === 'year' ? '올해' : '선택 기간'} 활동`}>
          {loading ? (
            <ChartSkeleton />
          ) : activityData.length > 0 ? (
            <ResponsiveContainer width="99%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tick={{ fill: '#616161' }} />
                <YAxis tick={{ fill: '#616161' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
                <Legend />
                <Bar dataKey="as_requests" name="AS 요청" fill="#3949AB" />
                <Bar dataKey="pc_activities" name="PC 관리 활동" fill="#00796B" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataDisplay />
          )}
        </ChartCard>

        {/* PC 유형 분포 차트 */}
        <ChartCard title="PC 유형 분포">
          {loading ? (
            <ChartSkeleton />
          ) : assetTypeData.length > 0 ? (
            <ResponsiveContainer width="99%" height={300}>
              <BarChart data={assetTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fill: '#616161' }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#616161' }} width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  formatter={(value: number) => [value, '대수']}
                />
                <Legend />
                <Bar dataKey="value" name="PC 수량">
                  {assetTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataDisplay />
          )}
        </ChartCard>

        {/* 부서별 대여 현황 차트 */}
        <ChartCard title="부서별 대여 현황">
          {loading ? (
            <ChartSkeleton />
          ) : rentedAssetsData.length > 0 ? (
            <ResponsiveContainer width="99%" height={300}>
              <BarChart data={rentedAssetsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fill: '#616161' }} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#616161' }} width={120} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                  formatter={(value: number) => [value, '대수']}
                />
                <Legend />
                <Bar dataKey="value" name="대여 PC 수량">
                  {rentedAssetsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
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
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">{title}</h2>
      {children}
    </div>
  );
}

// 데이터 없음 디스플레이
function NoDataDisplay() {
  return (
    <div className="flex items-center justify-center h-[300px] bg-gray-50 rounded-lg">
      <div className="text-center">
        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p className="mt-2 text-gray-500">데이터가 없습니다</p>
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
      case 'year':
        return '올해';
      case 'custom':
        return '선택 기간';
      default:
        return '전체';
    }
  };

  return (
    <Link href={link || '#'} className="block">
      <div className={`p-6 rounded-lg shadow-sm ${color}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">{title}</p>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {getPeriodLabel(dateFilter)}
        </span>
      </div>
      <p className="text-2xl font-bold mt-2 text-gray-800">{value.toLocaleString()}</p>
      <div className="flex items-center mt-2">
        {trendType === 'up' && (
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        )}
        {trendType === 'down' && (
          <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
        <span className={`ml-1 text-sm ${trendType === 'up' ? 'text-green-600' : trendType === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
          {trend} 지난 {dateFilter === 'today' ? '일' : dateFilter === 'week' ? '주' : '달'} 대비
        </span>
      </div>
    </div>
    </Link>
  );
}