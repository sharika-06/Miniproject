import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-neuro-bg text-neuro-text font-sans selection:bg-neuro-accent/30 font-sans">
            {/* Background Gradient Mesh - Deep Obsidian Vaulta Style */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[128px] opacity-40 mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-slate-800/20 rounded-full blur-[128px] opacity-40 mix-blend-screen"></div>
            </div>

            <Navbar />
            <Sidebar />

            <main className="pl-24 pt-24 min-h-screen relative z-10 transition-all duration-300">
                <div className="p-6 h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
