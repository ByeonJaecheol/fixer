import Link from "next/link";

export default function AsWriteButton() {
    return (
        <Link href="/private/as-request/write" className="w-32 bg-blue-500 text-white text-center px-4 py-2 rounded-md">
            새 이력작성
        </Link>
    )
}