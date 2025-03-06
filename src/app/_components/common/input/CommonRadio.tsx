export default function CommonRadio({ model, setModelName, modelName, index }: { model: string, setModelName: (modelName: string) => void, modelName: string, index: number }) {
    return (
        <>
          <input
                    type="radio"
                    id={`model-${model}`}
                    name={`model_name_${index}`}
                    value={model}
                    checked={modelName === model}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor={`model-${model}`} className="text-sm font-medium text-gray-700">
                    {model}
                  </label>
            
        </>
    );
}
