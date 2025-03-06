
export default function OkButton({ onClick, isLoading, buttonText }: { onClick: () => void, isLoading: boolean, buttonText: string }) {
  return (
    <button
    onClick={onClick}
    disabled={isLoading}
    className={`
      w-full px-6 py-3 rounded-md text-white text-base
      ${isLoading ? "bg-indigo-500 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}
      transition-colors duration-200
    `}
  >
    {isLoading ? "처리 중..." : buttonText}
  </button>
  )
}

