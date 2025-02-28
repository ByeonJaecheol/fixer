export default function CommonRadio({ model, setModelName, modelName }: { model: string, setModelName: (modelName: string) => void, modelName: string }) {
    return (
        <>
          <input
                    type="radio"
                    id={`model-${model}`}
                    name="model_name"
                    value={model}
                    checked={modelName === model}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-4 h-4"
                  />
                  <label htmlFor={`model-${model}`} className="">
                    {model}
                  </label>
            
        </>
    );
}
