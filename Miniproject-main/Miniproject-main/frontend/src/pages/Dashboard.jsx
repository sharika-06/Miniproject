import React, { useState, useEffect, useMemo, useRef } from 'react';
import GraphCanvas from '../components/dashboard/GraphCanvas';
import AlertsFeed from '../components/dashboard/AlertsFeed';
import NodeDetails from '../components/dashboard/NodeDetails';
import CaseFiles from '../components/dashboard/CaseFiles';
import DashboardToolbar from '../components/dashboard/DashboardToolbar';
import { TransactionTable } from '../components/TransactionTable';
import { api } from '../services/api';
import { Play, Pause, RotateCcw, Activity, Network } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useDashboard } from '../context/DashboardContext';

const Dashboard = () => {
    const { viewMode, setViewMode, showPDFExport, focusNodes, locateLoop } = useDashboard();
    const [selectedNode, setSelectedNode] = useState(null);
    const [currentTime, setCurrentTime] = useState(null);

    const [backendData, setBackendData] = useState(null);
    const [alerts, setAlerts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Data on Load
    useEffect(() => {
        const loadData = async () => {
            try {
                console.log("Fetching dashboard data...");
                const res = await api.getGraph();
                console.log("Dashboard API Response:", res);
                if (res.success) {
                    setBackendData(res.data);
                } else {
                    setError("Failed to load data from server.");
                }

                // Fetch Alerts
                const alertsRes = await api.getAlerts();
                if (alertsRes.success) {
                    setAlerts(alertsRes.data);
                }
            } catch (err) {
                console.error("Failed to load dashboard data", err);
                setError(err.message || "Network Error");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Data Management
    const allData = useMemo(() => {
        if (!backendData) return { nodes: [], links: [], transactions: [] };
        return backendData;
    }, [backendData]);

    // Initialize time range
    const timeRange = useMemo(() => {
        if (!backendData?.metadata?.minDate || !backendData?.metadata?.maxDate) {
            return { start: Date.now(), end: Date.now(), duration: 0 };
        }
        const start = new Date(backendData.metadata.minDate).getTime();
        const end = new Date(backendData.metadata.maxDate).getTime();
        return { start, end, duration: end - start };
    }, [backendData]);

    // Handle PDF Export Trigger from Context
    useEffect(() => {
        if (showPDFExport) {
            handleExport();
        }
    }, [showPDFExport]);

    // Set initial time
    useEffect(() => {
        if (timeRange.start && !currentTime) {
            setCurrentTime(timeRange.end); // Start at the end
        }
    }, [timeRange, currentTime]);

    // Derived Data
    const filteredData = useMemo(() => {
        if (!currentTime) return allData;
        const cutoff = new Date(currentTime).toISOString();

        // Filter transactions
        const activeTransactions = allData.transactions.filter(t => t.timestamp <= cutoff);

        // Derived Graph Data
        const activeNodeIds = new Set();
        activeTransactions.forEach(tx => {
            activeNodeIds.add(tx.source);
            activeNodeIds.add(tx.target);
        });

        const nodes = allData.nodes.filter(n => activeNodeIds.has(n.id) || n.group === 'fraud'); // Always show suspects

        const activeNodeIdCheck = new Set(nodes.map(n => n.id));
        const links = allData.links.filter(l => {
            const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
            const targetId = typeof l.target === 'object' ? l.target.id : l.target;
            return activeNodeIdCheck.has(sourceId) && activeNodeIdCheck.has(targetId);
        });

        return {
            nodes,
            links,
            transactions: activeTransactions
        };
    }, [allData, currentTime]);

    const handleNodeClick = (node) => {
        setSelectedNode(node);
    };

    const handleExport = async () => {
        const element = document.getElementById('dashboard-content');
        if (!element) return;

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('investigation-report.pdf');
    };

    const formatTime = (ms) => {
        if (!ms) return '--:--';
        return new Date(ms).toLocaleDateString("en-US", { month: 'short', day: '2-digit' });
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-neuro-accent/30 border-t-neuro-accent rounded-full animate-spin"></div>
                    <p className="text-neuro-muted animate-pulse">Loading NeuroGraph Data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="glass-panel p-8 rounded-2xl text-center max-w-md">
                    <div className="text-neuro-danger mb-4 text-4xl">⚠️</div>
                    <h2 className="text-xl font-bold text-white mb-2">Data Load Error</h2>
                    <p className="text-neuro-muted mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-neuro-accent/20 hover:bg-neuro-accent/30 text-neuro-accent rounded-lg border border-neuro-accent/50 transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col gap-6 relative" id="dashboard-content">
            {/* Bento Grid Layout - Vaulta Style */}
            <div className="flex-1 grid grid-cols-12 grid-rows-[auto_1fr] gap-6 min-h-0 p-2">

                {/* Top Row: Metrics Cards (Bento Blocks) */}
                {viewMode !== 'cases' && (
                    <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6 h-28">
                        {/* Metric 1 */}
                        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '0ms' }}>
                            <div className="absolute top-0 right-0 p-4 opacity-50"><Activity className="text-neuro-accent w-6 h-6" /></div>
                            <h3 className="text-neuro-muted text-xs font-bold uppercase tracking-widest mb-1">Total Transactions</h3>
                            <div className="text-2xl font-bold text-neuro-text tracking-tight">{filteredData.transactions.length.toLocaleString()}</div>
                            <div className="text-xs text-neuro-success mt-2 flex items-center gap-1">↑ 12% <span className="text-neuro-muted">vs last week</span></div>
                        </div>

                        {/* Metric 2 */}
                        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <div className="absolute top-0 right-0 p-4 opacity-50"><RotateCcw className="text-neuro-danger w-6 h-6" /></div>
                            <h3 className="text-neuro-muted text-xs font-bold uppercase tracking-widest mb-1">Active Loops</h3>
                            <div className="text-2xl font-bold text-neuro-text tracking-tight">
                                {alerts.filter(a => a.status === 'Active Loop').length > 0
                                    ? `${alerts.filter(a => a.status === 'Active Loop').length}`
                                    : 'None'}
                            </div>
                            <div className="text-xs text-neuro-danger mt-2 flex items-center gap-1">
                                {alerts.filter(a => a.status === 'Active Loop').length > 0
                                    ? 'Critical: Cycle Detected'
                                    : 'No Cycles Found'}
                            </div>
                        </div>

                        {/* Metric 3 */}
                        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            <div className="absolute top-0 right-0 p-4 opacity-50"><Network className="text-neuro-warning w-6 h-6" /></div>
                            <h3 className="text-neuro-muted text-xs font-bold uppercase tracking-widest mb-1">Risk Level</h3>

                            {/* Dynamic Risk Calculation */}
                            {(() => {
                                const activeLoops = alerts.filter(a => a.status === 'Active Loop').length;
                                const isHighRisk = activeLoops > 0;
                                return (
                                    <>
                                        <div className={`text-2xl font-bold tracking-tight ${isHighRisk ? 'text-neuro-danger' : 'text-neuro-success'}`}>
                                            {isHighRisk ? 'High' : 'Low'}
                                        </div>
                                        <div className="w-full bg-neuro-muted/20 h-1 mt-3 rounded-full overflow-hidden">
                                            <div className={`h-full transition-all duration-500 ${isHighRisk ? 'bg-neuro-danger w-[85%]' : 'bg-neuro-success w-[15%]'}`}></div>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {/* Main Content Area (Hero Graph / Tables) */}
                <div className={`transition-all duration-300 ${viewMode !== 'cases' ? 'col-span-12 lg:col-span-9' : 'col-span-12'} h-full min-h-0`}>
                    {viewMode === 'cases' ? (
                        <CaseFiles />
                    ) : (
                        <div className="h-full glass-panel rounded-2xl relative overflow-hidden flex flex-col shadow-2xl animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                            {/* Header / Tabs */}
                            <div className="h-12 border-b border-neuro-border flex items-center px-4 bg-neuro-lighter/20 backdrop-blur-md justify-between">
                                <span className="text-xs font-bold text-neuro-accent uppercase tracking-widest flex items-center gap-2">
                                    <Network className="w-4 h-4" /> Investigation Canvas
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-neuro-success animate-pulse"></div>
                                    <span className="text-[10px] text-neuro-muted uppercase">Live Stream</span>
                                </div>
                            </div>

                            {/* View Content */}
                            <div className="flex-1 relative overflow-hidden bg-neuro-bg/40">
                                {/* Darker background for graph container as requested */}
                                {viewMode === 'graph' && (
                                    <GraphCanvas
                                        graphData={filteredData}
                                        onNodeClick={handleNodeClick}
                                        focusNodes={focusNodes}
                                    />
                                )}
                                {viewMode === 'table' && (
                                    <TransactionTable transactions={filteredData.transactions} />
                                )}
                                {viewMode === 'split' && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                                        <div className="border-r border-neuro-border relative bg-neuro-bg/40">
                                            <GraphCanvas graphData={filteredData} onNodeClick={handleNodeClick} focusNodes={focusNodes} />
                                        </div>
                                        <div className="overflow-hidden bg-neuro-bg/50">
                                            <TransactionTable transactions={filteredData.transactions} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Time Line Slider */}
                            <div className="h-16 border-t border-white/5 bg-[#020617]/90 backdrop-blur-md flex items-center px-4 gap-4 z-10">
                                <div className="flex-1 flex flex-col justify-center relative">
                                    <div className="flex justify-between text-[10px] text-neuro-muted font-mono mb-1">
                                        <span>{formatTime(timeRange.start)}</span>
                                        <span className="text-neuro-accent font-bold">{formatTime(currentTime)}</span>
                                        <span>{formatTime(timeRange.end)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={timeRange.start}
                                        max={timeRange.end}
                                        value={currentTime || timeRange.start}
                                        onChange={(e) => setCurrentTime(Number(e.target.value))}
                                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-neuro-accent hover:accent-neuro-accent/80 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div >

                {/* Right Sidebar: Live Alerts */}
                {
                    viewMode !== 'cases' && (
                        <div className="col-span-12 lg:col-span-3 h-full glass-panel rounded-2xl overflow-hidden shadow-xl flex flex-col animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                            <div className="p-4 border-b border-white/5 bg-white/5 backdrop-blur-md">
                                <h3 className="text-xs font-bold text-neuro-text uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-neuro-danger" /> Live Alerts
                                </h3>
                            </div>
                            <div className="flex-1 overflow-hidden relative">
                                <AlertsFeed alerts={alerts} onLocate={locateLoop} />
                            </div>
                        </div>
                    )
                }
            </div >

            {/* Node Details Overlay */}
            {
                selectedNode && (
                    <NodeDetails
                        node={selectedNode}
                        transactions={allData.transactions.filter(t => t.source === selectedNode.id || t.target === selectedNode.id)}
                        onClose={() => setSelectedNode(null)}
                    />
                )
            }
        </div >
    );
};

import { ErrorBoundary } from '../components/ErrorBoundary';

const DashboardWithBoundary = () => (
    <ErrorBoundary>
        <Dashboard />
    </ErrorBoundary>
);

export default DashboardWithBoundary;
