import React, { useState } from "react";
import { Eye, Star, Send, Trash, Edit } from "lucide-react";
import { useToast } from "./ui/use-toast";
import Detalhes from "./Detalhes";
import IssueFormModal from "./CriaIssue";

export default function Acoes({ issue, onAction }) {
  const [showDetalhesModal, setShowDetalhesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [favorited, setFavorited] = useState(issue.favorited ?? false);
  const URL = import.meta.env.VITE_ISSUES_DB;
  const { addToast } = useToast();

  const isLocalEditable = issue.id !== undefined && !issue.sent;

  const handleEditSubmit = async (issueData) => {
    try {
      const res = await fetch(`${URL}/issues/local/${issueData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(issueData),
      });

      if (res.ok) {
        const data = await res.json();
        addToast({ id: Date.now(), message: "Issue atualizada!" });
        onAction("editar", data);
        setShowEditModal(false);
      } else {
        addToast({ id: Date.now(), message: "Erro ao atualizar issue." });
      }
    } catch (err) {
      addToast({ id: Date.now(), message: `Erro: ${err}` });
      console.error(err);
    }
  };

  const handleAction = async (action) => {
    try {
      let res;

      switch (action) {
        case "favoritar":
          res = await fetch(`${URL}/${issue.project_id}/${issue.iid}/favorite`, {
            method: "POST",
          });
          break;

        case "enviar":
          if (!isLocalEditable) return;
          res = await fetch(`${URL}/issues/local/${issue.id}/send`, { method: "POST" });
          break;

        case "excluir":
          if (!isLocalEditable) return;
          res = await fetch(`${URL}/issues/local/${issue.id}`, { method: "DELETE" });
          break;

        case "editar":
          if (!isLocalEditable) return;
          setShowEditModal(true);
          return;

        case "detalhes":
          setShowDetalhesModal(true);
          return;

        default:
          return;
      }

      if (res && res.ok) {
        const data = await res.json();
        if (action === "favoritar") setFavorited(data.favorited);
        addToast({ id: Date.now(), message: `Ação ${action} realizada!` });
        onAction(action, data);
      } else if (res) {
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
          <Star fill={favorited ? "currentColor" : "none"} size={18} />
        </button>

        {isLocalEditable && (
          <button
            onClick={() => handleAction("editar")}
            className="text-purple-400 hover:text-purple-300"
          >
            <Edit size={18} />
          </button>
        )}

        <button
          onClick={() => handleAction("enviar")}
          disabled={!isLocalEditable}
          className={`text-green-400 rounded p-1 transition ${
            !isLocalEditable ? "opacity-50 cursor-not-allowed" : "hover:text-green-300"
          }`}
        >
          <Send size={18} />
        </button>

        <button
          onClick={() => handleAction("excluir")}
          disabled={!isLocalEditable}
          className={`text-red-500 rounded p-1 transition ${
            !isLocalEditable ? "opacity-50 cursor-not-allowed" : "hover:text-red-400"
          }`}
        >
          <Trash size={18} />
        </button>
      </div>

      {showEditModal && (
        <IssueFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
          issueToEdit={isLocalEditable ? issue : null}
        />
      )}

      {showDetalhesModal && (
        <Detalhes
          issue={issue}
          onClose={() => setShowDetalhesModal(false)}
        />
      )}
    </>
  );
}
