import React, { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const email = localStorage.getItem('userEmail');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const result = await api.getNotifications(email);
            if (result.success) {
                setNotifications(result.data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.markNotificationAsRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, status: 'read' } : n));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const getIcon = (title) => {
        if (title.toLowerCase().includes('security') || title.toLowerCase().includes('password')) return <ShieldCheck className="text-neuro-accent" />;
        if (title.toLowerCase().includes('alert')) return <AlertTriangle className="text-neuro-danger" />;
        if (title.toLowerCase().includes('success')) return <CheckCircle className="text-neuro-success" />;
        return <Info className="text-neuro-accent" />;
    };

    if (loading) return <div className="p-8 text-neuro-muted">Loading notifications...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold mb-8 text-neuro-text flex items-center gap-2">
                <Bell className="text-neuro-accent" /> Notifications
            </h1>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((note) => (
                        <div
                            key={note.id}
                            onClick={() => note.status === 'unread' && markAsRead(note.id)}
                            className={`glass-panel border rounded-2xl p-5 bg-neuro-card/50 transition-all cursor-pointer group ${note.status === 'unread' ? 'border-neuro-accent shadow-lg shadow-neuro-accent/5' : 'border-neuro-border hover:border-neuro-accent/50'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${note.status === 'unread' ? 'bg-neuro-accent/10 border-neuro-accent/20' : 'bg-neuro-lighter/20 border-neuro-border'
                                    }`}>
                                    {getIcon(note.title)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-sm font-bold text-neuro-text group-hover:text-neuro-accent transition-colors">{note.title}</h3>
                                        <div className="flex items-center gap-1.5 text-[10px] text-neuro-muted font-medium">
                                            <Clock className="h-3 w-3" />
                                            {new Date(note.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    <p className="text-xs text-neuro-muted leading-relaxed">{note.message}</p>
                                    {note.status === 'unread' && (
                                        <div className="mt-2 flex items-center gap-1.5">
                                            <div className="h-1.5 w-1.5 rounded-full bg-neuro-accent"></div>
                                            <span className="text-[10px] font-bold text-neuro-accent uppercase tracking-wider">New</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 glass-panel border border-dashed border-neuro-border rounded-3xl bg-neuro-card/20">
                        <div className="h-16 w-16 bg-neuro-lighter/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="h-8 w-8 text-neuro-muted opacity-30" />
                        </div>
                        <h3 className="text-lg font-bold text-neuro-text">All caught up!</h3>
                        <p className="text-sm text-neuro-muted mt-2">No notifications to show at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
