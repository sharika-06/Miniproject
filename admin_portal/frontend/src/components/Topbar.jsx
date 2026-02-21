import React from 'react';
import { Bell, Search } from 'lucide-react';

const Topbar = () => {
    return (
        <div className="glass-panel" style={{
            margin: '1rem 1rem 1rem 0',
            padding: '1rem 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Overview</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="form-input"
                        style={{ marginBottom: 0, paddingLeft: '36px', width: '250px' }}
                    />
                </div>

                <div style={{ position: 'relative' }}>
                    <Bell size={20} />
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontWeight: '600' }}>Admin User</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>Super Admin</p>
                    </div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#334155' }}></div>
                </div>
            </div>
        </div>
    );
};

export default Topbar;
