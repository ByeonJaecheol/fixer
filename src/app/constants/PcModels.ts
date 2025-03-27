interface IPcModelInfo {
    value: string;
    label: string;
    manufacturer: 'HP' | 'LG' | 'SAMSUNG';
    type: 'DESKTOP' | 'NOTEBOOK';
  }
  
  export const ALL_PC_MODELS: IPcModelInfo[] = [
    // HP Desktop
    { value: 'Z4G5', label: 'Z4G5', manufacturer: 'HP', type: 'DESKTOP' },
    { value: 'Z4G4', label: 'Z4G4', manufacturer: 'HP', type: 'DESKTOP' },
    { value: 'Z440', label: 'Z440', manufacturer: 'HP', type: 'DESKTOP' },
    { value: 'Z420', label: 'Z420', manufacturer: 'HP', type: 'DESKTOP' },
    { value: 'Z400', label: 'Z400', manufacturer: 'HP', type: 'DESKTOP' },
    { value: 'Z620', label: 'Z620', manufacturer: 'HP', type: 'DESKTOP' },
    { value: 'Z640', label: 'Z640', manufacturer: 'HP', type: 'DESKTOP' },
  
    // HP Notebook
    { value: 'G10', label: 'G10', manufacturer: 'HP', type: 'NOTEBOOK' },
    { value: 'G8', label: 'G8', manufacturer: 'HP', type: 'NOTEBOOK' },
    { value: 'G5', label: 'G5', manufacturer: 'HP', type: 'NOTEBOOK' },
    { value: 'G3', label: 'G3', manufacturer: 'HP', type: 'NOTEBOOK' },
  
    // LG Notebook
    { value: '15ZB970-GP50ML', label: '15ZB970-GP50ML', manufacturer: 'LG', type: 'NOTEBOOK' },
    { value: '15Z960M', label: '15Z960M', manufacturer: 'LG', type: 'NOTEBOOK' },
    { value: '15Z960G', label: '15Z960G', manufacturer: 'LG', type: 'NOTEBOOK' },
    { value: '15ZB970-GPHML', label: '15ZB970-GPHML', manufacturer: 'LG', type: 'NOTEBOOK' },
    { value: '15ZD970', label: '15ZD970', manufacturer: 'LG', type: 'NOTEBOOK' },
    { value: '15ZB995-GP50ML', label: '15ZB995-GP50ML', manufacturer: 'LG', type: 'NOTEBOOK' },
    { value: '15ZD95Q-GX56K', label: '15ZD95Q-GX56K', manufacturer: 'LG', type: 'NOTEBOOK' },
  
    // Samsung Desktop
    { value: 'DB-P600', label: 'DB-P600', manufacturer: 'SAMSUNG', type: 'DESKTOP' },
    { value: 'DB-400T2A', label: 'DB-400T2A', manufacturer: 'SAMSUNG', type: 'DESKTOP' },
    { value: 'DB-400T3A', label: 'DB-400T3A', manufacturer: 'SAMSUNG', type: 'DESKTOP' },
  ];
  
  // 유틸리티 함수들
  export const pcModelUtils = {
    // 제조사별 모델 검색
    getModelsByManufacturer: (manufacturer: 'HP' | 'LG' | 'SAMSUNG') => {
      return ALL_PC_MODELS.filter(model => model.manufacturer === manufacturer);
    },
  
    // 타입별 모델 검색
    getModelsByType: (type: 'DESKTOP' | 'NOTEBOOK') => {
      return ALL_PC_MODELS.filter(model => model.type === type);
    },
  
    // 제조사와 타입으로 모델 검색
    getModelsByManufacturerAndType: (manufacturer: 'HP' | 'LG' | 'SAMSUNG', type: 'DESKTOP' | 'NOTEBOOK') => {
      return ALL_PC_MODELS.filter(
        model => model.manufacturer === manufacturer && model.type === type
      );
    },
  
    // 모델명으로 검색
    searchModelsByName: (searchTerm: string) => {
      const term = searchTerm.toLowerCase();
      return ALL_PC_MODELS.filter(
        model => model.label.toLowerCase().includes(term)
      );
    },
  
    // 특정 모델의 상세 정보 조회
    getModelInfo: (modelName: string) => {
      return ALL_PC_MODELS.find(model => model.value === modelName);
    },
  
    // 드롭다운용 옵션 형식으로 변환
    toDropdownOptions: (models: IPcModelInfo[]) => {
      return models.map(({ value, label }) => ({ value, label }));
    }
  };
  
  // 사용 예시:
  /*
  // 모든 HP 모델 가져오기
  const hpModels = pcModelUtils.getModelsByManufacturer('HP');
  
  // 모든 노트북 모델 가져오기
  const notebooks = pcModelUtils.getModelsByType('NOTEBOOK');
  
  // HP 데스크톱 모델만 가져오기
  const hpDesktops = pcModelUtils.getModelsByManufacturerAndType('HP', 'DESKTOP');
  
  // 모델명 검색
  const searchResults = pcModelUtils.searchModelsByName('Z4');
  
  // 드롭다운용 옵션으로 변환
  const dropdownOptions = pcModelUtils.toDropdownOptions(hpModels);
  */