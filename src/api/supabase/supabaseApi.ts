// supabaseService.ts
import { createClient } from '@supabase/supabase-js';
import { format, parseISO } from 'date-fns';

interface InsertOptions {
  table: string;
  data: any;
  returnData?: boolean;
}

interface UpdateOptions {
  table: string;
  data: any;
  match: any;
  returnData?: boolean;
}

interface SelectOptions {
  table: string;
  columns?: string;
  match?: any;
  order?: { column: string; ascending?: boolean };
  limit?: number;
}

interface SelectWithRelationsOptions {
  table: string;
  columns?: string;
  relations?: { table: string; columns?: string }[];
  match?: any;
  order?: { column: string; ascending?: boolean };
  limit?: number;
}


interface DeleteOptions {
  table: string;
  match: any;
  returnData?: boolean;
}

export interface IPcAsset {
  asset_id: number;
  brand: string;
  first_stock_date: string;
  manufacture_date: string;
  model_name: string;
  pc_type: string;
  serial_number: string;
  security_code: string[];
  is_disposed: boolean;
}

export interface IRentAsset {
  id: number;
  is_rented: boolean;
  rent_type: string;
  asset_id : number;
  rent_name : string;
  host: string;
  rent_start_date: string;
  rent_end_date: string;
  return_date: string;
  rent_reason: string;
  employee_name: string;
  employee_department: string;
  employee_workspace: string;
  requester: string;
}
export interface IRentResultAsset {
  id: number;
  pc_assets: IPcAsset;
  is_rented : boolean;
  rent_type : string;
  rent_name : number;
  host : string;
  rent_start_date : string;
  rent_end_date : string;
  // 반납예정일
  return_date : string;
  // 대여사유
  rent_reason : string;
  employee_name : string;
  employee_department : string;
  employee_workspace : string;
  requester : string;
}
export interface IRentManagementLog {
  id: number;
  rent_id : number;
  rent_start_date : string;
  rent_end_date : string;
  // 반납예정일
  return_date : string;
  // 대여사유
  rent_reason : string;
  employee_name : string;
  employee_department : string;
  employee_workspace : string;
  rent_type : string;
  requester : string;
}

export interface IPcManagementLog {
  asset_id: number;
  created_at: string;
  created_by: string;
  detailed_description: string;
  employee_department: string | null;
  employee_name: string | null;
  employee_workspace: string | null;
  install_status: string | null;
  install_type: string | null;
  is_available: string;
  location: string;
  log_id: number;
  pc_assets: IPcAsset;
  requester: string | null;
  security_code: string | null;
  usage_type: string | null;
  work_date: string;
  work_type: string;
  is_new: boolean;
}
export interface IAsManagementLog {
  log_id : number
  work_type: string;
  work_date: string;
  detail_description: string;
  solution_detail : string
  created_by: string;
  created_at: string;
  employee_workspace : string;
  employee_department : string;
  employee_name : string;
  serial_number: string;
  security_code: string;
  new_security_code : string
  category : string
  detailed_category : string
  model_name : string
  question : string
}

export interface IImage {
  id: number;
  brand: string;
  model_name: string;
  win_version: string;
  base_description: string;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

export interface IImageInfo {
  id: number;
  image_id: number;
  version_name: string;
  work_date: string;
  work_type: string;
  office_version: string;
  detail_description: string;
  next_update: string;
  created_at: string;
  created_by: string;
}

export interface IImageInfoWithImage {
  id: number;
  image_id: number;
  version_name: string;
  work_date: string;
  work_type: string;
  office_version: string;
  detail_description: string;
  next_update: string;
  created_at: string;
  created_by: string;
  image: IImage;
}

export interface IWindowImageLog {
  id: number;
  created_at: string;
  created_by: string;
  model_name: string;
  work_date: string;
  work_type: string;
  win_version: string;
  office_version: string;
  detail_description: string;
  brand: string;
  next_update: string;
}

