export interface Asset {
    id: string;
    status: string;
    pc_type: string;
    created_at: string;
    [key: string]: any;
  }
  
 export interface RentAsset {
    id: string;
    employee_department: string;
    is_rented: boolean;
    created_at: string;
    [key: string]: any;
  }
  
  export interface Activity {
    id: string;
    created_at: string;
    [key: string]: any;
  }
  
  // 기존 인터페이스는 유지하고, 필터 타입 추가
export type DateFilterType = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface DateFilterOption {
  id: DateFilterType;
  label: string;
}


// 차트 데이터 타입들은 기존 코드 유지
export interface AssetStatusCount {
  status: string;
  count: number;
  color: string;
}

export interface DailyActivityCount {
  date: string;
  as_requests: number;
  pc_activities: number;
}

export interface ChartData {
  name: string;
  value: number;
}