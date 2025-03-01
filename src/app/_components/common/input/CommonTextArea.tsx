import { tailwindDesign } from "@/design/tailwindDesign";

export default function CommonTextArea({ value, setValue, name, placeholder, required }: { value: string, setValue: (value: string) => void, name: string, placeholder?: string, required?: boolean }) {
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


