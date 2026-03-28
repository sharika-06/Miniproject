import React, { useState, useEffect } from 'react';
import { Save, User, Mail, Bell, Moon } from 'lucide-react';
import { api } from '../services/api';

const AccountSettings = () => {
    const [settings, setSettings] = useState({
        theme: 'dark',
        email_notifications: true,
        two_factor_enabled: false
    });
    const [user, setUser] = useState({
        name: localStorage.getItem('userName') || 'User',
        email: localStorage.getItem('userEmail') || ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const email = localStorage.getItem('userEmail');
            if (!email) return;
            const result = await api.getSettings(email);
            if (result.success) {
                setSettings(result.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const email = localStorage.getItem('userEmail');
            const result = await api.updateSettings({ ...settings, email });
            if (result.success) {
                setMessage('Settings updated successfully!');
                // Apply theme if changed
                if (settings.theme === 'dark') {
                    document.documentElement.classList.remove('light');
                } else {
                    document.documentElement.classList.add('light');
                }
                localStorage.setItem('theme', settings.theme);
            }
        } catch (error) {
            setMessage('Failed to update settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-neuro-muted">Loading settings...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold mb-8 text-neuro-text flex items-center gap-2">
                <User className="text-neuro-accent" /> Account Settings
            </h1>

            <div className="glass-panel border border-neuro-border rounded-2xl p-8 bg-neuro-card/50">
                <form onSubmit={handleSave} className="space-y-6">
                    {/* Profile Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-neuro-border">
                        <div>
                            <label className="block text-xs font-semibold text-neuro-muted uppercase mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neuro-muted" />
                                <input
                                    type="text"
                                    value={user.name}
                                    readOnly
                                    className="w-full bg-neuro-bg/50 border border-neuro-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-neuro-muted cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-neuro-muted uppercase mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neuro-muted" />
                                <input
                                    type="email"
                                    value={user.email}
                                    readOnly
                                    className="w-full bg-neuro-bg/50 border border-neuro-border rounded-xl py-2.5 pl-10 pr-4 text-sm text-neuro-muted cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-neuro-lighter/20 transition-colors">
                            <div className="flex items-center gap-3">
                                <Moon className="h-5 w-5 text-neuro-accent" />
                                <div>
                                    <div className="text-sm font-medium">Dark Mode</div>
                                    <div className="text-xs text-neuro-muted">Use dark theme across the application</div>
                                </div>
                            </div>
                            <select
                                value={settings.theme}
                                onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                                className="bg-neuro-bg border border-neuro-border rounded-lg px-3 py-1.5 text-xs text-neuro-text focus:outline-none focus:border-neuro-accent"
                            >
                                <option value="dark">Enabled</option>
                                <option value="light">Disabled</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl hover:bg-neuro-lighter/20 transition-colors">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-neuro-accent" />
                                <div>
                                    <div className="text-sm font-medium">Email Notifications</div>
                                    <div className="text-xs text-neuro-muted">Receive security alerts and reports via email</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.email_notifications}
                                    onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-neuro-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neuro-accent"></div>
                            </label>
                        </div>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-xl text-xs font-medium ${message.includes('success') ? 'bg-neuro-success/10 text-neuro-success' : 'bg-neuro-danger/10 text-neuro-danger'}`}>
                            {message}
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 bg-neuro-accent hover:bg-neuro-accent/80 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;
