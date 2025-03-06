import { tailwindDesign } from "@/design/tailwindDesign";

export default function CommonTextArea({ value, setValue, name, }: { value: string, setValue: (value: string) => void, name: string, }) {
    return (
        <textarea
            name={name}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            className={tailwindDesign.textArea}
          />
    );
}


