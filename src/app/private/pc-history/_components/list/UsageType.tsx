export default function UsageType({ usageType }: { usageType: string|null }) {
  return (
    <div className="px-2 py-4 text-sm text-gray-500 text-center">
    <span className={`px-2 py-1 rounded-full text-xs font-medium 
      ${usageType === null ? 
        "bg-gray-100 text-gray-800" : 
        usageType === "개인용" ? 
        "bg-purple-100 text-purple-800" : 
        "bg-green-100 text-green-800"}`}>
      {usageType === null ? "-" : usageType}
    </span>
  </div>
  );
}


