import React from 'react';
import { LayoutDashboard, Settings, Users, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Admin Management', path: '/dashboard/admins' },
        { icon: Settings, label: 'System Settings', path: '/dashboard/settings' },
    ];

    return (
        <div className="glass-panel" style={{
            width: '250px',
            height: 'calc(100vh - 2rem)',
            margin: '1rem',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem'
        }}>
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-color)' }}></div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>NeuGraph</h2>
            </div>

            <nav style={{ flex: 1 }}>
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                padding: '0.75rem',
                                marginBottom: '0.5rem',
                                borderRadius: '8px',
                                background: isActive ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                color: isActive ? 'var(--primary-color)' : 'var(--text-color)',
                                textAlign: 'left'
                            }}
                        >
                            <Icon size={20} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            <button
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    color: '#ef4444',
                    background: 'transparent',
                    marginTop: 'auto'
                }}
                onClick={() => {
                    localStorage.removeItem('user');
                    window.location.href = 'http://localhost:5173';
                }}
            >
                <LogOut size={20} />
                Logout
            </button>
        </div>
    );
};

export default Sidebar;
