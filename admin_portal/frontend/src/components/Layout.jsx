import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
    return (
        <div style={{ display: 'flex', height: '100vh', background: 'radial-gradient(circle at top right, #1e1b4b, #0f172a)' }}>
            <Sidebar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <Topbar />
                <main style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem 0' }}>
                    <div className="glass-panel" style={{ minHeight: '100%', padding: '2rem' }}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
