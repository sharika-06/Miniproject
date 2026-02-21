import React, { useState } from 'react';
import { X, ShieldAlert, FileText, CheckCircle, Users, Activity, ExternalLink, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '../../services/api';

const CaseDetails = ({ caseData, onClose, onResolve }) => {
    const [resolving, setResolving] = useState(false);

    if (!caseData) return null;

    // Determine color based on risk
    let riskColor = 'text-green-500';
    let riskBg = 'bg-green-500/10';
    let riskBorder = 'border-green-500/20';

    if (caseData.risk === 'Critical') {
        riskColor = 'text-red-500';
        riskBg = 'bg-red-500/10';
        riskBorder = 'border-red-500/20';
    } else if (caseData.risk === 'High') {
        riskColor = 'text-orange-500';
        riskBg = 'bg-orange-500/10';
        riskBorder = 'border-orange-500/20';
    } else if (caseData.risk === 'Medium') {
        riskColor = 'text-yellow-500';
        riskBg = 'bg-yellow-500/10';
        riskBorder = 'border-yellow-500/20';
    }

    const handleDownloadReport = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.text('Case Investigation Report', 14, 20);

        doc.setFontSize(12);
        doc.text(`Case ID: ${caseData.id}`, 14, 30);
        doc.text(`Date Opened: ${caseData.date}`, 14, 36);
        doc.text(`Status: ${caseData.status}`, 14, 42);
        doc.text(`Risk Level: ${caseData.risk}`, 14, 48);

        // Summary
        doc.setFontSize(14);
        doc.text('Case Summary', 14, 60);
        doc.setFontSize(10);
        const splitDescription = doc.splitTextToSize(caseData.description || 'No description available.', 180);
        doc.text(splitDescription, 14, 66);

        // Involved Entities Table
        const tableColumn = ["Entity ID", "Name", "Risk Score"];
        const tableRows = (caseData.involvedEntities || []).map(entity => [
            entity.id,
            entity.name,
            entity.risk
        ]);

        autoTable(doc, {
            startY: 80,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
        });

        doc.save(`Case_Report_${caseData.id}.pdf`);
    };

    const handleResolve = async () => {
        setResolving(true);
        try {
            const res = await api.resolveCase(caseData.id);
            if (res.success) {
                if (onResolve) onResolve();
            }
        } catch (error) {
            console.error("Failed to resolve case", error);
        } finally {
            setResolving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl glass-panel rounded-2xl border border-neuro-border overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neuro-border bg-neuro-lighter/50">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${riskBorder} ${riskBg}`}>
                            <ShieldAlert className={`w-6 h-6 ${riskColor}`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">
                                {caseData.name}
                            </h2>
                            <p className="text-sm text-neuro-muted mt-1 font-mono">ID: {caseData.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6 text-neuro-muted hover:text-white" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Status & Risk Badge Row */}
                    <div className="flex flex-wrap gap-3 mb-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${riskBg} ${riskColor} ${riskBorder}`}>
                            {caseData.risk} Risk
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${caseData.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                            Status: {caseData.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Opened: {caseData.date}
                        </span>
                    </div>

                    {/* Description Section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-neuro-muted mb-2 uppercase tracking-wide flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Case Summary
                        </h3>
                        <div className="p-4 rounded-xl bg-neuro-lighter/30 border border-neuro-border text-neuro-text text-sm leading-relaxed">
                            {caseData.description || "No description available for this case."}
                        </div>
                    </div>

                    {/* Involved Entities Section */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-neuro-muted mb-2 uppercase tracking-wide flex items-center gap-2">
                            <Users className="w-4 h-4" /> Involved Entities ({caseData.entities})
                        </h3>
                        <div className="max-h-40 overflow-y-auto pr-2 space-y-2">
                            {caseData.involvedEntities && caseData.involvedEntities.length > 0 ? (
                                caseData.involvedEntities.map((entity, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-neuro-bg/50 border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-neuro-muted border border-white/5">
                                                {entity.name.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{entity.name}</p>
                                                <p className="text-xs text-neuro-muted font-mono">{entity.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold ${entity.risk > 80 ? 'text-red-500' : 'text-orange-500'}`}>
                                                Risk: {entity.risk}
                                            </span>
                                            <button className="text-xs text-neuro-accent hover:text-white flex items-center gap-1 transition-colors">
                                                View Profile <ExternalLink className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-neuro-muted italic">No specific entities listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neuro-border">
                        <button
                            onClick={handleDownloadReport}
                            className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-all border border-white/10"
                        >
                            <FileText className="w-4 h-4" /> Download Report
                        </button>
                        {caseData.status !== 'Resolved' ? (
                            <button
                                onClick={handleResolve}
                                disabled={resolving}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-neuro-accent hover:bg-blue-600 text-white font-medium shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Mark as Resolved
                            </button>
                        ) : (
                            <button
                                disabled
                                className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-500/20 text-green-500 font-medium border border-green-500/20 cursor-default"
                            >
                                <CheckCircle className="w-4 h-4" /> Resolved
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseDetails;
