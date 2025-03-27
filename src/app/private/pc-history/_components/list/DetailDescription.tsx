import { truncateDescription } from "@/utils/utils";

export default function DetailDescription({ description }: { description: string|null }) {
  return (
    <div className="px-2 py-4 text-sm text-gray-500 border-l border-gray-200" title={description ?? ""}>
    {description === null ? "-" : truncateDescription(description,30)}
    </div>
  );
}


