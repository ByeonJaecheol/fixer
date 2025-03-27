import { truncateDescription } from "@/utils/utils";

export default function SecurityCode({ securityCode }: { securityCode: string|null }) {
  // if(securityCode === undefined||securityCode.length === 0){
  //   return (
  //     <div className="px-2 py-4 text-sm text-gray-500 text-center">-</div>
  //   );
  // }
  // return (
  //     <div className="px-2 py-4 text-sm text-gray-500 text-center">{truncateDescription(securityCode[0],8)}</div>
  // );
  return (
        <div className="px-2 py-4 text-sm text-gray-500 text-center">{securityCode === null ? "-" : securityCode}</div>
  )
}

