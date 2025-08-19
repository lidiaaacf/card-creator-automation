import React from "react";
import { motion } from "framer-motion";

export default function Detalhes({ issue, onClose }) {
    if (!issue) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-[500px] max-w-[90%]"
            >
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    Detalhes da Issue
                </h2>

                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p><span className="font-medium">ID:</span> {issue.iid}</p>
                    <p><span className="font-medium">Título:</span> {issue.title}</p>
                    <p><span className="font-medium">Autor:</span> {issue.author?.username}</p>
                    <p><span className="font-medium">Status:</span> {issue.state == 'opened'? 'Aberta' : 'Fechada'}</p>
                    <p><span className="font-medium">Criado em:</span> {new Date(issue.created_at).toLocaleString()}</p>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors shadow-md"
                    >
                        Fechar
                    </button>
                </div>
            </motion.div>
        </div>
    );
}