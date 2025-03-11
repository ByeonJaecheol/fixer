import { tailwindDesign } from "@/design/tailwindDesign";

export default function CommonTextArea({ value, setValue, name, placeholder }: { value: string, setValue: (value: string) => void, name: string, placeholder?:string }) {
    return (
        <textarea
            name={name}
            value={value||undefined}
            onChange={(e) => setValue(e.target.value)}
            rows={4}
            placeholder={placeholder??""}
            className={tailwindDesign.textArea}
          />
    );
}


