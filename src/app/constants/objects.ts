export interface IDropDownOption {
    value: string;
    label: string;
}
export const PC_TYPE_OPTIONS: IDropDownOption[] = [
    { value: '데스크탑', label: '데스크탑' },
    { value: '노트북', label: '노트북' },
  ];

export const PC_BRAND_OPTIONS: IDropDownOption[] = [
    { value: 'HP', label: 'HP' },
    { value: 'LG', label: 'LG' },
  ];

export const PC_STATUS_OPTIONS: IDropDownOption[] = [
    { value: '사용가능', label: '사용가능' },
    { value: '사용불가', label: '사용불가' },
    { value: '수리대기', label: '수리대기' },
    { value: '폐기', label: '폐기' },
  ];

export const PC_HP_DESKTOP_MODEL_OPTIONS: IDropDownOption[] = [
    { value: 'Z4G5', label: 'Z4G5' },
    { value: 'Z4G4', label: 'Z4G4' },
    { value: 'Z440', label: 'Z440' },
    { value: 'Z420', label: 'Z420' },
    { value: 'Z400', label: 'Z400' },
  ];

  export const PC_HP_NOTEBOOK_MODEL_OPTIONS: IDropDownOption[] = [
    { value: 'G10', label: 'G10' },
    { value: 'G8', label: 'G8' },
    { value: 'G5', label: 'G5' },
    { value: 'G3', label: 'G3' },
  ];

  export const PC_LG_NOTEBOOK_MODEL_OPTIONS: IDropDownOption[] = [
    { value: '15ZB970-GP50ML', label: '15ZB970-GP50ML' },
    { value: '15Z960M', label: '15Z960M' },
    { value: '15Z960G', label: '15Z960G' },
    { value: '15ZB970-GPHML', label: '15ZB970-GPHML' },
    { value: '15ZD970', label: '15ZD970' },
    { value: '15ZB995-GP50ML', label: '15ZB995-GP50ML' },
    { value: '15ZD95Q-GX56K', label: '15ZD95Q-GX56K' },
  ];
  

  export const PC_USAGE_TYPE_OPTIONS: IDropDownOption[] = [
    { value: '개인', label: '개인' },
    { value: '공용', label: '공용' },
    { value: '임대', label: '임대' },
  ];
  
  

