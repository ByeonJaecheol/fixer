
export default function OkButton({ onClick, isLoading, buttonText, color }: { onClick: () => void, isLoading: boolean, buttonText: string, color?: string }) {
  return (
    <button
    onClick={onClick}
    disabled={isLoading}
    className={`
      w-full px-6 py-3 rounded-md text-white text-base
      ${isLoading ? "bg-indigo-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}
      transition-colors duration-200
      ${color === "red" ? "bg-red-500 hover:bg-red-600" : color === "yellow" ? "bg-yellow-500 hover:bg-yellow-600" : "bg-indigo-600 hover:bg-indigo-700"}
    `}
  >
    {isLoading ? "처리 중..." : buttonText}
  </button>
  )
}

