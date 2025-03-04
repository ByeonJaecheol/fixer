'use client'
import InputDate from "@/app/_components/log/InputDate";
import InputModelName from "@/app/_components/log/InputModelName";
import InputPcType from "@/app/_components/log/InputPcType";
import InputSerial from "@/app/_components/log/InputSerial";
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 sm:px-8">
        <InputDate
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

