import * as XLSX from 'xlsx';

// AS 관리 로그 데이터 타입 정의
export interface IAsManagementLog {
  log_id?: number;
  created_by?: string;
  work_date?: string;
  work_type?: string;
  category?: string;
  model_name?: string;
  employee_department?: string;
  employee_name?: string;
  question?: string;
  detail_description?: string;
  solution_detail?: string;
  detailed_category?: string;
  created_at?: string;
  updated_at?: string;
}

// 엑셀 데이터 타입 정의
interface ExcelAsLogData {
  '번호': number;
  'ID': string;
  '작성자': string;
  '작업일': string;
  '작업유형': string;
  '분류': string;
  '모델명': string;
  '부서': string;
  '사용자': string;
  '문의내용': string;
  '상세설명': string;
  '조치내용': string;
  '상세분류': string;
  '생성일': string;
  '수정일': string;
}

// AS 관리 로그 데이터를 엑셀로 내보내는 함수
export const exportAsLogsToExcel = (data: IAsManagementLog[], filename: string = 'as_request_data'): void => {
  const workbook = XLSX.utils.book_new();

  // 데이터를 월별로 그룹화
  const logsByMonth: { [key: string]: IAsManagementLog[] } = data.reduce((acc, log) => {
    let monthKey: string;
    if (log.work_date) {
      const date = new Date(log.work_date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      monthKey = `${year}년 ${month.toString().padStart(2, '0')}월`;
    } else {
      monthKey = '날짜 없음';
    }

    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(log);
    
    return acc;
  }, {} as { [key: string]: IAsManagementLog[] });

  // 월별 시트 생성 (최신 월부터 정렬, '날짜 없음'은 마지막으로)
  const sortedMonths = Object.keys(logsByMonth).sort((a, b) => {
    if (a === '날짜 없음') return 1;
    if (b === '날짜 없음') return -1;
    return b.localeCompare(a); // "YYYY년 MM월" 형식의 문자열을 내림차순 정렬
  });

  for (const monthKey of sortedMonths) {
    const monthData = logsByMonth[monthKey];
    
    // 데이터를 엑셀 형식에 맞게 변환
    const excelData: ExcelAsLogData[] = monthData.map((log, index) => ({
      '번호': index + 1,
      'ID': log.log_id?.toString() || '',
      '작성자': log.created_by ? log.created_by.split('@')[0] : '',
      '작업일': log.work_date ? new Date(log.work_date).toLocaleDateString('ko-KR') : '',
      '작업유형': log.work_type || '',
      '분류': log.category || '없음',
      '모델명': log.model_name || '',
      '부서': log.employee_department || '',
      '사용자': log.employee_name || '',
      '문의내용': log.question || '',
      '상세설명': log.detail_description || '',
      '조치내용': log.solution_detail || '',
      '상세분류': log.detailed_category || '',
      '생성일': log.created_at ? new Date(log.created_at).toLocaleString('ko-KR') : '',
      '수정일': log.updated_at ? new Date(log.updated_at).toLocaleString('ko-KR') : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // 컬럼 너비 설정
    const columnWidths = [
      { wch: 5 },   // 번호
      { wch: 8 },   // ID
      { wch: 12 },  // 작성자
      { wch: 12 },  // 작업일
      { wch: 10 },  // 작업유형
      { wch: 15 },  // 분류
      { wch: 15 },  // 모델명
      { wch: 12 },  // 부서
      { wch: 12 },  // 사용자
      { wch: 30 },  // 문의내용
      { wch: 30 },  // 상세설명
      { wch: 30 },  // 조치내용
      { wch: 15 },  // 상세분류
      { wch: 20 },  // 생성일
      { wch: 20 }   // 수정일
    ];
    worksheet['!cols'] = columnWidths;
    
    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, monthKey);
  }

  // 데이터가 없는 경우 빈 시트 생성
  if (workbook.SheetNames.length === 0) {
    const worksheet = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(workbook, worksheet, '데이터 없음');
  }

  // 파일 다운로드
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
};

// 일반적인 데이터를 엑셀로 내보내는 함수
export const exportToExcel = (data: Record<string, any>[], filename: string, sheetName: string = 'Sheet1'): void => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 컬럼 너비 자동 조정
  if (data.length > 0) {
    const columnWidths = Object.keys(data[0]).map(key => ({ wch: Math.max(key.length, 15) }));
    worksheet['!cols'] = columnWidths;
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}; 