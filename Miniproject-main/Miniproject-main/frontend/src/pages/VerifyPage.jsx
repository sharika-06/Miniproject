import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { api } from '../services/api';

export default function VerifyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const mailId = location.state?.mailId || 'your email'; // Fallback if direct access

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(119); // 1:59 in seconds
    const [generatedOtp, setGeneratedOtp] = useState(null);
    const [error, setError] = useState('');

    const inputRefs = useRef([]);
    const hasFetched = useRef(false); // Ref to prevent double-firing in Strict Mode

    // 1. Simulate Sending OTP on Component Mount
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        // Generate random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(code);

        // "Send" Email (Simulated)
        console.log(`[SIMULATION] Email sent to ${mailId}. Your OTP code is: ${code}`);
        // Small delay to ensure UI is ready before alert
        setTimeout(() => alert(`(Demo) OTP sent to ${mailId}: ${code}`), 100);
    }, [mailId]);

    // 2. Timer Countdown Logic
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    // Format time mm:ss
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // 3. Handle Input Change
    const handleChange = (index, value) => {
        // Allow only number
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle Backspace
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    // 4. Validate and Login
    const handleVerify = async (e) => {
        e.preventDefault();
        const enteredCode = otp.join('');

        if (timer === 0) {
            setError('Code expired. Please request a new one.');
            return;
        }

        // Validate strictly against the OTP shown in the dialog
        if (enteredCode === generatedOtp) {
            // Success
            navigate('/upload');
        } else {
            console.warn(`[OTP Fail] Expected: ${generatedOtp}, Got: ${enteredCode}`);
            setError('Invalid OTP. Please enter the code shown in the alert.');
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center bg-neuro-bg relative overflow-hidden font-sans">
            {/* Background - Deep Obsidian Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-neuro-bg via-neuro-bg to-black"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]"></div>

            <div className="z-10 w-full max-w-[480px] flex flex-col items-center">

                {/* Logo Section */}
                <div className="flex flex-col items-center mb-12 animate-fade-in-up">
                    <div className="flex items-center gap-4 mb-2">
                        <Logo className="h-16 w-16" />
                        <span className="text-3xl tracking-[0.2em] text-[#C5C6C7] font-batman mt-2">NEUROGRAPH</span>
                    </div>
                </div>

                {/* Glass Card - Vaulta Style */}
                <div className="w-full glass-panel rounded-[32px] p-10 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>

                    {/* Inner Refraction/Sheen */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                    <h2 className="text-xl font-bold text-white mb-2 text-center tracking-wider uppercase opacity-90 font-montserrat text-glow">Verify Identity</h2>
                    <p className="text-xs text-neuro-muted text-center mb-8 font-montserrat">Role: Admin | <span className="text-neuro-accent">{mailId}</span></p>

                    <div className="my-8 relative z-10">
                        <p className="text-center text-neuro-muted mb-4 text-[10px] tracking-wide font-montserrat font-bold uppercase">Enter the 6-digit code</p>
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => inputRefs.current[index] = el}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="h-14 w-full bg-[#020617]/50 border border-white/10 rounded-xl text-center text-white text-xl focus:outline-none focus:bg-[#0F172A] focus:border-neuro-accent/50 transition-all shadow-inner font-mono"
                                />
                            ))}
                        </div>
                        {error && <p className="text-red-400 text-xs text-center mt-4 bg-red-500/10 py-1 rounded font-montserrat">{error}</p>}
                    </div>

                    <p className="text-center text-gray-500 text-sm mb-6 font-montserrat">Code expires in <span className="text-white font-mono">{formatTime(timer)}</span></p>

                    <div className="flex items-center justify-center gap-3 mb-6 opacity-60 hover:opacity-100 transition-opacity">
                        <input
                            type="checkbox"
                            id="trustDevice"
                            className="h-4 w-4 bg-[#1E1E1E] border-gray-600 rounded focus:ring-0 accent-white cursor-pointer"
                        />
                        <label htmlFor="trustDevice" className="text-xs text-gray-400 cursor-pointer select-none tracking-wide font-montserrat font-semibold">
                            Trust this device for 30 Days
                        </label>
                    </div>

                    <button
                        onClick={handleVerify}
                        className="w-full py-4 rounded-xl text-xs tracking-[0.2em] font-montserrat font-bold transition-all duration-300 shadow-xl bg-neuro-accent/10 hover:bg-neuro-accent/20 text-neuro-accent border border-neuro-accent/30 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                    >
                        LOGIN TO DASHBOARD
                    </button>
                </div>

                <p className="mt-8 text-center text-[10px] text-gray-600 tracking-wider">System secured with end to end encryption</p>
            </div>
        </div>
    );
}
