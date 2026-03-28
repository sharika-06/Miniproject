import { User, Settings, Shield, FileText, Moon, Bell, HelpCircle, LogOut, ChevronRight, Key, Lock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function UserProfileMenu({ onClose }) {
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [userName, setUserName] = useState('User');

    useEffect(() => {
        // Initialize theme default to dark
        const savedTheme = localStorage.getItem('theme');
        const isDark = savedTheme === 'dark' || !savedTheme;
        setIsDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.add('light');
        }

        // Get User Name
        const storedName = localStorage.getItem('userName');
        if (storedName) setUserName(storedName);
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDarkMode;
        setIsDarkMode(newIsDark);
        if (newIsDark) {
            document.documentElement.classList.remove('light');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.add('light');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        navigate('/');
        onClose();
    };

    return (
        <div className="w-80 glass-panel border border-neuro-border rounded-2xl shadow-2xl overflow-hidden font-sans text-neuro-text animate-fade-in absolute right-0 top-16 z-50 !backdrop-blur-3xl !bg-neuro-card/95">
            {/* 1. Header */}
            <div className="p-5 border-b border-neuro-border bg-neuro-lighter/20 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-neuro-bg flex items-center justify-center border border-neuro-accent/20 relative shadow-inner">
                        <User className="h-5 w-5 text-neuro-accent" />
                        <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-neuro-success rounded-full border-2 border-neuro-bg" title="Active"></div>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-neuro-text leading-tight">{userName}</h3>
                        <p className="text-[10px] text-neuro-muted font-medium mt-0.5">Senior Fraud Analyst</p>
                    </div>
                </div>
            </div>

            <div className="py-2">
                <MenuItem icon={Settings} label="Account Settings" onClick={() => { navigate('/settings'); onClose(); }} />
                <MenuItem icon={Shield} label="Security & 2FA" onClick={() => { navigate('/security'); onClose(); }} />
                <MenuItem icon={FileText} label="My Audit Log" onClick={() => { navigate('/audit-log'); onClose(); }} />

                <div className="h-px bg-neuro-border my-1 mx-4"></div>

                <MenuItem
                    icon={Moon}
                    label="Dark Mode"
                    onClick={toggleTheme}
                    rightElement={
                        <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-neuro-accent' : 'bg-neuro-muted'}`}>
                            <div className={`h-3 w-3 rounded-full bg-white shadow-sm transform transition-transform ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </div>
                    }
                />
                <MenuItem icon={Bell} label="Notifications" onClick={() => { navigate('/notifications'); onClose(); }} />
                <MenuItem icon={HelpCircle} label="Help Center" onClick={() => { navigate('/help'); onClose(); }} />

                <div className="h-px bg-neuro-border my-1 mx-4"></div>

                <MenuItem icon={Lock} label="Privacy Policy" onClick={() => { alert('Privacy Policy coming soon'); onClose(); }} />
                <MenuItem icon={Activity} label="System Health" onClick={() => { alert('All systems operational'); onClose(); }} />

                <div className="h-px bg-neuro-border my-1 mx-4"></div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-neuro-text hover:bg-neuro-lighter/50 transition-colors group"
                >
                    <LogOut className="h-4 w-4 text-neuro-text group-hover:text-neuro-muted" />
                    <span className="font-medium">Sign Out</span>
                </button>
            </div>
        </div>
    );
}

function MenuItem({ icon: Icon, label, subLabel, rightElement, onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neuro-lighter/50 transition-all group"
        >
            <Icon className="h-4 w-4 text-neuro-text group-hover:text-neuro-muted" />
            <div className="flex-1">
                <div className="text-xs font-medium text-neuro-text group-hover:text-neuro-muted">{label}</div>
            </div>
            {rightElement}
        </button>
    );
}

