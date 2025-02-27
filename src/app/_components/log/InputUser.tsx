export default function InputUser({ department, setDepartment, user, setUser, client, setClient, userInputRef, pcName, setPcName }: { department: string, setDepartment: (department: string) => void, user: string, setUser: (user: string) => void, client: string, setClient: (client: string) => void, userInputRef: React.RefObject<HTMLInputElement>, pcName: string, setPcName: (pcName: string) => void }) {
  return (
    <>
      {/* 부서 */}
      <div className="flex flex-col">
      <h3 className="text-yellow-300">부서</h3>
      <input
        type="text"
        name="department"
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="text-black rounded-md p-2 w-full"
      />
    </div>

    {/* 사용자 */}
    <div className="flex flex-col">
      <h3 className="text-yellow-300">사용자 (Pc description)</h3>
      <input
        ref={userInputRef}
        type="text"
        name="user"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        className="text-black rounded-md p-2 w-full"
      />
    </div>
     {/* 의뢰인 */}
     <div className="flex flex-col ">
      <h3 className="text-yellow-300">의뢰인</h3>
      <input
        type="text"
        name="client"
        value={client}
        onChange={(e) => setClient(e.target.value)}
        className="text-black rounded-md p-2 w-full"
      />
    </div>
      {/* PC 이름 */}
      <div className="flex flex-col ">
      <h3 className="text-yellow-300">PC 이름</h3>
      <input
        type="text"
        name="pcName"
        value={pcName}
        onChange={(e) => setPcName(e.target.value)}
        className="text-black rounded-md p-2 w-full"
      />
    </div>
    </>
    
  )
}


