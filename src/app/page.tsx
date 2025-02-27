import Image from "next/image";
import Header from "./header/Header";
import WorkType from "./_components/log/WorkType";
import InputHistory from "./_components/log/InputHistory";

export default function Home() {
  return (
    <div className="bg-black justify-items-center min-h-screen p-2 pb-20 gap-16 sm:p-4 ">
        <div className="max-w-7xl mx-auto space-y-4 p-4">

      <Header/>
      </div>
      <InputHistory />
    </div>
  );
}
