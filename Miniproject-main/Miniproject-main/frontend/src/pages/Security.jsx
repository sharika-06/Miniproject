import React, { useState, useEffect } from 'react';
import { Shield, Lock, Smartphone, ChevronRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const Security = () => {
    const [twoFactor, setTwoFactor] = useState(false);
    const [saving, setSaving] = useState(false);
    const email = localStorage.getItem('userEmail');

    useEffect(() => {
        fetchSecurityStatus();
    }, []);

    const fetchSecurityStatus = async () => {
        try {
            const result = await api.getSettings(email);
            if (result.success) {
                setTwoFactor(result.data.two_factor_enabled);
            }
        } catch (error) {
            console.error('Error fetching security status:', error);
        }
    };

    const toggleTwoFactor = async () => {
        setSaving(true);
        try {
            const result = await api.updateSettings({
                email,
                two_factor_enabled: !twoFactor,
                // Keep existing settings
                theme: localStorage.getItem('theme') || 'dark',
                email_notifications: true
            });
            if (result.success) {
                setTwoFactor(!twoFactor);
            }
        } catch (error) {
            console.error('Error toggling 2FA:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold mb-8 text-neuro-text flex items-center gap-2">
                <Shield className="text-neuro-accent" /> Security & 2FA
            </h1>

            <div className="space-y-6">
                {/* 2FA Card */}
                <div className="glass-panel border border-neuro-border rounded-2xl p-6 bg-neuro-card/50">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-neuro-accent/10 flex items-center justify-center border border-neuro-accent/20">
                                <Smartphone className="h-6 w-6 text-neuro-accent" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Two-Factor Authentication</h3>
                                <p className="text-sm text-neuro-muted max-w-md mt-1">
                                    Add an extra layer of security to your account. When enabled, you'll need to provide a code from your mobile device to log in.
                                </p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer mt-2">
                            <input
                                type="checkbox"
                                checked={twoFactor}
                                onChange={toggleTwoFactor}
                                disabled={saving}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-neuro-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neuro-accent"></div>
                        </label>
                    </div>

                    {twoFactor ? (
                        <div className="bg-neuro-success/5 border border-neuro-success/20 rounded-xl p-4 flex items-center gap-3">
                            <CheckCircle className="h-5 w-5 text-neuro-success" />
                            <span className="text-sm font-medium text-neuro-success">2FA is currently active and protecting your account.</span>
                        </div>
                    ) : (
                        <div className="bg-neuro-danger/5 border border-neuro-danger/20 rounded-xl p-4 flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-neuro-danger" />
                            <span className="text-sm font-medium text-neuro-danger">Your account is less secure without two-factor authentication.</span>
                        </div>
                    )}
                </div>

                {/* Password Card */}
                <div className="glass-panel border border-neuro-border rounded-2xl p-6 bg-neuro-card/50">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-neuro-muted/10 flex items-center justify-center border border-neuro-border">
                                <Lock className="h-6 w-6 text-neuro-muted" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Change Password</h3>
                                <p className="text-sm text-neuro-muted mt-1">Update your account password regularly to stay safe.</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-1 text-sm font-bold text-neuro-accent hover:underline">
                            Update <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Activity Feed Helper */}
                <div className="p-4 bg-neuro-lighter/20 border border-neuro-border rounded-2xl">
                    <h4 className="text-xs font-bold text-neuro-muted uppercase mb-3">Recent Security Activity</h4>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-neuro-text">Login from Chrome on Windows</span>
                            <span className="text-neuro-muted">Just now</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-neuro-text">2FA settings updated</span>
                            <span className="text-neuro-muted">2 hours ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Security;
