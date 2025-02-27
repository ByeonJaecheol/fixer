export default function InputTaskDetails({ taskDetails, setTaskDetails }: { taskDetails: string, setTaskDetails: (taskDetails: string) => void }) {
  return (
    <>
      {/* 작업내용 */}
        <div className="flex flex-col col-span-1 md:col-span-2">
          <h3 className="text-yellow-300">작업내용</h3>
          <textarea
            name="task_details"
            value={taskDetails}
            onChange={(e) => setTaskDetails(e.target.value)}
            rows={4}
            className="text-black rounded-md p-2 w-full"
          />
        </div>
    </>
  );
}
