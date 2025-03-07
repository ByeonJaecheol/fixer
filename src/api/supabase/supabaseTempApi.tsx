import SupabaseService from "./supabaseApi";

export const getPcManagementLog = async (tableName: string,relationTableName: string, workType: string, orderColumn: string, ascending: boolean) : Promise<any> => {
    const supabaseService = SupabaseService.getInstance();
    const { success, error, data } = await supabaseService.selectWithRelations({
      table: tableName,
      columns: '*',
      relations: [
        { 
          table: relationTableName,
          columns: '*'  // 필요한 컬럼만 지정할 수도 있습니다 (예: 'asset_id,name,model')
        }
      ],
      match: { work_type: workType },
      // 필요에 따라 추가 조건 설정
      // match: { some_column: 'some_value' }
      order: { column: orderColumn, ascending: ascending },
    });
    if (success) {
      return data;
    } else {
      console.error('Error fetching pc_management_log:', error);
      return [];
    }
  }
