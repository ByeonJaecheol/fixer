export interface IDropDownOption {
    value: string;
    label: string;
}
export interface ICheckBoxOption {
    value: boolean;
    label: string;
}
export const PC_TYPE_OPTIONS: IDropDownOption[] = [
    { value: '데스크탑', label: '데스크탑' },
    { value: '노트북', label: '노트북' },
    { value: '기타', label: '기타' },
  ];

export const PC_BRAND_OPTIONS: IDropDownOption[] = [
    { value: 'HP', label: 'HP' },
    { value: 'LG', label: 'LG' },
    { value: '삼성', label: '삼성' },
    { value: '기타', label: '기타' },
  ];

export const PC_STATUS_OPTIONS: IDropDownOption[] = [
    { value: '사용가능', label: '사용가능' },
    { value: '사용불가', label: '사용불가' },
  ];

export const PC_HP_DESKTOP_MODEL_OPTIONS: IDropDownOption[] = [
    { value: 'Z4G5', label: 'Z4G5' },
    { value: 'Z4G4', label: 'Z4G4' },
    { value: 'Z440', label: 'Z440' },
    { value: 'Z420', label: 'Z420' },
    { value: 'Z400', label: 'Z400' },
    { value: 'Z620', label: 'Z620' },
    { value: 'Z640', label: 'Z640' },
    { value: 'Z840', label: 'Z840' },
    { value: 'Z8G4', label: 'Z8G4' },
    { value: 'Z6G4', label: 'Z6G4' },
  ];
  
export const PC_HP_NOTEBOOK_MODEL_OPTIONS: IDropDownOption[] = [
      { value: 'G10', label: 'G10' },
      { value: 'G9', label: 'G9' },
      { value: 'G8', label: 'G8' },
      { value: 'G7', label: 'G7' },
      { value: 'G6', label: 'G6' },
      { value: 'G5', label: 'G5' },
      { value: 'G3ST', label: 'G3ST' },
      { value: 'G3', label: 'G3' },
      { value: 'G2', label: 'G2' },
      { value: 'G1', label: 'G1' },
    ];
export const PC_LG_DESKTOP_MODEL_OPTIONS: IDropDownOption[] = [
    { value: '없음', label: '없음' },
  ];


  export const PC_LG_NOTEBOOK_MODEL_OPTIONS: IDropDownOption[] = [
    { value: '15ZB970-GP50ML', label: '15ZB970-GP50ML' },
    { value: '15ZB970-GR50KN', label: '15ZB970-GR50KN' },
    { value: '15ZB970-GPHML', label: '15ZB970-GPHML' },
    { value: '15ZB995-GP50ML', label: '15ZB995-GP50ML' },
    { value: '15Z960M', label: '15Z960M' },
    { value: '15Z960G', label: '15Z960G' },
    { value: '15ZD970', label: '15ZD970' },
    { value: '15ZD95Q-GX56K', label: '15ZD95Q-GX56K' },
    { value: 'R570', label: 'R570' },
    { value: 'U460', label: 'U460' },
    { value: 'U560', label: 'U560' },
    { value: 'N450', label: 'N450' },
    { value: '15U530', label: '15U530' },
    { value: '15Z960', label: '15Z960' },
    { value: '15ZD960', label: '15ZD960' },
    
  ];
  
  export const PC_SAMSUNG_DESKTOP_MODEL_OPTIONS: IDropDownOption[] = [
    { value: 'DBP600', label: 'DBP600' },
    { value: 'DB400T2A', label: 'DB400T2A' },
    { value: 'DB400T3A', label: 'DB400T3A' },
  ];

  export const PC_SAMSUNG_NOTEBOOK_MODEL_OPTIONS: IDropDownOption[] = [
    { value: '없음', label: '없음' },
  ];

  export const PC_USAGE_TYPE_OPTIONS: IDropDownOption[] = [
    { value: '개인', label: '개인' },
    { value: '공용', label: '공용' },
    { value: '임대', label: '임대' },
  ];

  export const PC_AVAILABLE_TYPE_OPTIONS: IDropDownOption[] = [
    { value: '사용가능', label: '사용가능' },
    { value: '사용불가', label: '사용불가' },
  ];
  
  export const PC_LOCATION_TYPE_OPTIONS: IDropDownOption[] = [
    { value: '창고', label: '창고' },
    { value: '서버실', label: '서버실' },
  ];
  
  export const PC_INSTALL_TYPE_OPTIONS: IDropDownOption[] = [
    { value: '신규', label: '신규' },
    { value: '교체', label: '교체' },
    { value: '유지', label: '유지' },
  ];  

  export const PC_INSTALL_STATUS_OPTIONS: IDropDownOption[] = [
    { value: '새PC', label: '새PC' },
    { value: '재배치', label: '재배치' },
    
  ];  
  
