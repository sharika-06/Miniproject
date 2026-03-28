import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ShieldCheck, ChevronDown, LogOut, Settings, FileText, Moon, Sun } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { UserProfileMenu } from '../UserProfileMenu';
import { Logo } from '../ui/Logo';

const Navbar = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileOpen]);

    return (
        <header className="h-20 bg-neuro-bg/80 backdrop-blur-md border-b border-neuro-border fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 font-sans transition-colors duration-300">
            {/* Left: Logo (Image) */}
            <div className="flex items-center gap-4">
                <Logo className="h-14 w-14" />
                <span className="text-3xl tracking-[0.2em] text-neuro-text font-batman mt-2">NEUROGRAPH</span>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-xl mx-12">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-neuro-muted group-focus-within:text-neuro-accent transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 border border-neuro-border rounded-xl leading-5 bg-neuro-bg/50 text-neuro-text placeholder-neuro-muted focus:outline-none focus:border-neuro-accent/50 focus:bg-neuro-card transition-all sm:text-sm font-medium shadow-inner"
                        placeholder="Search Account Transaction Id"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-6">
                {/* Notifications Bell */}
                <button
                    onClick={() => window.location.href = '/notifications'}
                    className="relative p-2 rounded-xl text-neuro-muted hover:text-neuro-accent hover:bg-neuro-accent/10 transition-all group"
                    title="Notifications"
                >
                    <Bell className="h-5 w-5" />
                    <div className="absolute top-2 right-2.5 h-2 w-2 bg-neuro-danger rounded-full border-2 border-neuro-bg"></div>
                </button>

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="h-10 w-10 rounded-full bg-neuro-card border border-white/10 overflow-hidden flex items-center justify-center hover:border-neuro-accent/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all"
                    >
                        <svg className="w-6 h-6 text-neuro-muted hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </button>

                    {isProfileOpen && (
                        <UserProfileMenu onClose={() => setIsProfileOpen(false)} />
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
