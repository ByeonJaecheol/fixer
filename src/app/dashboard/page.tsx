'use client';

import InputHistory from "../_components/log/InputHistory";

export default function Dashboard() {
  return (
      <div className="bg-white justify-items-center min-h-screen p-2 pb-20 gap-16 sm:p-4 ">
        {/* <div className="max-w-7xl mx-auto space-y-4 p-4">
          <Header/>
        </div> */}
        <InputHistory />
      </div>
  );
}