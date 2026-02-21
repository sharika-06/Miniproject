import { X } from 'lucide-react';
import { clsx } from 'clsx';

export function AccountProfile({ onClose, accountData }) {
    if (!accountData) return null;

    const riskScore = accountData.riskScore || 15; // Default low risk
    const isHighRisk = riskScore > 75;

    return (
        <div className="w-[500px] bg-neuro-card/95 backdrop-blur-md border border-neuro-border rounded-lg shadow-2xl overflow-hidden font-sans text-neuro-text fade-in-scale">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neuro-border bg-neuro-lighter/5">
                <span className="font-medium tracking-wide text-sm">Account Profile</span>
                <button onClick={onClose} className="hover:text-neuro-text transition-colors">
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-6">

                {/* Account Details */}
                <div className="space-y-1">
                    <div className="text-sm">Account Number : <span className="font-mono text-neuro-muted">{accountData.id}</span></div>
                    <div className="text-sm">Type : <span className="text-neuro-text capitalize">{accountData.type || 'Individual'}</span></div>
                </div>

                <div className="h-px w-full bg-neuro-border"></div>

                {/* Risk Score */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span>Risk Score (ML Model)</span>
                        <span className={`font-bold ${isHighRisk ? 'text-red-500' : 'text-green-500'}`}>{riskScore}/100</span>
                    </div>
                    {/* Progress Bar Container */}
                    <div className="relative h-2 w-full bg-neuro-lighter rounded-full mt-2">
                        {/* Gradient Bar */}
                        <div
                            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                            style={{ width: `${riskScore}%` }}
                        ></div>
                        {/* Triangular Indicator */}
                        <div
                            className="absolute top-2 -ml-1.5 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[8px] border-b-neuro-text transform rotate-180 transition-all duration-500"
                            style={{ left: `${riskScore}%` }}
                        ></div>
                    </div>

                    <div className="text-sm mt-4">
                        <span className="text-xs text-neuro-muted block mb-2">Anomaly Indicators:</span>
                        <div className="flex flex-wrap gap-2">
                            {isHighRisk ? (
                                <>
                                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] border border-red-500/30">⚠️ Unusually Large Transfer</span>
                                    <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-[10px] border border-red-500/30">⚠️ Rapid Velocity</span>
                                    <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-400 text-[10px] border border-orange-500/30">⚠️ Circular Pattern</span>
                                </>
                            ) : (
                                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] border border-green-500/30">✓ Normal Activity</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="h-px w-full bg-neuro-border"></div>

                {/* Recent Transactions */}
                <div className="h-32 bg-neuro-bg/20 rounded border border-neuro-border p-3">
                    <span className="text-xs text-neuro-muted">Recent Transactions (Last 5)</span>
                    {/* Placeholder for list */}
                </div>

                <div className="h-px w-full bg-neuro-border"></div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <span className="text-xs text-neuro-muted w-16">Actions:</span>
                    <button className="flex-1 bg-neuro-lighter/5 hover:bg-neuro-lighter/10 border border-neuro-border text-neuro-text py-2 rounded text-xs transition-colors">
                        Freeze Act
                    </button>
                    <button onClick={onClose} className="flex-1 bg-neuro-lighter/5 hover:bg-neuro-lighter/10 border border-neuro-border text-neuro-text py-2 rounded text-xs transition-colors">
                        Ignore
                    </button>
                </div>

            </div>
        </div>
    );
}
