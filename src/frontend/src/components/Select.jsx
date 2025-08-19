import React from "react";
import { Listbox } from "@headlessui/react";

export default function Select({ options = [], value = null, onChange }) {
    const label = value?.name || "Projetos";

    return (
        <Listbox value={value} onChange={onChange}>
            <Listbox.Button className="text-2xl font-bold text-orange-500">
                {label}
            </Listbox.Button>

            <Listbox.Options className="bg-gray-800 mt-1 rounded-lg shadow-lg">
                {options.map((opt) => (
                    <Listbox.Option
                        key={opt.id}
                        value={opt}
                        className="cursor-pointer px-4 py-2 hover:bg-orange-500/10"
                    >
                        {opt.name}
                    </Listbox.Option>
                ))}
            </Listbox.Options>
        </Listbox>
    );
}
