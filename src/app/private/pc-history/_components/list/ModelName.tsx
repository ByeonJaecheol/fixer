export default function ModelName({ modelName }: { modelName: string|null | undefined }) {
  return (
    <div className="px-2 py-4 text-sm text-gray-500 text-center">{modelName === null ? "-" : modelName}</div>
  );
}


