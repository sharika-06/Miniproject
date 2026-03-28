import React, { useState } from 'react';
import { LayoutDashboard, FolderOpen, Sliders, Calendar, DollarSign, Activity, FileText, Bell, HelpCircle, Download, ShieldAlert } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const { viewMode, setViewMode, triggerExport, setDateRange, amountFilter, setAmountFilter } = useDashboard();
    const [showAmountDropdown, setShowAmountDropdown] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [isHovered, setIsHovered] = useState(false);

    const navItems = [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { label: 'Cases', icon: FolderOpen, path: '/dashboard', viewMode: 'cases' },
        { label: 'Risks', icon: ShieldAlert, path: '/dashboard', viewMode: 'risks' },
        { label: 'Audit Log', icon: FileText, path: '/audit-log' },
        { label: 'Notifications', icon: Bell, path: '/notifications' },
        { label: 'Settings', icon: Sliders, path: '/settings' },
        { label: 'Help', icon: HelpCircle, path: '/help' },
    ];

    return (
        <aside className="fixed left-4 top-24 bottom-4 w-20 hover:w-64 transition-all duration-300 group glass-panel z-50 flex flex-col font-sans rounded-2xl overflow-hidden">
            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2">
                {navItems.map((item) => {
                    const isAtPath = location.pathname === item.path || (item.path === '/dashboard' && location.pathname === '/upload');
                    const isActive = isAtPath && (!item.viewMode || viewMode === item.viewMode);
                    return (
                        <button
                            key={item.label}
                            onClick={() => {
                                navigate(item.path);
                                if (item.viewMode) setViewMode(item.viewMode);
                                else if (item.path === '/dashboard') setViewMode('graph');
                            }}
                            className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-200 relative
                            ${isActive ? 'text-neuro-accent' : 'text-neuro-muted hover:text-white hover:bg-white/5'}`}
                        >
                            <item.icon className={`min-w-[20px] h-5 transition-colors ${isActive ? 'text-neuro-accent drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-neuro-muted'}`} />
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap font-medium text-sm">
                                {item.label}
                            </span>

                            {/* Active Indicator Line */}
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-neuro-accent rounded-r-full shadow-[0_0_10px_#3B82F6]"></div>
                            )}
                        </button>
                    );
                })}

                <div className="my-4 border-t border-neuro-border mx-4"></div>

                {/* Filter Section - Only visible on expand */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-4 space-y-6">
                    <h3 className="text-xs font-bold text-neuro-muted uppercase tracking-widest pl-2">Filters</h3>

                    {/* Date Filter */}
                    <div className="space-y-1">
                        <label className="text-[10px] text-neuro-muted flex items-center gap-2 uppercase tracking-wide px-2">
                            <Calendar className="w-3 h-3" /> Date Range
                        </label>
                        <input
                            type="date"
                            className="w-full bg-neuro-bg/50 border border-neuro-border rounded px-3 py-2 text-xs text-neuro-text focus:outline-none focus:border-neuro-accent/50 transition-colors"
                            onChange={(e) => setDateRange(e.target.value)}
                        />
                    </div>

                    {/* Amount Filter */}
                    <div className="space-y-1 relative">
                        <label className="text-[10px] text-neuro-muted flex items-center gap-2 uppercase tracking-wide px-2">
                            <DollarSign className="w-3 h-3" /> Amount
                        </label>

                        <button
                            onClick={() => setShowAmountDropdown(!showAmountDropdown)}
                            className="w-full text-left bg-neuro-bg/50 border border-neuro-border rounded px-3 py-2 text-xs text-neuro-text flex justify-between items-center hover:border-neuro-accent/30 transition-colors"
                        >
                            <span>{amountFilter === 50000 ? 'All Ranges' : amountFilter}</span>
                            <span className="text-[10px] transform rotate-90 opacity-50">›</span>
                        </button>

                        {/* Dropdown */}
                        {showAmountDropdown && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-neuro-card border border-neuro-border rounded-lg shadow-xl z-50 overflow-hidden animate-fade-in-up">
                                {['All Ranges', '< 1 Lakh', '1 Lakh - 50 Lakhs', '> 50 Lakhs'].map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => {
                                            setAmountFilter(range);
                                            setShowAmountDropdown(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-xs text-neuro-text hover:bg-neuro-lighter hover:text-neuro-text transition-colors flex items-center justify-between"
                                    >
                                        {range}
                                        {amountFilter === range && <div className="w-1.5 h-1.5 rounded-full bg-neuro-accent shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Export Section */}
            <div className="p-4 border-t border-neuro-border bg-neuro-lighter/20">
                <button
                    onClick={triggerExport}
                    className="w-full flex items-center justify-start gap-4 px-2 py-2 rounded-lg text-neuro-text hover:bg-neuro-accent/10 hover:text-neuro-accent transition-all group/btn"
                >
                    <Download className="min-w-[20px] h-5" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-semibold whitespace-nowrap">Export Report</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
