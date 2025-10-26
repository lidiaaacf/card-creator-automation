import React, { useState, useEffect } from "react";
import { Calendar, User } from "lucide-react";
import Select from "./components/Select";
import Acoes from "./components/Acoes";
import IssueFormModal from "./components/CriaIssue";
import { motion } from "framer-motion";
import { useToast } from "./components/ui/use-toast";

export default function Inicio() {
  const URL_ISSUES = import.meta.env.VITE_ISSUES_GITLAB;
  const URL_PROJETOS = import.meta.env.VITE_PROJETOS_GITLAB;
  const URL_CRIA_ISSUE = import.meta.env.VITE_CRIA_ISSUE;

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(URL_PROJETOS);
        if (!resp.ok) throw new Error("Erro ao buscar projetos");
        const data = await resp.json();
        setProjects(data);
        if (data.length > 0) setSelectedProject(data[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProject?.id) return;
    setLoading(true);
    (async () => {
      try {
        const resp = await fetch(`${URL_ISSUES}/?project_id=${selectedProject.id}`);
        if (!resp.ok) throw new Error("Erro ao buscar issues");
        const data = await resp.json();
        setIssues(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro:", err);
        setIssues([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedProject?.id]);

  function parseLabels(labels) {
    let weight = null;
    let type = null;
    let status = null;
    const tipos = ["bug levantado", "bug reportado", "new develop", "feature", "ajuste", "teste"];
    const statusList = ["ready", "to do", "doing", "review", "validation", "waiting prod", "done"];

    labels.forEach((label) => {
      if (/^\d+$/.test(label)) weight = parseInt(label, 10);
      else if (tipos.includes(label.toLowerCase())) type = label;
      else if (statusList.includes(label.toLowerCase())) status = label;
    });

    return { weight, type, status };
  }

  function searchIssue(issue) {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      issue.iid?.toString().includes(term) ||
      issue.title?.toLowerCase().includes(term) ||
      issue.description?.toLowerCase().includes(term) ||
      issue.author?.username?.toLowerCase().includes(term) ||
      (issue.labels || []).some((label) => label.toLowerCase().includes(term))
    );
  }

  const handleNewIssue = async (issueData) => {
    try {
      const payload = {
        project: selectedProject?.id?.toString() || "",
        title: issueData.title,
        context: issueData.context,
        weight: issueData.weight,
        issue_type: issueData.issue_type,
      };
      const res = await fetch(`${URL_CRIA_ISSUE}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao criar issue no GitLab");

      addToast({ id: Date.now(), message: "Issue enviada para o GitLab!", type: "success" });

      const issuesResp = await fetch(`${URL_ISSUES}/?project_id=${selectedProject.id}`);
      const issuesData = await issuesResp.json();
      setIssues(Array.isArray(issuesData) ? issuesData : []);
      setShowModal(false);
    } catch (err) {
      addToast({ id: Date.now(), message: `Erro: ${err.message}`, type: "error" });
      console.error(err);
    }
  };

  if (loading) return <p className="text-white">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between bg-black/40 rounded-2xl p-4 mb-6 shadow-lg"
      >
        <Select options={projects} value={selectedProject} onChange={setSelectedProject} />
        <div className="flex items-center gap-3">
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
            <button
              className="bg-orange-600 hover:bg-orange-500 px-5 py-2 rounded-lg font-semibold shadow-md"
              onClick={() => setShowModal(true)}
            >
              Cadastrar nova issue
            </button>

            <IssueFormModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onSubmit={handleNewIssue}
            />

            <input
              type="text"
              placeholder="Pesquisar issue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg w-64 outline-none focus:ring focus:ring-orange-500/50"
            />
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
                    {["ID", "Peso", "Tipo", "Usuário", "Status", "Ações"].map((col) => (
                      <th key={col} className="px-4 py-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {issues.filter(searchIssue).map((issue, i) => {
                    const { weight, type, status } = parseLabels(issue.labels || []);
                    return (
                      <motion.tr
                        key={issue.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-3">{issue.iid}</td>
                        <td className="px-4 py-3">{weight || "-"}</td>
                        <td className="px-4 py-3">{type || "-"}</td>
                        <td className="px-4 py-3">{issue.author.username || "-"}</td>
                        <td className="px-4 py-3">{status || "-"}</td>
                        <td className="px-4 py-3">
                          <Acoes
                            issue={issue}
                            onAction={(action, data) => console.log(action, data)}
                          />
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



