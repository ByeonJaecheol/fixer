export function formatToKoreanTime(inputDate: string, format: "date" | "month"): string {
    // 1. Date 객체로 변환 (기본적으로 UTC 기준)
    if(inputDate === null){
        return "-";
    }
    const date = new Date(inputDate);
  
    // 2. 한국 시간(KST, UTC+9)으로 변환
    date.setHours(date.getHours() + 9);
  
    // 3. 연도, 월, 일 추출
    const yy = String(date.getFullYear()).slice(2); // "25"
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // "03"
    const dd = String(date.getDate()).padStart(2, "0"); // "05"
  
    // 4. 출력 포맷 결정
    if (format === "date") {
      return `${yy}/${mm}/${dd}`; // "25년03월05일00시"
    } else if (format === "month") {
      return `${yy}/${mm}`; // "25년03월"
    }
  
    return ""; // 예외 처리 (올바른 format이 아닐 경우 빈 문자열 반환)
  }

  // detailed_description 30자 이상일 경우 30자 이후는 ... 처리
  export function truncateDescription(description: string|undefined,maxLength:number): string {
    if (!description) {
      return "-";
    }
    if (description.length <= maxLength) {
      return description;
    }
    return description.slice(0, maxLength) + "...";
  }
