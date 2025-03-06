'use client'
import { tailwindDesign } from "@/design/tailwindDesign";
import CommonRadio from "../common/input/CommonRadio";

export default function InputModelName({ modelName, setModelName, pcType, }: { modelName: string, setModelName: (modelName: string) => void, pcType: string }) {
  const modelNameList = {
    "데스크탑": [
      { brand: "HP", models: ["Z4G4", "Z4G5", "Z440", "Z420"] },
      { brand: "SAMSUNG", models: ["900X3C-TEST", "900X5-TEST"] },
    ],
    "노트북": [
      { brand: "HP", models: ["G3", "G5", "G8", "G10"] },
      { brand: "LG", models: ["15ZB970-GP50ML", "15Z960M", "15Z960G", "15ZB970-GPHML", "15ZD970", "15ZB995-GP50ML", "15ZD95Q-GX56K"] },
    ]
  };
   return (
  <div className="container mx-auto">
  {/* PC 타입별 브랜드 및 모델 목록 */}
  {pcType && (
    <div className="space-y-8">
    {modelNameList[pcType as keyof typeof modelNameList]?.map(({ brand, models }) => (
      <div key={brand} className="flex flex-row flex-wrap gap-2 border-b pb-2">
        <h2 className="text-md  font-bold  text-gray-800">[ {brand} ]</h2>
          {models.map((model,index) => (
            // <div 
            //   key={model} 
            //   className={`
            //     flex items-center justify-between p-3 rounded-lg
            //     ${modelName === model ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'}
            //     border hover:border-blue-500 transition-colors cursor-pointer
            //   `}
            // >
            //    <span className="text-sm font-medium text-gray-700">{model}</span> 
               <CommonRadio
                key={index}
                index={index}
                model={model}
                setModelName={setModelName}
                modelName={modelName}
              />  
            // </div>
          ))}
      </div>
    ))}
    </div>
  )}
</div>
   )
}
