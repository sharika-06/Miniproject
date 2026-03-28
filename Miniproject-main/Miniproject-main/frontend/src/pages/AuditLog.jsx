import React, { useState, useEffect } from 'react';
import { FileText, Clock, User, Activity, Search } from 'lucide-react';
import { api } from '../services/api';

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const email = localStorage.getItem('userEmail');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const result = await api.getAuditLogs(email);
            if (result.success) {
                setLogs(result.data);
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log =>
        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-8 text-neuro-muted">Loading audit logs...</div>;

    return (
        <div className="p-8 animate-fade-in max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold text-neuro-text flex items-center gap-2">
                    <FileText className="text-neuro-accent" /> My Audit Log
                </h1>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neuro-muted" />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-neuro-card/50 border border-neuro-border rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-neuro-accent"
                    />
                </div>
            </div>

            <div className="glass-panel border border-neuro-border rounded-2xl overflow-hidden bg-neuro-card/30">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-neuro-lighter/20 border-b border-neuro-border">
                                <th className="px-6 py-4 text-[10px] font-bold text-neuro-muted uppercase tracking-wider">Activity</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-neuro-muted uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-neuro-muted uppercase uint-wider">User</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-neuro-muted uppercase tracking-wider">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neuro-border">
                            {filteredLogs.length > 0 ? (
                                filteredLogs.map((log) => (
                                    <tr key={log.id} className="hover:bg-neuro-lighter/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-neuro-accent/10 flex items-center justify-center border border-neuro-accent/20">
                                                    <Activity className="h-4 w-4 text-neuro-accent" />
                                                </div>
                                                <span className="text-xs font-bold text-neuro-text">{log.action}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] text-neuro-muted font-medium break-all max-w-xs block">
                                                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-5 w-5 rounded-full bg-neuro-muted/20 flex items-center justify-center">
                                                    <User className="h-3 w-3 text-neuro-muted" />
                                                </div>
                                                <span className="text-[10px] text-neuro-muted">{log.user_email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-neuro-muted">
                                                <Clock className="h-3 w-3" />
                                                <span className="text-[10px] font-medium">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-neuro-muted text-xs italic">
                                        No activity logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AuditLog;
