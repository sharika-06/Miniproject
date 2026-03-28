import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { ShieldAlert, TrendingUp, User, CreditCard, Download, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const RiskAnalysis = () => {
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRisks = async () => {
            try {
                const response = await api.getRisks();
                if (response.success) {
                    setRisks(response.data);
                } else {
                    setError('Failed to load risk analysis data');
                }
            } catch (err) {
                console.error('Error fetching risks:', err);
                setError('Error connecting to risk engine');
            } finally {
                setLoading(false);
            }
        };

        fetchRisks();
    }, []);

    const handleExportRisks = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(220, 38, 38); // Red
        doc.text('High Risk Analysis Report', 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('This report identifies top priority entities flagged by the NeuroGraph Risk Engine.', 14, 40);

        // Analysis Table
        const tableColumn = ["Entity Name", "Account No", "Risk Score", "Risk Level", "Detection Date"];
        const tableRows = risks.map(r => [
            r.name,
            r.accountNumber,
            r.risk,
            r.riskLevel,
            new Date(r.date).toLocaleDateString()
        ]);

        autoTable(doc, {
            startY: 50,
            head: [tableColumn],
            body: tableRows,
            theme: 'striped',
            headStyles: { fillColor: [127, 29, 29] }, // Deep Red
        });

        doc.save('risk-analysis-report.pdf');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-neuro-muted">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-neuro-accent" />
                <span className="animate-pulse font-medium">Running structural and behavioral risk analysis...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel p-8 rounded-2xl border border-neuro-danger/20 bg-neuro-danger/5 text-center max-w-lg mx-auto mt-10">
                <AlertCircle className="w-12 h-12 text-neuro-danger mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Analysis Engine Offline</h3>
                <p className="text-neuro-muted mb-4">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ShieldAlert className="text-neuro-danger w-8 h-8" />
                        High-Risk Priority List
                    </h2>
                    <p className="text-neuro-muted text-sm mt-1">
                        Entities with highest threat vectors based on behavioral and structural analysis.
                    </p>
                </div>
                <button
                    onClick={handleExportRisks}
                    className="px-4 py-2 bg-neuro-danger/20 hover:bg-neuro-danger/30 text-neuro-danger rounded-lg border border-neuro-danger/50 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest shadow-lg shadow-red-900/10"
                >
                    <Download size={16} /> Export Analysis
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {risks.length === 0 ? (
                    <div className="col-span-full py-12 text-center glass-panel rounded-2xl border border-white/5 opacity-50">
                        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-neuro-muted" />
                        <p className="text-neuro-muted font-medium">No high-risk entities detected in the current dataset.</p>
                    </div>
                ) : (
                    risks.map((risk, index) => (
                        <Card
                            key={index}
                            className="bg-neuro-card/50 border border-white/5 hover:border-neuro-danger/30 transition-all duration-300 group hover:shadow-2xl hover:shadow-red-900/5"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 bg-neuro-danger/10 rounded-xl flex items-center justify-center border border-neuro-danger/20 group-hover:scale-110 transition-transform">
                                        <User className="text-neuro-danger w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold text-neuro-muted uppercase tracking-widest mb-1">Risk Score</div>
                                        <div className="text-3xl font-black text-neuro-danger leading-none">{risk.risk}</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-white font-bold text-lg group-hover:text-neuro-danger transition-colors">{risk.name}</h4>
                                        <div className="flex items-center gap-2 text-neuro-muted text-sm mt-1">
                                            <CreditCard size={14} />
                                            <span className="font-mono">{risk.accountNumber}</span>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter border ${risk.riskLevel === 'Critical' ? 'bg-red-500/20 text-red-500 border-red-500/30' : 'bg-orange-500/20 text-orange-500 border-orange-500/30'
                                            }`}>
                                            {risk.riskLevel} threat
                                        </span>
                                        <span className="text-[10px] text-neuro-muted font-mono">{new Date(risk.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Analysis Methodology Card */}
            <div className="glass-panel p-6 rounded-2xl border border-neuro-border bg-gradient-to-br from-neuro-lighter/20 to-transparent">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-neuro-accent" /> Analysis Methodology
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-neuro-accent">Behavioral Analysis</h4>
                        <p className="text-xs text-neuro-muted leading-relaxed">Scans for rapid wealth accumulation, transaction velocity spikes, and unusual transfer volumes relative to account age.</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-neuro-accent">Structural Patterns</h4>
                        <p className="text-xs text-neuro-muted leading-relaxed">Detects circular loop participation, layered transaction paths, and high-centrality positions in suspicious clusters.</p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-neuro-accent">ML Anomaly Scoring</h4>
                        <p className="text-xs text-neuro-muted leading-relaxed">Our Gemini-powered engine uses isolation forests to flag statistical outliers that evade traditional rule-based filters.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RiskAnalysis;
