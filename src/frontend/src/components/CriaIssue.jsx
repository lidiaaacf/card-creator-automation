import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function IssueFormModal({ isOpen, onClose, onSubmit, issueToEdit }) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [client, setClient] = useState("");
  const [screen, setScreen] = useState("");
  const [weight, setWeight] = useState("1");
  const [type, setType] = useState("feature");
  // const [screenshot, setScreenshot] = useState(null);

  useEffect(() => {
    if (issueToEdit) {
      setTitle(issueToEdit.name || "");
      setContext(issueToEdit.context || "");
      setClient(issueToEdit.client || "");
      setScreen(issueToEdit.screen || "");
      setWeight(issueToEdit.weight?.toString() || "1");
      setType(issueToEdit.issue_type || "feature");
    }
  }, [issueToEdit]);

  if (!isOpen) return null;

  if (!isOpen) return null;

  const handleSubmit = (sendToGitlab) => {
    const newIssue = {
      title,
      context,
      weight,
      type,
      client,
      screen,
      //screenshot,
      sendToGitlab,
      id: issueToEdit?.id,
    };
    onSubmit(newIssue);
    onClose();
  };

  const issueTypes = [
    { value: "feature"       , label: "Feature"       },
    { value: "new-develop"   , label: "New develop"   },
    { value: "bug-levantado" , label: "Bug levantado" },
    { value: "bug-reportado" , label: "Bug reportado" },
    { value: "ajuste"        , label: "Ajuste"        },
    { value: "teste"         , label: "Teste"         },
  ];

  const issueWeights = [
    { value: "1"  , label: "1"  },
    { value: "2"  , label: "2"  },
    { value: "3"  , label: "3"  },
    { value: "5"  , label: "5"  },
    { value: "8"  , label: "8"  },
    { value: "13" , label: "13" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 text-white p-6 rounded-2xl w-[500px] shadow-lg"
      >
        <h2 className="text-xl font-bold mb-4">Cadastrar nova issue</h2>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Título"
            className="bg-gray-800 px-3 py-2 rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="text"
            placeholder="Inconformidade"
            className="bg-gray-800 px-3 py-2 rounded-lg"
            value={context}
            onChange={(e) => setContext(e.target.value)}
          />
          <input
            type="text"
            placeholder="Cliente"
            className="bg-gray-800 px-3 py-2 rounded-lg"
            value={client}
            onChange={(e) => setClient(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tela"
            className="bg-gray-800 px-3 py-2 rounded-lg"
            value={screen}
            onChange={(e) => setScreen(e.target.value)}
          />
          {/* <div>
            <input
              type="file"
              accept="image/*"
              className="bg-gray-800 px-3 py-2 rounded-lg w-full"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setScreenshot(file);
                }
              }}
            />
            {screenshot && (
              <img
                src={URL.createObjectURL(screenshot)}
                alt="Preview"
                className="mt-2 max-h-40 rounded-lg border border-gray-700"
              />
            )}
          </div> */}
          <select
            className="bg-gray-800 px-3 py-2 rounded-lg"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          >
            {issueWeights.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            className="bg-gray-800 px-3 py-2 rounded-lg"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {issueTypes.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-center gap-3 mt-5">
          <button
            className="h-12 bg-gray-700 rounded-lg w-40 flex items-center justify-center"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="h-12 bg-blue-600 rounded-lg w-40 flex items-center justify-center"
            onClick={() => handleSubmit(true)}
          >
            Enviar para GitLab
          </button>

          <button
            className="h-12 bg-orange-600 rounded-lg w-40 flex items-center justify-center"
            onClick={() => handleSubmit(false)}
          >
            Salvar localmente
          </button>
        </div>
      </motion.div>
    </div>
  );
}