  // 조인 조건을 위한 타입 정의
interface JoinCondition {
  table: string;
  columns?: string;
  sourceColumn: string; // 원본 테이블의 컬럼 (예: asset_id)
  targetColumn: string; // 대상 테이블의 컬럼 (예: asset_id)
}

// 기존 SelectWithRelationsOptions 타입 확장
interface SelectWithRelationsOptions {
  table: string;
  columns?: string;
  relations?: Array<{
    table: string;
    columns?: string;
  }>;
  match?: any;
  order?: {
    column: string;
    ascending?: boolean;
  };
  limit?: number;
}

interface QueryParams {
  query: string;
  values?: any[];
}

interface QueryResponse {
  success: boolean;
  data: any[];
  error?: any;
}
  
class SupabaseService {
  private static instance: SupabaseService;
  private supabase: any;
  
  private constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  
  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }
  
  // 데이터 추가
  async insert({ table, data, returnData = true }: InsertOptions) {
    try {
      console.log(`Inserting data into ${table}`);
      const query = this.supabase.from(table).insert(data);
      
      if (returnData) {
        query.select();
      }
      
      const { data: result, error } = await query;
      
      if (error) {
        console.error(`Error inserting into ${table}:`, error);
        return { success: false, error, data: null };
      }
      
      return { success: true, error: null, data: result };
    } catch (error) {
      console.error(`Exception inserting into ${table}:`, error);
      return { success: false, error, data: null };
    }
  }
  // sql 실행
  async execute({ sql }: { sql: string }) {
    const { data, error } = await this.supabase.rpc('run_query', { query: sql });
    return { data, error };
  }

