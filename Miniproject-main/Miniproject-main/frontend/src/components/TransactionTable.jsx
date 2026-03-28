import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export function TransactionTable({ transactions, onRowClick }) {
    return (
        <div className="h-full w-full bg-neuro-card border-t border-neuro-border overflow-y-auto custom-scrollbar animate-fade-in-up">
            <table className="w-full text-left border-collapse">
                <thead className="bg-neuro-lighter sticky top-0 z-10">
                    <tr>
                        <th className="p-3 text-xs font-bold text-neuro-muted uppercase tracking-wider">Date</th>
                        <th className="p-3 text-xs font-bold text-neuro-muted uppercase tracking-wider">Source</th>
                        <th className="p-3 text-xs font-bold text-neuro-muted uppercase tracking-wider">Target</th>
                        <th className="p-3 text-xs font-bold text-neuro-muted uppercase tracking-wider">Amount</th>
                        <th className="p-3 text-xs font-bold text-neuro-muted uppercase tracking-wider">Type</th>
                        <th className="p-3 text-xs font-bold text-neuro-muted uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neuro-border">
                    {transactions.map((tx, idx) => (
                        <tr
                            key={tx.id || idx}
                            onClick={() => onRowClick && onRowClick(tx)}
                            className="hover:bg-neuro-lighter/10 cursor-pointer transition-colors"
                        >
                            <td className="p-3 text-sm text-neuro-text font-mono">{new Date(tx.timestamp).toLocaleString()}</td>
                            <td className="p-3 text-sm text-neuro-text">{tx.source?.id || tx.source}</td>
                            <td className="p-3 text-sm text-neuro-text">
                                <span className="flex items-center gap-1">
                                    <ArrowUpRight className="h-3 w-3 text-neuro-muted" />
                                    {tx.target?.id || tx.target}
                                </span>
                            </td>
                            <td className="p-3 text-sm font-bold text-white">₹ {(tx.amount || 0).toLocaleString()}</td>
                            <td className="p-3 text-xs">
                                <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded">Transfer</span>
                            </td>
                            <td className="p-3 text-xs">
                                {tx.status === 'Suspicious' || tx.isLoop ? (
                                    <span className="bg-red-500/10 text-red-400 border-red-500/20 px-2 py-0.5 rounded flex w-fit items-center gap-1">
                                        ⚠️ {tx.status || 'Suspicious'}
                                    </span>
                                ) : (
                                    <span className="text-green-500">{tx.status || 'Completed'}</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan="6" className="p-8 text-center text-neuro-muted italic">
                                No transactions found in this time range.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
