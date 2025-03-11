export default function DebugLog({ workType, receiveDate, createdAt, pcName, department, user, client, modelName, serial, code, taskDetails }: { workType: string, receiveDate: string, createdAt: string, pcName: string, department: string, user: string, client: string, modelName: string, serial: string, code: string, taskDetails: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-indigo-600">디버깅</h1>
      <h3>작업유형 : {workType}</h3>
      <h3>입고일 : {receiveDate}</h3>
      <h3>작업일 : {createdAt}</h3>
      <h3>PC 이름 : {pcName}</h3>
      <h3>부서 : {department}</h3>
      <h3>사용자 : {user}</h3>
      <h3>의뢰인 : {client}</h3>
      <h3>모델명 : {modelName}</h3>
      <h3>제조 번호 : {serial}</h3>
      <h3>보안코드 : {code}</h3>
      <h3>작업내용 : {taskDetails}</h3>
     </div>
  )
}

