export default function CommonInput({ value, setValue, onKeyDown }: { value: string, setValue: (value: string) => void, onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void }) {
    return (
        <>
            <input type="text" className="text-black rounded-md p-2 w-full" value={value} onChange={(e) => setValue(e.target.value)}  onKeyDown={onKeyDown} />
        </>
    );
}
