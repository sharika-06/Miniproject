import React from 'react';
import { Layout, List, Columns, Download, FolderOpen, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

const DashboardToolbar = ({ viewMode, setViewMode, onExport }) => {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-neuro-card p-4 rounded-xl border border-neuro-border shadow-sm">
            {/* View Switcher */}
            <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
                <button
                    onClick={() => setViewMode('graph')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'graph'
                        ? 'bg-neuro-accent text-white shadow-lg shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                >
                    <Layout size={16} />
                    <span>Graph</span>
                </button>
                <button
                    onClick={() => setViewMode('table')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'table'
                        ? 'bg-neuro-accent text-white shadow-lg shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                >
                    <List size={16} />
                    <span>Table</span>
                </button>
                <button
                    onClick={() => setViewMode('split')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'split'
                        ? 'bg-neuro-accent text-white shadow-lg shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                >
                    <Columns size={16} />
                    <span>Split</span>
                </button>
                <button
                    onClick={() => setViewMode('cases')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'cases'
                        ? 'bg-neuro-accent text-white shadow-lg shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                >
                    <FolderOpen size={16} />
                    <span>Cases</span>
                </button>
                <button
                    onClick={() => setViewMode('risks')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'risks'
                        ? 'bg-neuro-accent text-white shadow-lg shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                >
                    <ShieldAlert size={16} />
                    <span>Risks</span>
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={onExport}
                    className="border-neuro-accent/50 text-neuro-accent hover:bg-neuro-accent/10"
                >
                    <Download size={16} className="mr-2" />
                    Export Report
                </Button>
            </div>
        </div>
    );
};

export default DashboardToolbar;
