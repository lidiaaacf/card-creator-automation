import React, { useState, useEffect } from "react";
import { Calendar, User } from "lucide-react";
import Select from "./components/Select";
import Acoes from "./components/Acoes"
import { motion } from "framer-motion";

export default function Inicio() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [created, setCreated] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch("http://localhost:8080/get-projects/");
        if (!resp.ok) throw new Error("Erro ao buscar projetos");
        const data = await resp.json();
        setProjects(data);
        if (data.length > 0) setSelectedProject(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setCreated(true);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProject?.id) return;
    setLoading(true);
    (async () => {
      try {
        const resp = await fetch(
          `http://localhost:8080/get-automation-issues/?project_id=${selectedProject.id}`
        );
        if (!resp.ok) throw new Error("Erro ao buscar issues");
        const data = await resp.json();
        setIssues(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro:", err);
        setIssues([]);
      } finally {
        setCreated(true);
        setLoading(false);
      }
    })();
  }, [selectedProject?.id]);

  function parseLabels(labels) {
    let peso = null;
    let type = null;
    let status = null;

    const tipos = ["bug levantado", "bug reportado", "new develop", "feature", "ajuste", "teste"];
    const statusList = ["ready", "to do", "doing", "review", "validation", "waiting prod", "done"];

    labels.forEach((label) => {
      if (/^\d+$/.test(label)) {
        peso = parseInt(label, 10);
      } else if (tipos.includes(label.toLowerCase())) {
        type = label;
      } else if (statusList.includes(label.toLowerCase())) {
        status = label;
      }
    });

    return { peso, type, status };
  }

  function parseScreen(description) {
    if (!description) return "Não aplicável";

    const linkMatch = description.match(/Link:\s*(https?:\/\/[^\s]+)/);

    if (!linkMatch) return "Não aplicável";

    try {
      const url = new URL(linkMatch[1]);
      const parts = url.pathname.split("/").filter(Boolean);

      if (parts.length > 0) {
        const lastPart = decodeURIComponent(parts[parts.length - 1]);
        if (lastPart.toLowerCase() === "não") {
          return "Não aplicável";
        }
        return lastPart;
      }

      return "Não aplicável";
    } catch (err) {
      return "Não aplicável";
    }
  }

  if (loading) return <p className="text-white">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between bg-black/40 rounded-2xl p-4 mb-6 shadow-lg"
      >
        <Select
          options={projects}
          value={selectedProject}
          onChange={setSelectedProject}
        />
        <div className="flex items-center gap-3">
          {["Marcações", "Minhas Issues", "Templates"].map((item) => (
            <motion.button
              key={item}
              whileHover={{ scale: 1.05 }}
              className="px-4 py-1 rounded-full border border-orange-500 text-sm hover:bg-orange-500/10"
            >
              {item}
            </motion.button>
          ))}
          <div className="p-2 rounded-full bg-orange-600 hover:bg-orange-500 cursor-pointer">
            <User size={20} />
          </div>
        </div>
      </motion.div>

      <div className="flex gap-6">
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3 mb-6"
          >
            <button className="bg-orange-600 hover:bg-orange-500 px-5 py-2 rounded-lg font-semibold shadow-md">
              Cadastrar nova issue
            </button>
            <input
              type="text"
              placeholder="Pesquisar issue"
              className="bg-gray-800 text-white px-4 py-2 rounded-lg w-64 outline-none focus:ring focus:ring-orange-500/50"
            />
            <button className="bg-orange-600 hover:bg-orange-500 px-5 py-2 rounded-lg font-semibold shadow-md">
              Enviar issues
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 rounded-xl overflow-hidden shadow-lg"
          >
            {issues.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                Nenhuma issue criada neste projeto ainda.
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-black/60 text-orange-500 uppercase text-sm">
                  <tr>
                    {["ID", "Peso", "Tipo", "Tela", "Setor", "Issue Criada", "Status", "Ações"].map(
                      (col) => (
                        <th key={col} className="px-4 py-3">
                          {col}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {issues.map((issue, i) => {
                    const { peso, type, status } = parseLabels(issue.labels || []);
                    const screen = parseScreen(issue.description);
                    return (
                      <motion.tr
                        key={issue.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-3">{issue.iid}</td>
                        <td className="px-4 py-3">{peso || "-"}</td>
                        <td className="px-4 py-3">{type || "-"}</td>
                        <td className="px-4 py-3">{screen || "-"}</td>
                        <td className="px-4 py-3">{issue.author.username || "-"}</td>
                        <td className="px-4 py-3">{created ? "Sim" : "Não"}</td>
                        <td className="px-4 py-3">{status || "-"}</td>
                        <td className="px-4 py-3">
                          <Acoes/>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="w-80 flex flex-col gap-4"
        >
          <div className="bg-black/40 p-4 rounded-xl shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>01/01/2025</span>
            </div>
            <span className="text-gray-400">a</span>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>01/01/2025</span>
            </div>
          </div>
          <div className="bg-black/40 p-6 rounded-xl shadow-lg text-center">
            <div className="text-3xl font-bold">128</div>
            <div className="text-gray-400 text-sm">issues criadas</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 p-6 rounded-xl shadow-lg text-center">
              <div className="text-2xl font-bold text-orange-500">24%</div>
              <div className="text-gray-400 text-xs">issues fechadas</div>
            </div>
            <div className="bg-black/40 p-6 rounded-xl shadow-lg text-center">
              <div className="text-2xl font-bold text-orange-500">78%</div>
              <div className="text-gray-400 text-xs">issues fechadas</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 p-6 rounded-xl shadow-lg text-center">
              <div className="text-2xl font-bold text-orange-500">41</div>
              <div className="text-gray-400 text-xs">issues fechadas</div>
            </div>
            <div className="bg-black/40 p-6 rounded-xl shadow-lg text-center">
              <div className="text-2xl font-bold text-orange-500">68</div>
              <div className="text-gray-400 text-xs">issues fechadas</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
