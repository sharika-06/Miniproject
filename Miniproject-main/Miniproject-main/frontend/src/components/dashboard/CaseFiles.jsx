import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { FolderOpen, Calendar, MoreVertical, CreditCard, ShieldAlert, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import CaseDetails from './CaseDetails';

const CaseFiles = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCase, setSelectedCase] = useState(null);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const response = await api.getCases();
                if (response.success) {
                    setCases(response.data);
                } else {
                    setError('Failed to load cases');
                }
            } catch (err) {
                console.error('Error fetching cases:', err);
                setError('Error connecting to server');
            } finally {
                setLoading(false);
            }
        };

        fetchCases();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12 text-neuro-muted animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span>Loading investigation files...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center p-12 text-neuro-danger border border-neuro-danger/20 rounded-xl bg-neuro-danger/5">
                <ShieldAlert className="w-6 h-6 mr-2" />
                <span>{error}</span>
            </div>
        );
    }

    if (cases.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-neuro-muted border border-white/5 rounded-xl bg-white/5">
                <FolderOpen className="w-12 h-12 mb-4 opacity-50" />
                <p>No active cases found.</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
                {cases.map((c) => (
                    <Card
                        key={c.id}
                        onClick={() => setSelectedCase(c)}
                        className="p-4 bg-[#121212] border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer group hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-2xl hover:shadow-white/5"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-[#1F1F1F] text-white group-hover:bg-white group-hover:text-black transition-colors duration-300">
                                <FolderOpen size={24} />
                            </div>
                            <button className="text-[#888888] hover:text-white transition-colors">
                                <MoreVertical size={16} />
                            </button>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-[#E0E0E0] transition-colors">{c.name}</h3>
                        <p className="text-xs text-[#888888] mb-4">Case ID: {c.id}</p>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center text-xs text-[#888888] gap-2">
                                <Calendar size={14} />
                                <span>Opened: {c.date}</span>
                            </div>
                            <div className="flex items-center text-xs text-[#888888] gap-2">
                                <CreditCard size={14} />
                                <span>{c.entities} Entities Involved</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${c.risk === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                c.risk === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                    'bg-green-500/10 text-green-500 border-green-500/20'
                                }`}>
                                {c.risk} Risk
                            </span>
                            <span className="text-xs font-semibold text-white">{c.status}</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Case Details Modal */}
            {selectedCase && (
                <CaseDetails
                    caseData={selectedCase}
                    onClose={() => setSelectedCase(null)}
                    onResolve={() => {
                        setSelectedCase(null);
                        const fetchCases = async () => {
                            try {
                                const response = await api.getCases();
                                if (response.success) {
                                    setCases(response.data);
                                }
                            } catch (err) {
                                console.error('Error refreshing cases:', err);
                            }
                        };
                        fetchCases();
                    }}
                />
            )}
        </>
    );
};

export default CaseFiles;
