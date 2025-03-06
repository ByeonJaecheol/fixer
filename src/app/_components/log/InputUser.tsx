import { tailwindDesign } from "@/design/tailwindDesign";
import CommonInputOnChange from "../common/input/CommonInputOnChange";

export default function InputUser({ department, setDepartment, user, setUser, client, setClient, pcName, setPcName }: 
  { department: string, setDepartment: (department: string) => void, user: string, setUser: (user: string) => void, client: string, setClient: (client: string) => void, pcName: string, setPcName: (pcName: string) => void }) {
  return (
    <>
      {/* 부서 */}
      <div className="flex flex-col">
      <h3 className={tailwindDesign.inputLabel}>부서</h3>
      <CommonInputOnChange value={department} setValue={setDepartment} type="text" name="department" />
    </div>

    {/* 사용자 */}
    <div className="flex flex-col">
      <h3 className={tailwindDesign.inputLabel}>사용자 (Pc description)</h3>
      <CommonInputOnChange value={user} setValue={setUser} type="text" name="user" />
    </div>
     {/* 의뢰인 */}
     <div className="flex flex-col ">
      <h3 className={tailwindDesign.inputLabel}>의뢰인</h3>
      <CommonInputOnChange value={client} setValue={setClient} type="text" name="client" />
    </div>

      {/* PC 이름 */}
      <div className="flex flex-col ">
      <h3 className={tailwindDesign.inputLabel}>PC 이름</h3>
      <CommonInputOnChange value={pcName} setValue={setPcName} type="text" name="pcName" />
    </div>
    </>
    
  )
}


