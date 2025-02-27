export default function InputModelName({ modelName, setModelName }: { modelName: string, setModelName: (modelName: string) => void }) {
  return (
    <>
         {/* 모델명 - 반응형 그리드 수정 */}
         <div className="flex flex-col col-span-1 md:col-span-2">
          <h3 className="text-yellow-300">모델명</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {["Z4G4", "Z4G5", "Z440", "Z420", "G3", "G5", "G8", "G10"].map(
              (model) => (
                <div key={model} className="flex items-center gap-1">
                  <input
                    type="radio"
                    id={`model-${model}`}
                    name="model_name"
                    value={model}
                    checked={modelName === model}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor={`model-${model}`} className="text-white">
                    {model}
                  </label>
                </div>
              )
            )}
          </div>
        </div>
    </>
  );
}
