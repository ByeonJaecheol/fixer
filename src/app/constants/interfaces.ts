export interface IPcAsset {
    asset_id: number;
    brand: string;
    first_stock_date: string; // YYYY-MM-DD 형식
    manufacture_date: string; // YYYY-MM
    model_name: string;
    pc_type: string;
    serial_number: string;
  }
  
 export interface IDB_ASSET_LOG_DATA {
    asset_id: number;
    created_at: string; // ISO 8601 형식
    created_by: string;
    detailed_description: string;
    employee_department: string;
    employee_name: string;
    employee_workspace: string;
    is_available: boolean;
    log_id: number;
    pc_assets: IPcAsset;
    requester: string;
    security_code: string;
    status: '사용가능' | '수리대기' | '사용불가' | '폐기';
    usage_type: string;
    work_date: string; // YYYY-MM-DD 형식
    work_type: string;
    location: string;
    install_type: string;
    install_status: string;
  }