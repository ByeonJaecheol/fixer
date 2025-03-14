import { tailwindDesign } from "@/design/tailwindDesign";
import CommonInputOnChange from "../common/input/CommonInputOnChange";

export default function InputDateLegacy({ receivedDate, createdAt, setReceivedDate, setCreatedAt }: { receivedDate: string, createdAt: string, setReceivedDate: (date: string) => void, setCreatedAt: (date: string) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="flex flex-col">
        <h3 className={tailwindDesign.inputLabel}>입고일</h3>
        <CommonInputOnChange value={receivedDate} setValue={setReceivedDate} type="datetime-local" name="receivedDate"  />
    </div>

    <div className="flex flex-col">
        <h3 className={tailwindDesign.inputLabel}>작업일</h3>
        <CommonInputOnChange value={createdAt} setValue={setCreatedAt} type="datetime-local" name="created_at" />
    </div>
    </div>
   
  )
}

