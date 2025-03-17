import SupabaseService, { IPcAsset } from "@/api/supabase/supabaseApi";

 // 제조 중복 체크 함수, 
export const checkSerialNumber = async (supabaseService:SupabaseService,serial?: string,) => {
    const { data: existingAsset, error: existingAssetError } = await supabaseService.select({
      table: 'pc_assets',
      columns: '*',
      match: { serial_number: serial },
      limit: 1
    });
    return existingAsset;
  }

// PC 자산 생성, 
export const createPcAsset = async (assetData : IPcAsset,isNew ?: boolean) => {
const supabaseService = SupabaseService.getInstance();
    const result = await supabaseService.insert({
        table: 'pc_assets',
        data: { 
        brand: assetData.brand, 
        model_name: assetData.model_name, 
        serial_number: assetData.serial_number, 
        pc_type: assetData.pc_type, 
        first_stock_date: assetData.first_stock_date,
        manufacture_date: assetData.manufacture_date,
        usage_count: isNew?0:1,
        }
    });
return result;
}
