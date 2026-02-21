import React, { useState } from 'react';
import { X, Eye, EyeOff, FileText, Lock, AlertOctagon, User } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const NodeDetails = ({ node, transactions = [], onClose }) => {
    const [showAccountNumber, setShowAccountNumber] = useState(false);

    if (!node) return null;

    // Determine color based on risk score
    let riskColor = '#94a3b8'; // Default Grey (Slate-400)
    let riskLabel = 'LOW RISK';
    let riskBadgeStyle = 'bg-slate-500/20 text-slate-400 border-slate-500';

    if (node.risk > 67) {
        riskColor = '#ef4444'; // Red
        riskLabel = 'CRITICAL RISK';
        riskBadgeStyle = 'bg-neuro-danger/20 text-neuro-danger border-neuro-danger';
    } else if (node.risk > 34) {
        riskColor = '#f97316'; // Orange
        riskLabel = 'MODERATE RISK';
        riskBadgeStyle = 'bg-neuro-warning/20 text-neuro-warning border-neuro-warning';
    }

    // Mock Risk Score Data including the remaining part for the gauge
    const riskData = [
        { name: 'Risk', value: node.risk, color: riskColor },
        { name: 'Safe', value: 100 - node.risk, color: '#334155' }, // Dark Slate for remaining
    ];

    // Format transactions for display
    const displayTransactions = transactions.map(tx => {
        const isOut = tx.source === node.id;
        return {
            id: tx.id,
            date: new Date(tx.timestamp).toLocaleString(),
            to: isOut ? (tx.targetUser || tx.target) : (tx.sourceUser || tx.source), // Show name if available, else ID
            amount: `${tx.amount.toLocaleString()}`,
            type: isOut ? 'OUT' : 'IN'
        };
    }).sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10); // Show last 10

    // Helper to mask account number
    const getMaskedAccountNumber = (accNum) => {
        if (!accNum) return '';
        // Assuming format like "8821-4455-1029" or similar
        // We will mask all but last 4 chars
        const last4 = accNum.slice(-4);
        return `****-****-${last4}`;
    };

    const handleGenerateReport = () => {
        const doc = new jsPDF();

        // 1. Title and Header
        doc.setFontSize(20);
        doc.text('Transaction Report', 14, 22);

        doc.setFontSize(12);
        doc.text(`User: ${node.user}`, 14, 32);
        doc.text(`UID: ${node.id.toUpperCase()}`, 14, 38);
        if (node.accountNumber) {
            doc.text(`Account Number: ${node.accountNumber}`, 14, 44);
        }

        // 2. Table Data
        const tableColumn = ["Date", "Counterparty", "Type", "Amount"];
        const tableRows = displayTransactions.map(tx => [
            tx.date,
            tx.to,
            tx.type,
            tx.amount
        ]);

        // 3. Generate Table
        autoTable(doc, {
            startY: 50,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { fillColor: [66, 133, 244] }, // Google Blue-ish or adjust to theme
            styles: { fontSize: 10 },
        });

        // 4. Save
        doc.save(`Transaction_Report_${node.user.replace(/\s+/g, '_')}.pdf`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-4xl glass-panel rounded-2xl border border-neuro-border overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-neuro-border bg-neuro-lighter/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border border-neuro-border shadow-inner">
                            <User className="w-6 h-6 text-neuro-text" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {node.user}
                            </h2>
                            <p className="text-sm text-neuro-muted">UID: {node.id.toUpperCase()}</p>
                            {node.accountNumber && (
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-neuro-muted/70 font-mono tracking-wider">
                                        {showAccountNumber ? node.accountNumber : getMaskedAccountNumber(node.accountNumber)}
                                    </p>
                                    <button
                                        onClick={() => setShowAccountNumber(!showAccountNumber)}
                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                    >
                                        {showAccountNumber ? (
                                            <Eye className="w-3 h-3 text-neuro-accent" />
                                        ) : (
                                            <EyeOff className="w-3 h-3 text-neuro-accent" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-6 h-6 text-neuro-muted hover:text-white" />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-12 gap-6">
                    {/* Left Column: Risk & Stats */}
                    <div className="col-span-12 md:col-span-4 space-y-6">

                        {/* Risk Gauge */}
                        <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center relative bg-neuro-bg/50">
                            <h3 className="text-sm font-semibold text-neuro-muted mb-2 uppercase tracking-wide">Risk Score</h3>
                            <div className="w-40 h-24 relative overflow-hidden"> {/* Half circle container */}
                                <ResponsiveContainer width="100%" height={160}> {/* Render full circle but hide bottom half via container */}
                                    <PieChart>
                                        <Pie
                                            data={riskData}
                                            cx="50%"
                                            cy="50%" // Center vertically in container, but container is clipped
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={0}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {riskData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                                    <span className="text-3xl font-bold text-white">{node.risk}</span>
                                    <span className="text-xs text-neuro-muted">/ 100</span>
                                </div>
                            </div>
                            {/* Status Badge */}
                            <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold border ${riskBadgeStyle}`}>
                                {riskLabel}
                            </div>
                        </div>

                        {/* ML Flags */}
                        <div className="space-y-2">
                            <h3 className="text-xs font-semibold text-neuro-muted uppercase">ML Detected Flags</h3>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-neuro-text flex items-center gap-1">
                                    <AlertOctagon className="w-3 h-3 text-neuro-accent" /> Anomaly
                                </span>
                                <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-neuro-text">
                                    Sudden Spike
                                </span>
                                {node.risk > 80 && (
                                    <span className="px-2 py-1 rounded bg-neuro-danger/10 border border-neuro-danger/30 text-xs text-neuro-danger shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                                        Circular Pattern
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Transactions & Actions */}
                    <div className="col-span-12 md:col-span-8 flex flex-col h-full">
                        <h3 className="text-sm font-semibold text-neuro-muted mb-3 uppercase tracking-wide">Recent Activity</h3>
                        <div className="flex-1 bg-neuro-lighter/30 rounded-xl border border-neuro-border overflow-hidden mb-6">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5 text-neuro-muted font-medium border-b border-neuro-border">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Counterparty</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neuro-border">
                                    {displayTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 text-neuro-text">{tx.date}</td>
                                            <td className="px-4 py-3 text-neuro-text">{tx.to}</td>
                                            <td className={`px-4 py-3 font-medium ${tx.type === 'OUT' ? 'text-neuro-warning' : 'text-neuro-success'}`}>
                                                {tx.type}
                                            </td>
                                            <td className="px-4 py-3 text-right text-white font-mono">{tx.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 mt-auto">
                            <button className="flex items-center justify-center gap-2 py-3 rounded-lg bg-neuro-danger hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-900/20 transition-all active:scale-[0.98]">
                                <Lock className="w-5 h-5" /> Freeze Account
                            </button>
                            <button
                                onClick={handleGenerateReport}
                                className="flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
                            >
                                <FileText className="w-5 h-5" /> Generate Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NodeDetails;
