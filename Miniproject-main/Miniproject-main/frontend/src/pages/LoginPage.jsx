import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { clsx } from 'clsx';
import { api } from '../services/api';

export default function LoginPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ mailId: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const isFormValid = formData.mailId.trim().length > 0 && formData.password.trim().length > 0;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;

        setIsLoading(true);
        try {
            const data = await api.login(formData.mailId, formData.password);
            if (data.success) {
                // Trigger OTP Send
                await api.sendOtp(formData.mailId);
                
                // Store user info
                localStorage.setItem('userEmail', formData.mailId);
                // Extract name from email (e.g. "john.doe@..." -> "John Doe")
                const name = formData.mailId.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                localStorage.setItem('userName', name);

                // Check Role for Redirection
                // Pass user object to verify page for role-based redirection logic
                navigate('/verify', { state: { mailId: formData.mailId, user: data.user } });
            } else {
                alert('Invalid credentials (try: password123)');
            }
        } catch (err) {
            console.error(err);
            alert('Server validation failed. Is backend running?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-[#0F0F0F] relative overflow-hidden font-sans">
            {/* Background - Pure Dark Matte */}
            <div className="absolute inset-0 bg-[#050505]"></div>

            {/* Main Content */}
            <div className="z-10 w-full max-w-[480px] flex flex-col items-center">

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-12">
                    <div className="flex items-center gap-4 mb-2">
                        <Logo className="h-14 w-14" />
                        <span className="text-3xl tracking-[0.2em] text-[#C5C6C7] font-batman mt-2">NEUROGRAPH</span>
                    </div>
                </div>

                {/* Glass Card - Vaulta Style */}
                <div className="w-full glass-panel rounded-[32px] p-10 relative overflow-hidden animate-fade-in-up">

                    {/* Inner Refraction/Sheen */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                    <h2 className="text-3xl font-bold text-white mb-10 text-center tracking-widest uppercase opacity-90 font-montserrat text-glow">LOGIN</h2>

                    <form onSubmit={handleLogin} className="space-y-8 relative z-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-neuro-muted ml-1 uppercase tracking-widest font-sans">Mail id</label>
                            <input
                                name="mailId"
                                value={formData.mailId}
                                onChange={handleChange}
                                type="text"
                                className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-neuro-muted focus:outline-none focus:bg-[#0F172A] focus:border-neuro-accent/50 transition-all shadow-inner text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-neuro-muted ml-1 uppercase tracking-widest font-sans">Password</label>
                            <input
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                type="password"
                                className="w-full bg-[#020617]/50 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-neuro-muted focus:outline-none focus:bg-[#0F172A] focus:border-neuro-accent/50 transition-all shadow-inner text-sm"
                            />
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                disabled={!isFormValid || isLoading}
                                className={clsx(
                                    "w-full py-4 rounded-xl text-xs tracking-[0.2em] font-bold font-sans transition-all duration-300 shadow-lg",
                                    isFormValid
                                        ? "bg-neuro-accent/10 hover:bg-neuro-accent/20 text-neuro-accent border border-neuro-accent/30 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                        : "bg-white/5 text-neuro-muted border border-transparent cursor-not-allowed"
                                )}
                            >
                                {isLoading ? 'PROCESSING...' : 'CONTINUE'}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="mt-8 text-center text-[10px] text-gray-600 tracking-wider">System secured with end to end encryption</p>
            </div>
        </div>
    );
}
