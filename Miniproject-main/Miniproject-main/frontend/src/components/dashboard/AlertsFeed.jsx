import React from 'react';
import { ArrowRight } from 'lucide-react';

const AlertsFeed = ({ alerts = [], onLocate }) => {
    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-neuro-border flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-neuro-danger animate-pulse"></div>
                <h2 className="font-semibold text-neuro-text">Live Fraud Alerts</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {alerts.length === 0 && (
                    <div className="text-center text-neuro-muted text-sm py-4">
                        No active alerts detected.
                    </div>
                )}

                {alerts.map((alert) => (
                    <div key={alert.id} className="rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden hover:-translate-y-1 transition-transform duration-300 shadow-lg group">
                        <div className={`${alert.type === 'Critical' ? 'bg-neuro-danger/10 text-neuro-danger' : 'bg-neuro-warning/10 text-neuro-warning'} px-4 py-2 border-b border-white/5 flex items-center justify-between`}>
                            <span className={`text-[10px] font-bold uppercase tracking-widest`}>{alert.title}</span>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${alert.type === 'Critical' ? 'bg-neuro-danger' : 'bg-neuro-warning'}`}></div>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="text-sm font-bold text-white">{alert.type} Alert</div>
                            </div>
                            <div className="text-[10px] text-neuro-muted font-mono flex items-center justify-between">
                                <span>{alert.time}</span>
                                {alert.status && <span className="text-neuro-warning">{alert.status}</span>}
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <div className="bg-black/20 rounded p-2 text-center">
                                    <div className="text-[10px] text-neuro-muted uppercase">Involved</div>
                                    <div className="text-xs font-bold text-white">{alert.involvedCount} Accts</div>
                                </div>
                                {alert.amount && (
                                    <div className="bg-black/20 rounded p-2 text-center">
                                        <div className="text-[10px] text-neuro-muted uppercase">Amount</div>
                                        <div className="text-xs font-bold text-white">{alert.amount}</div>
                                    </div>
                                )}
                                {alert.details && (
                                    <div className="bg-black/20 rounded p-2 text-center col-span-2">
                                        <div className="text-[10px] text-neuro-muted uppercase">Details</div>
                                        <div className="text-xs font-bold text-white">{alert.details}</div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => onLocate && alert.involvedNodeIds && onLocate(alert.involvedNodeIds)}
                                className={`w-full mt-2 py-2 rounded-lg border text-xs font-bold transition-all uppercase tracking-widest flex items-center justify-center gap-2 
                                    ${alert.type === 'Critical'
                                        ? 'border-neuro-danger/30 bg-neuro-danger/10 text-neuro-danger hover:bg-neuro-danger/20 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                        : 'border-neuro-warning/30 bg-neuro-warning/10 text-neuro-warning hover:bg-neuro-warning/20'
                                    }`}
                            >
                                {alert.type === 'Critical' ? 'Locate Loop' : 'View Details'} <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}

            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-neuro-border">
                <button className="w-full py-2.5 rounded bg-neuro-lighter hover:bg-white/5 text-neuro-text text-sm font-medium transition-colors border border-neuro-border">
                    View All History
                </button>
            </div>
        </div>
    );
};

export default AlertsFeed;
