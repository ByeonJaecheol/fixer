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

interface IPcAsset {
    id: number;
    brand: string;
    model_name: string;
    serial_number: string;
    pc_type: string;
    first_stock_date: string;
    manufacture_date: string;
    status: string;
    is_available: boolean;
    usage_count: number;
    usage_type: string;
    pc_management_log: {
      id: number;
      work_type: string;
      work_status: string;
      work_description: string;
      work_date: string;
      created_by: string;
    }[];
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
    relations = [], // 새로운 파라미터 추가
    match, 
    order, 
    limit 
  }: SelectWithRelationsOptions) {
    try {
      console.log(`Selecting data from ${table} with relations`);
      
      // 관계 테이블의 컬럼들을 포함한 select 쿼리 구성
      let selectQuery = columns;
      
      // relations 배열을 사용하여 관계 테이블 데이터 요청
      // 예: [{ table: 'profiles', columns: 'name,avatar_url' }]
      if (relations.length > 0) {
        relations.forEach(relation => {
          selectQuery += `,${relation.table}(${relation.columns || '*'})`;
        });
      }
      
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
        // console.error(`Error selecting from ${table} with relations:`, error);
        return { success: false, error, data: null };
      }
      
      return { success: true, error: null, data };
    } catch (error) {
    //   console.error(`Exception selecting from ${table} with relations:`, error);
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