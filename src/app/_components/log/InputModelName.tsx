import { tailwindDesign } from "@/design/tailwindDesign";
import CommonRadio from "../common/input/CommonRadio";

export default function InputModelName({ modelName, setModelName }: { modelName: string, setModelName: (modelName: string) => void }) {
  return (
    <>
         {/* 모델명 - 반응형 그리드 수정 */}
         <div className="flex flex-col col-span-1 md:col-span-2">
          <h3 className={tailwindDesign.inputLabel}>모델명</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {["Z4G4", "Z4G5", "Z440", "Z420", "G3", "G5", "G8", "G10"].map(
              (model) => (
                <div key={model} className="flex items-center gap-1">
                  <CommonRadio model={model} setModelName={setModelName} modelName={modelName} />
                </div>
              )
            )}
          </div>
        </div>
    </>
  );
}
