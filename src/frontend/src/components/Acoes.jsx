import React, { useState } from "react";
import { Eye, Star, Send, Trash } from "lucide-react";
import { useToast } from "./ui/use-toast";
import Detalhes from "./Detalhes";

export default function Acoes({ issue, onAction }) {
    const [showModal, setShowModal] = useState(false);
    const [favorited, setFavorited] = useState(issue.favorited ?? false);
    const URL = import.meta.env.VITE_ISSUES_DB;
    const { addToast } = useToast();

    const handleAction = async (action) => {
        try {
            let res;
            switch (action) {
                case "favoritar":
                    res = await fetch(
                        `${URL}/${issue.project_id}/${issue.iid}/favorite`,
                        { method: "POST" }
                    );
                    break;

                case "enviar":
                    res = await fetch(
                        `${URL}/${issue.project_id}/${issue.iid}/send`,
                        { method: "POST" }
                    );
                    break;

                case "excluir":
                    res = await fetch(
                        `${URL}/${issue.project_id}/${issue.iid}/delete`,
                        { method: "DELETE" }
                    );
                    break;

                case "detalhes":
                    setShowModal(true);
                    return;

                default:
                    return;
            }

            if (res && res.ok) {
                const data = await res.json();
                if (action === "favoritar") {
                    setFavorited(data.favorited);
                }
                addToast({ id: Date.now(), message: `Ação ${action} realizada!` });
                onAction(action, data);
            } else {
                addToast({ id: Date.now(), message: `Erro ao executar ${action}` });
                console.error(`Erro ao executar ${action}`);
            }
        } catch (err) {
            addToast({ id: Date.now(), message: `Falha na ação ${action}` });
            console.error(`Erro na ação ${action}:`, err);
        }
    };

    return (
        <>
            <div className="flex gap-3">
                <button
                    onClick={() => handleAction("detalhes")}
                    className="text-blue-400 hover:text-blue-300"
                >
                    <Eye size={18} />
                </button>
                <button
                    onClick={() => handleAction("favoritar")}
                    className="text-yellow-400 hover:text-yellow-300"
                >
                    <Star 
                        size={18} 
                        fill={favorited ? "currentColor" : "none"}
                    />
                </button>
                <button
                    onClick={() => handleAction("enviar")}
                    className="text-green-400 hover:text-green-300"
                >
                    <Send size={18} />
                </button>
                <button
                    onClick={() => handleAction("excluir")}
                    className="text-red-500 hover:text-red-400"
                >
                    <Trash size={18} />
                </button>
            </div>

            {showModal && (
                <Detalhes issue={issue} onClose={() => setShowModal(false)} />
            )}
        </>
    );
}
