import React from 'react';

const DashboardHome = () => {
    return (
        <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1rem' }}>Dashboard Overview</h1>
            <p className="text-gray">Welcome to NeuGraph Admin Portal.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 className="text-gray text-sm">Total Users</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>1,234</p>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 className="text-gray text-sm">Active Sessions</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>56</p>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 className="text-gray text-sm">System Status</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>Healthy</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
