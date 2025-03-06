export default function CommonInputBasic({ value, setValue, type, name, placeholder, required ,onKeyDown}: { value: string, setValue: (value: string) => void, type: string, name: string, placeholder?: string, required?: boolean, onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void }) {
    return (
        <>
            <input type={type} name={name} className="text-black rounded-md p-2 w-full" value={value}
                 onChange={(e) => setValue(e.target.value)} placeholder={placeholder} required={required} onKeyDown={onKeyDown} />
        </>
    );
}
