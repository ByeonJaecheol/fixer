'use client';

import { supabase } from "@/app/utils/supabase";
import CommonInputOnChangeAndKeyDown from "../common/input/CommonInputOnChangeAndKeyDown";
import { tailwindDesign } from "@/design/tailwindDesign";

export default function AutoComplete({autoUser, setAutoUser, showAutoComplete, setShowAutoComplete, user, setUser, getUser, setGetUser, department, setDepartment, client, setClient, pcName, setPcName, modelName, setModelName, serial, setSerial, code, setCode }: { autoUser: string, setAutoUser: (autoUser: string) => void, showAutoComplete: boolean, setShowAutoComplete: (showAutoComplete: boolean) => void, user: string, setUser: (user: string) => void, getUser: any, setGetUser: (getUser: any) => void, department: string, setDepartment: (department: string) => void, client: string, setClient: (client: string) => void, pcName: string, setPcName: (pcName: string) => void, modelName: string, setModelName: (modelName: string) => void, serial: string, setSerial: (serial: string) => void, code: string, setCode: (code: string) => void }) {
    
    const getEmployeeInfo = async () => {
        const { data, error } = await supabase.from("work-history").select("*").eq("user", autoUser);
        if (error) throw error;
        console.log(data);
        return data;
      };

      const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          const employeeInfo = await getEmployeeInfo();  
          console.log(employeeInfo);
          if (employeeInfo.length > 0) {
            setShowAutoComplete(true);
            setGetUser(employeeInfo);
          } else {
            alert("검색 결과가 없습니다.");
            setShowAutoComplete(false);
          }
        }
      }
    return (
    <>
         {/* 사용자 자동 완성 */}
         <div className="flex flex-col">
          <h3 className={tailwindDesign.inputLabel}>사용자 검색</h3>
          <CommonInputOnChangeAndKeyDown value={autoUser} setValue={setAutoUser} type="text" name="autoUser" onKeyDown={handleKeyDown} />
            {/* <input type="text" className="text-black rounded-md p-2 w-full" value={autoUser} onChange={(e) => setAutoUser(e.target.value)}  onKeyDown={handleKeyDown} /> */}
      </div>
      {showAutoComplete && (
      <div className="flex flex-row border-2 border-gray-300 gap-x-2 rounded-md p-2">
        {getUser.map((item: any) => (
           <span key={item.id} className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full font-medium text-white cursor-pointer bg-blue-500"
            onClick={() => {
                setUser(item.user);
                setDepartment(item.department);
                setClient(item.client);
                setPcName(item.pc_name);
                setModelName(item.model_name);
                setSerial(item.serial);
                setCode(item.code);
                setShowAutoComplete(false);
                setAutoUser("");
            }}>
             {item.department} / {item.user}
           </span>
          
        ))}
      </div>
      )}
    </>
  );
}
