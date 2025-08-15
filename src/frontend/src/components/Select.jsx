import React, { useState } from "react";
import { Listbox } from "@headlessui/react";

export default function Select({ options = [] }) {
    const [selected, setSelected] = useState(options[0] || "");

    return (
        <Listbox value={selected} onChange={setSelected}>
            <Listbox.Button className="text-2xl font-bold text-orange-500">
                {selected || "Selecione..."}
            </Listbox.Button>
            <Listbox.Options className="bg-gray-800 mt-1 rounded-lg shadow-lg">
                {options.map((option) => (
                    <Listbox.Option
                        key={option}
                        value={option}
                        className="cursor-pointer px-4 py-2 hover:bg-orange-500/10"
                    >
                        {option}
                    </Listbox.Option>
                ))}
            </Listbox.Options>
        </Listbox>
    );
}
