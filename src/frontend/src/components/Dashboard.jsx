import React from "react";

function parseLabels(labels) {
    let weight = null;
    let type = null;
    let status = null;

    const tipos = ["bug levantado", "bug reportado", "new develop", "feature", "ajuste", "teste"];
    const statusList = ["ready", "to do", "doing", "review", "validation", "waiting prod", "done"];

    labels.forEach((label) => {
        const l = label.toLowerCase();
        if (/^\d+$/.test(l)) weight = parseInt(l, 10);
        else if (tipos.includes(l)) type = label;
        else if (statusList.includes(l)) status = label;
    });

    return { weight, type, status };
}

export default function DashboardStats({ issues }) {
    const totalIssues = issues.length;

    let doing = 0;
    let waitingProd = 0;
    let bugsLevantadosCount = 0;
    let bugsIdentificadosCount = 0;
    let pesoTotal = 0;
    let atrasadas = 0;
    let fechadas = 0;

    const now = new Date();

    issues.forEach((issue) => {
        const { weight, type, status } = parseLabels(issue.labels || []);

        const typeNormalized = type?.toLowerCase() || "";
        const statusNormalized = status?.toLowerCase() || "";

        if (statusNormalized === "doing") doing++;
        if (statusNormalized === "waiting prod") waitingProd++;
        if (weight) pesoTotal += weight;

        if (typeNormalized === "bug levantado") bugsIdentificadosCount++;
        if (typeNormalized === "bug levantado" || typeNormalized === "bug reportado") bugsLevantadosCount++;

        if (issue.due_date && new Date(issue.due_date) < now && issue.state === "opened") {
            atrasadas++;
        }

        if (issue.state === "closed") fechadas++;
    });

    const bugsIdentificadosPercent = bugsLevantadosCount
        ? Math.round((bugsIdentificadosCount / bugsLevantadosCount) * 100)
        : 0;

    const mediaPeso = totalIssues ? Math.round(pesoTotal / totalIssues) : 0;

    return (
        <>
            <div className="bg-black/40 p-6 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-bold">{totalIssues}</div>
                <div className="text-gray-400 text-sm">issues criadas</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl shadow-lg text-center">
                    <div className="text-2xl font-bold text-orange-500">{doing}</div>
                    <div className="text-gray-400 text-xs">issues iniciadas</div>
                </div>
                <div className="bg-black/40 p-6 rounded-xl shadow-lg text-center">
                    <div className="text-2xl font-bold text-orange-500">{waitingProd}</div>
                    <div className="text-gray-400 text-xs">issues em homologação</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl shadow-lg text-center">
                    <div className="text-2xl font-bold text-orange-500">{bugsIdentificadosPercent}%</div>
                    <div className="text-gray-400 text-xs">bugs identificados</div>
                </div>
                <div className="bg-black/40 p-6 rounded-xl shadow-lg text-center">
                    <div className="text-2xl font-bold text-orange-500">{mediaPeso}</div>
                    <div className="text-gray-400 text-xs">média peso</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-6 rounded-xl shadow-lg text-center">
                    <div className="text-2xl font-bold text-orange-500">{atrasadas}</div>
                    <div className="text-gray-400 text-xs">issues atrasadas</div>
                </div>
                <div className="bg-black/40 p-6 rounded-xl shadow-lg text-center">
                    <div className="text-2xl font-bold text-orange-500">{fechadas}</div>
                    <div className="text-gray-400 text-xs">issues fechadas</div>
                </div>
            </div>
        </>
    );
}