import React from "react";
import { Calendar, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Inicio() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      {/* Top Navbar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between bg-black/40 rounded-2xl p-4 mb-6 shadow-lg"
      >
        <div className="text-2xl font-bold text-orange-500">DataSelf</div>
        <div className="flex items-center gap-3">
          {["Marcações", "Minhas Issues", "Templates"].map((item, idx) => (
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
        {/* Left Section */}
        <div className="flex-1">
          {/* Action Bar */}
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

          {/* Table */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-black/40 rounded-xl overflow-hidden shadow-lg"
          >
            <table className="w-full text-left">
              <thead className="bg-black/60 text-orange-500 uppercase text-sm">
                <tr>
                  {["ID", "Peso", "Tipo", "Tela", "Usuário", "Issue Criada", "Status", "Ações"].map((col) => (
                    <th key={col} className="px-4 py-3">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[...Array(6)].map((_, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-3">#{i + 1}</td>
                    <td className="px-4 py-3">Médio</td>
                    <td className="px-4 py-3">Bug</td>
                    <td className="px-4 py-3">Tela X</td>
                    <td className="px-4 py-3">Usuário {i + 1}</td>
                    <td className="px-4 py-3">01/01/2025</td>
                    <td className="px-4 py-3">Aberto</td>
                    <td className="px-4 py-3">
                      <button className="text-orange-500 hover:underline">Editar</button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>

        {/* Right Stats Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="w-80 flex flex-col gap-4"
        >
          {/* Date Filter */}
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

          {/* Stats */}
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
