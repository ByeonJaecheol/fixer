'use client'
import CommonInputOnChange from "@/app/_components/common/input/CommonInputOnChange";
import LegacyInputDate from "@/app/_components/log/InputDate";
import InputModelName from "@/app/_components/log/InputModelName";
import InputPcType from "@/app/_components/log/InputPcType";
import InputSerial from "@/app/_components/log/InputSerial";
import { tailwindDesign } from "@/design/tailwindDesign";
import { supabase } from "@/app/utils/supabase";
import { useState } from "react";

interface InputPcInProps {
  pcHistory: PcHistory[];
}
export interface PcHistory {
  id: number;
  created_at: string;
  received_at: string;
  pc_type: string;
  pc_model: string;
}

export default function InputPcIn() {
  const [receivedDate, setReceivedDate] = useState<string>("");
  const [createdAt, setCreatedAt] = useState<string>("");
  const [serial, setSerial] = useState<string>("");
  const [modelName, setModelName] = useState<string>("");
  const [pcType, setPcType] = useState<string>("");
  const [code, setCode] = useState<string>("");


  
  const insertPcAsset = async () => {
    console.log("insertPcAsset")
    try {
      const { data, error } = await supabase
        .from("pc_assets")
        .insert({ brand: "HP", model_name: "Z4G5", serial_number: "DE5D353111", pc_type: "데스크탑", status: "new", 
          usage_type: "개인", security_code: "A30033", is_available: true, usage_count: 0 })
          if(error){
            console.log(error.details,"error출력")
            return error;
          }
          return data;
    } catch (error) {
      console.error("작업 내역을 불러오는 중 오류 발생:", error);
    } finally {
      console.log("fetchWorkHistory")
    }
  };

  const insertPcManagementLog = async () => {
    console.log("insertPcManagementLog")
    const result = await insertPcAsset();
    console.log(result,"result")
    if(result){
      try {
        const { data, error } = await supabase
          .from("pc_management_log")
          .insert({ asset_id: 1, work_type: "입고", work_date: "2025-03-04", requester: "홍길동", 
            security_code: "A4003", detailed_description: "입고 처리", created_by: "홍길동", created_at: "2025-03-04" })
          if(error){
            console.log(error,"error")
          }
          return data;
      } catch (error) {
        console.error("작업 내역을 불러오는 중 오류 발생:", error);
      } finally {
        console.log("insertPcManagementLog")
      }

    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 sm:px-8">
        <button onClick={insertPcAsset}>insertPcAsset test</button>
        <button onClick={insertPcManagementLog}>insertPcManagementLog test</button>
        <div className="flex flex-col">
          <h3 className={tailwindDesign.inputLabel}>입고일</h3>
          <CommonInputOnChange value={receivedDate} setValue={setReceivedDate} type="datetime-local" name="receivedDate"  />
        </div>

        <LegacyInputDate
          receivedDate={receivedDate}
          createdAt={createdAt}
          setReceivedDate={setReceivedDate}
          setCreatedAt={setCreatedAt}
        />
        <InputSerial
          serial={serial}
          setSerial={setSerial}
          code={code}
          setCode={setCode}
        />
        <InputPcType
          pcType={pcType}
          setPcType={setPcType}
        />
        <InputModelName
          modelName={modelName}
          setModelName={setModelName}
          pcType={pcType}
        />
      </div>
    </>
  );
}

