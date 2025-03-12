// supabaseService.ts
import { createClient } from '@supabase/supabase-js';

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
  usage_count: number;
}

export interface IAssetLog {
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
}

export default SupabaseService;