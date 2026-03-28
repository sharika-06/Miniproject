import React, { useState, useEffect } from 'react';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        platform_name: '',
        timezone: 'UTC',
        email_prefix: false,
        two_factor_auth: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                const data = await res.json();

                // Parse booleans
                const parsed = {};
                Object.entries(data).forEach(([key, val]) => {
                    parsed[key] = val === 'true' ? true : val === 'false' ? false : val;
                });
                setSettings(parsed);
            } catch (error) {
                console.error('Error fetching settings:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Settings updated successfully!' });
                setTimeout(() => setMessage(null), 3000);
            } else {
                setMessage({ type: 'error', text: 'Failed to update settings.' });
            }
        } catch (error) {
            console.error('Save error:', error);
            setMessage({ type: 'error', text: 'Connection error.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>System Settings</h1>
                <p className="text-gray">Manage your platform's core configurations</p>
            </div>

            {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading configurations...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>General Settings</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Platform Name</label>
                                    <input
                                        type="text"
                                        name="platform_name"
                                        value={settings.platform_name}
                                        onChange={handleChange}
                                        className="form-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Time Zone</label>
                                    <select
                                        name="timezone"
                                        value={settings.timezone}
                                        onChange={handleChange}
                                        className="form-input"
                                    >
                                        <option value="UTC">UTC</option>
                                        <option value="UTC+1">UTC+1</option>
                                        <option value="EST">EST</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Security & Notifications</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '500' }}>Email Alerts</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>Enable high-priority email status updates</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            name="email_prefix"
                                            checked={settings.email_prefix}
                                            onChange={handleChange}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '500' }}>Strict Authentication</p>
                                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>Enforce multi-factor auth for all administrators</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            name="two_factor_auth"
                                            checked={settings.two_factor_auth}
                                            onChange={handleChange}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem' }}>
                        {message && (
                            <span style={{ color: message.type === 'success' ? '#10b981' : '#ef4444', fontSize: '0.875rem', fontWeight: 'bold' }}>
                                {message.text}
                            </span>
                        )}
                        <button style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#94a3b8' }}>Cancel</button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary"
                            style={{ width: 'auto', padding: '0.75rem 2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </>
            )}

            <style>{`
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }
        .switch input { 
          opacity: 0;
          width: 0;
          height: 0;
        }
        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #334155;
          transition: .4s;
          border-radius: 34px;
        }
        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .slider {
          background-color: var(--primary-color);
        }
        input:checked + .slider:before {
          transform: translateX(26px);
        }
      `}</style>
        </div>
    );
};

export default SystemSettings;
