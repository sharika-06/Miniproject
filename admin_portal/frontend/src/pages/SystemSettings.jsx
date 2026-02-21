import React, { useState } from 'react';

const SystemSettings = () => {
    const [settings, setSettings] = useState({
        platformName: 'NeuGraph',
        timezone: 'UTC+1',
        emailPrefix: false,
        twoFactorAuth: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        console.log('Saving settings:', settings);
        // TODO: Connect to backend
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold' }}>System Settings</h1>
                <p className="text-gray">Manage your platform's core configurations</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>General Settings</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Platform Name</label>
                            <input
                                type="text"
                                name="platformName"
                                value={settings.platformName}
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
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Notifications</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: '500' }}>Email Prefix</p>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>Enable Two-Factor Email Notifications</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    name="emailPrefix"
                                    checked={settings.emailPrefix}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ margin: 0, fontWeight: '500' }}>Two-Factor Authentication</p>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#94a3b8' }}>Require 2FA for all admin accounts</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    name="twoFactorAuth"
                                    checked={settings.twoFactorAuth}
                                    onChange={handleChange}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#94a3b8' }}>Cancel</button>
                <button onClick={handleSave} className="btn-primary" style={{ width: 'auto', padding: '0.75rem 2rem' }}>Save Changes</button>
            </div>

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
