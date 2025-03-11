import { tailwindDesign } from "@/design/tailwindDesign";
import CommonInputOnChange from "../common/input/CommonInputOnChange";

export default function InputSerial({ serial, setSerial, code, setCode }: { serial: string, setSerial: (serial: string) => void, code?: string, setCode?: (code: string) => void }) {
  return (
    <>
        {/* 제조 번호 */}
        <div className="flex flex-col">
          <h3 className={tailwindDesign.inputLabel}>제조 번호</h3>
          <CommonInputOnChange value={serial} setValue={setSerial} type="text" name="serial" />
        </div>

        {/* 코드 */}
        {code && setCode && (
          <div className="flex flex-col">
            <h3 className={tailwindDesign.inputLabel}>보안코드</h3>
            <CommonInputOnChange value={code} setValue={setCode} type="text" name="code" />
          </div>
        )}
    </>
  );
}