  // 데이터 조회
  async select({ table, columns = '*', match, order, limit }: SelectOptions) {
    try {
      console.log(`Selecting data from ${table}`);
      let query = this.supabase.from(table).select(columns);
      
      if (match) {
        query = query.match(match);
      }
      
      if (order) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error selecting from ${table}:`, error);
        return { success: false, error, data: null };
      }
      
      return { success: true, error: null, data };
    } catch (error) {
      console.error(`Exception selecting from ${table}:`, error);
      return { success: false, error, data: null };
    }
  }
// 관계 테이블 조회
async selectWithRelations({ 
  table, 
  columns = '*', 
  relations = [],
  match, 
  order, 
  limit,
  joinConditions = [] // 조인 조건 추가
}: SelectWithRelationsOptions & { joinConditions?: JoinCondition[] }) {
  try {
    console.log(`Selecting data from ${table} with relations`);
    
    // 기본 쿼리 설정
    let selectQuery = columns;
    
    // 단순 관계 테이블 (Supabase 자동 관계 사용)
    if (relations.length > 0 && joinConditions.length === 0) {
      relations.forEach(relation => {
        selectQuery += `,${relation.table}(${relation.columns || '*'})`;
      });
      
      let query = this.supabase.from(table).select(selectQuery);
      
      if (match) {
        query = query.match(match);
      }
      
      if (order) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        return { success: false, error, data: null };
      }
      
      return { success: true, error: null, data };
    } 
    // 명시적 조인 조건 사용 (더 복잡한 관계)
    else if (joinConditions.length > 0) {
      // 조인 쿼리를 위한 SQL 문 생성
      const joinQuery = joinConditions
        .map(join => {
          // 조인 테이블의 컬럼들 선택
          const joinColumns = join.columns 
            ? join.columns.split(',').map(col => `${join.table}.${col.trim()} as "${join.table}_${col.trim()}"`).join(', ')
            : `${join.table}.*`;
            
          return {
            joinSql: `LEFT JOIN ${join.table} ON ${table}.${join.sourceColumn} = ${join.table}.${join.targetColumn}`,
            selectColumns: joinColumns
          };
        });
      
      // 기본 테이블의 컬럼들
      let selectColumns = columns === '*' 
        ? `${table}.*` 
        : columns.split(',').map(col => `${table}.${col.trim()}`).join(', ');
      
      // 조인 테이블의 컬럼들 추가
      selectColumns += ', ' + joinQuery.map(j => j.selectColumns).join(', ');
      
      // SQL 쿼리 구성
      let sqlQuery = `
        SELECT ${selectColumns}
        FROM ${table}
        ${joinQuery.map(j => j.joinSql).join(' ')}
      `;
      
      // WHERE 절 추가
      if (match) {
        const conditions = Object.entries(match)
          .map(([key, value]) => `${table}.${key} = '${value}'`)
          .join(' AND ');
        
        sqlQuery += ` WHERE ${conditions}`;
      }
      
      // ORDER BY 절 추가
      if (order) {
        sqlQuery += ` ORDER BY ${table}.${order.column} ${order.ascending ? 'ASC' : 'DESC'}`;
      }
      
      // LIMIT 절 추가
      if (limit) {
        sqlQuery += ` LIMIT ${limit}`;
      }
      
      // 쿼리 실행
      const { data, error } = await this.supabase.rpc('run_query', { query: sqlQuery });
      
      if (error) {
        return { success: false, error, data: null };
      }
      
      return { success: true, error: null, data };
    }
    
    // 관계나 조인 조건이 없는 경우 기본 쿼리 수행
    let query = this.supabase.from(table).select(columns);
    
    if (match) {
      query = query.match(match);
    }
    
    if (order) {
      query = query.order(order.column, { ascending: order.ascending ?? true });
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      return { success: false, error, data: null };
    }
    
    return { success: true, error: null, data };
  } catch (error) {
    return { success: false, error, data: null };
  }
}


  
  // 데이터 업데이트
  async update({ table, data, match, returnData = true }: UpdateOptions) {
    try {
      console.log(`Updating data in ${table}`);
      const query = this.supabase.from(table).update(data).match(match);
      
      if (returnData) {
        query.select();
      }
      
      const { data: result, error } = await query;
      
      if (error) {
        console.error(`Error updating in ${table}:`, error);
        return { success: false, error, data: null };
      }
      
      return { success: true, error: null, data: result };
    } catch (error) {
      console.error(`Exception updating in ${table}:`, error);
      return { success: false, error, data: null };
    }
  }
  
  // 데이터 삭제
  async delete({ table, match, returnData = true }: DeleteOptions) {
    try {
      console.log(`Deleting data from ${table}`);
      const query = this.supabase.from(table).delete();
      
      if (match) {
        query.match(match);
      }
      
      if (returnData) {
        query.select();
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error deleting from ${table}:`, error);
        return { success: false, error, data: null };
      }
      
      return { success: true, error: null, data };
    } catch (error) {
      console.error(`Exception deleting from ${table}:`, error);
      return { success: false, error, data: null };
    }
  }
  
  // 트랜잭션 처리 (여러 작업 순차 실행)
  async transaction(operations: (() => Promise<any>)[]) {
    // Supabase는 네이티브 트랜잭션 지원이 제한적이므로, 순차 실행 방식으로 구현
    const results = [];
    
    for (const operation of operations) {
      try {
        const result = await operation();
        if (!result.success) {
          // 실패 시 중단하고 결과 반환
          return { success: false, results, error: result.error };
        }
        results.push(result);
      } catch (error) {
        return { success: false, results, error };
      }
    }
    
    return { success: true, results, error: null };
  }

  async query({ query, values = [] }: QueryParams): Promise<QueryResponse> {
    try {
      const { data, error } = await this.supabase.rpc('run_query', {
        query_text: query,
        query_params: values
      });

      if (error) {
        console.error('Query execution error:', error);
        return { success: false, data: [], error };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      console.error('Query execution error:', error);
      return { success: false, data: [], error };
    }
  }
}

export default SupabaseService;