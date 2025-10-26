import React, { useState } from "react";
import { Eye, Star } from "lucide-react";
import { useToast } from "./ui/use-toast";
import Detalhes from "./Detalhes";

export default function Acoes({ issue, onAction }) {
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [favorited, setFavorited] = useState(issue.favorited ?? false);
  const URL = import.meta.env.VITE_ISSUES_DB;
  const { addToast } = useToast();

  const handleAction = async (action) => {
    try {
      if (action === "favoritar") {
        const res = await fetch(`${URL}/issues/${issue.project_id}/${issue.iid}/favorite`, {
          method: "POST",
        });

        if (res.ok) {
          const data = await res.json();
          setFavorited(data.favorited);
          addToast({ id: Date.now(), message: "Issue favoritada!" });
          onAction("favoritar", data);
        } else {
          addToast({ id: Date.now(), message: "Erro ao favoritar issue." });
        }
      }

      if (action === "detalhes") {
        setShowDetalhesModal(true);
      }
    } catch (err) {
      addToast({ id: Date.now(), message: `Erro: ${err}` });
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={() => handleAction("detalhes")}
          className="text-purple-400 hover:text-purple-300"
        >
          <Eye size={18} />
        </button>

        <button
          onClick={() => handleAction("favoritar")}
          className="text-yellow-400 hover:text-yellow-300"
        >
          <Star fill={favorited ? "currentColor" : "none"} size={18} />
        </button>
      </div>

      {showDetalhesModal && (
        <Detalhes issue={issue} onClose={() => setShowDetalhesModal(false)} />
      )}
    </>
  );
}
