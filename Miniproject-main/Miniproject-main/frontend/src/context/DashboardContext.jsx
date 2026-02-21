import React, { createContext, useContext, useState, useEffect } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => useContext(DashboardContext);

export const DashboardProvider = ({ children }) => {
    const [viewMode, setViewMode] = useState('graph'); // 'graph' | 'table' | 'split' | 'cases'
    const [theme, setTheme] = useState('dark');
    const [dateRange, setDateRange] = useState('Last 24 Hours');
    const [amountFilter, setAmountFilter] = useState(50000);
    const [showPDFExport, setShowPDFExport] = useState(false);
    const [focusNodes, setFocusNodes] = useState([]); // Nodes to zoom into

    // Apply theme
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
    }, [theme]);

    const triggerExport = () => {
        setShowPDFExport(true);
        setTimeout(() => setShowPDFExport(false), 500);
    };

    const locateLoop = (nodeIds) => {
        setFocusNodes(nodeIds);
        setViewMode('graph'); // Force switch to graph if not already
        // Reset after generic delay so it can be re-triggered? 
        // Or handle inside GraphCanvas to consume and clear.
    };

    return (
        <DashboardContext.Provider value={{
            viewMode,
            setViewMode,
            theme,
            setTheme,
            dateRange,
            setDateRange,
            amountFilter,
            setAmountFilter,
            showPDFExport,
            triggerExport,
            focusNodes,
            setFocusNodes,
            locateLoop
        }}>
            {children}
        </DashboardContext.Provider>
    );
};
