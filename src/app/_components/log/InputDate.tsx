export default function InputDate({ receivedDate, createdAt, setReceivedDate, setCreatedAt }: { receivedDate: string, createdAt: string, setReceivedDate: (date: string) => void, setCreatedAt: (date: string) => void }) {
  return (
    <>
    <div className="flex flex-col">
        <h3 className="text-yellow-300">입고일</h3>
        <input
            type="datetime-local"
            name="receivedDate"
            value={receivedDate}
            onChange={(e) => setReceivedDate(e.target.value)}
            className="text-black rounded-md p-2 w-full"
        />
    </div>

    <div className="flex flex-col">
        <h3 className="text-yellow-300">작업일</h3>
        <input
            type="datetime-local"
            name="created_at"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            className="text-black rounded-md p-2 w-full"
        />
    </div>
    </>
   
  )
}

