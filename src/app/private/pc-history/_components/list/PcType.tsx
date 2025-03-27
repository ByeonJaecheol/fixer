export default function PcType({ pcType }: { pcType: string }) {
  return (
      <div className="px-2 py-4 text-sm text-gray-500 text-center">
      <span className={`px-2 py-1 rounded-full text-xs font-medium 
          ${pcType === "데스크탑" ? 
          "bg-purple-100 text-purple-800" : 
          "bg-green-100 text-green-800"}`}>
        {pcType === "데스크탑" ? "D" : "N"}
      </span>
    </div>
  );
}


