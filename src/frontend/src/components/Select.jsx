import React from "react";
import { Listbox } from "@headlessui/react";

export default function Select({ options = [], value = null, onChange }) {
    const label = value?.title || "Projetos";

    return (
        <div className="relative inline-block w-60">
            <Listbox value={value} onChange={onChange}>
                <Listbox.Button className="w-full text-left text-2xl font-bold text-orange-500 px-4 py-2 bg-gray-800 rounded-lg">
                    {label}
                </Listbox.Button>

                <Listbox.Options className="absolute mt-1 w-full bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-auto z-50">
                    {options.map((opt) => (
                        <Listbox.Option
                            key={opt.id}
                            value={opt}
                            className="cursor-pointer px-4 py-2 hover:bg-orange-500/20"
                        >
                            {opt.title}
                        </Listbox.Option>
                    ))}
                </Listbox.Options>
            </Listbox>
        </div>
    );
}
