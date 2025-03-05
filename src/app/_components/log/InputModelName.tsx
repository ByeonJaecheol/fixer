import { tailwindDesign } from "@/design/tailwindDesign";
import CommonRadio from "../common/input/CommonRadio";

export default function InputModelName({ modelName, setModelName, pcType, }: { modelName: string, setModelName: (modelName: string) => void, pcType: string }) {
  const modelNameList = {
    "데스크탑": {
      "HP": ["Z4G4", "Z4G5", "Z440", "Z420", "G3", "G5", "G8", "G10"],
      "SAMSUNG": ["900X3C-TEST", "900X5-TEST"],
    },
    "노트북": {
      "HP": ["G3", "G5", "G8", "G10"],
      "LG": ["15ZD95N", "15ZD90N", "15ZD90N-G.ARF"],
    }
  } 
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* PC 타입별 브랜드 및 모델 목록 */}
      {/* <div className="space-y-8">
        {Object.entries(modelNameList[pcType as keyof typeof modelNameList]).map(([brand, models]) => (
          <div key={brand} className="border-b pb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">{brand}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {models.map((model) => (
                <div 
                  key={model} 
                  className={`
                    flex items-center justify-between p-3 rounded-lg
                    ${modelName === model ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'}
                    border hover:border-blue-500 transition-colors cursor-pointer
                  `}
                >
                  <span className="text-sm font-medium text-gray-700">{model}</span>
                  <CommonRadio
                    model={model}
                    setModelName={setModelName}
                    modelName={modelName}
                  />
                </div>
              ))}
            </div> */}
          {/* </div> */}
        {/* ))} */}
      {/* </div> */}
    </div>
  );
}
