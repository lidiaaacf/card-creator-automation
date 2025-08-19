import React from "react";
import { Eye, Star, Send, Trash } from "lucide-react";

export default function Acoes({ issue, onAction }) {
    return (
        <div className="flex gap-3">
            <button
                onClick={() => onAction("detalhes", issue)}
                className="text-blue-400 hover:text-blue-300"
            >
                <Eye size={18} />
            </button>
            <button
                onClick={() => onAction("favoritar", issue)}
                className="text-yellow-400 hover:text-yellow-300"
            >
                <Star size={18} />
            </button>
            <button
                onClick={() => onAction("enviar", issue)}
                className="text-green-400 hover:text-green-300"
            >
                <Send size={18} />
            </button>
            <button
                onClick={() => onAction("excluir", issue)}
                className="text-red-500 hover:text-red-400"
            >
                <Trash size={18} />
            </button>
        </div>
    );
}
