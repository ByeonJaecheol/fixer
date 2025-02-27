export default function InputSerial({ serial, setSerial, code, setCode }: { serial: string, setSerial: (serial: string) => void, code: string, setCode: (code: string) => void }) {
  return (
    <>
        {/* 시리얼 번호 */}
        <div className="flex flex-col">
          <h3 className="text-yellow-300">시리얼 번호</h3>
          <input
            type="text"
            name="serial"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            className="text-black rounded-md p-2 w-full"
          />
        </div>

        {/* 코드 */}
        <div className="flex flex-col">
          <h3 className="text-yellow-300">보안코드</h3>
          <input
            type="text"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="text-black rounded-md p-2 w-full"
          />
        </div>
    </>
  );
}
