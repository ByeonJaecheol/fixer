import Link from "next/link";

export default function SerialNumber({ serialNumber }: { serialNumber: string|null }) {
  return (
    <Link href={`/private/pc-assets/${serialNumber}`}>  
    <div className="px-2 py-4 text-sm text-gray-500 text-center">{serialNumber}</div>
    </Link>
  );
}


