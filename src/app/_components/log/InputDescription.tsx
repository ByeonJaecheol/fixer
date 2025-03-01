import { tailwindDesign } from "@/design/tailwindDesign";
import CommonTextArea from "../common/input/CommonTextArea";

export default function InputTaskDetails({ taskDetails, setTaskDetails }: { taskDetails: string, setTaskDetails: (taskDetails: string) => void }) {
  return (
    <>
      {/* 작업내용 */}
        <div className="flex flex-col col-span-1 md:col-span-2">
          <h3 className={tailwindDesign.inputLabel}>작업내용</h3>
          <CommonTextArea value={taskDetails} setValue={setTaskDetails} name="task_details" />
        </div>
    </>
  );
}
