import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { api } from '../services/api';
import { clsx } from 'clsx';

export default function UploadPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (file) => {
        setError('');
        if (!file) return;

        // Simple CSV check (by extension or type)
        if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
            setError('Please upload a valid CSV file.');
            return;
        }
        setFile(file);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const adminId = localStorage.getItem('userEmail') || 'anonymous';
            await api.uploadCsv(file, adminId);
            navigate('/dashboard');
        } catch (err) {
            console.error('Upload error:', err);
            setError('Upload failed. Please try again.');
            setUploading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-neuro-bg font-sans">
            {/* Background - Deep Obsidian Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-neuro-bg via-neuro-bg to-black"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]"></div>

            <div className="z-10 flex flex-col items-center w-full max-w-2xl px-4">

                {/* Header */}
                <div className="flex flex-col items-center mb-12 animate-fade-in-up">
                    <div className="flex items-center gap-4 mb-2">
                        <Logo className="h-16 w-16" />
                        <span className="text-3xl tracking-[0.2em] text-[#C5C6C7] font-batman mt-2">NEUROGRAPH</span>
                    </div>
                </div>

                {/* Main Card */}
                <div className="w-full glass-panel rounded-[32px] p-10 relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '100ms' }}>

                    {/* Inner Refraction/Sheen */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                    <h2 className="text-xl font-bold text-white mb-2 text-center tracking-wider uppercase opacity-90 font-montserrat text-glow">UPLOAD TRANSACTION DATA</h2>
                    <p className="text-neuro-muted text-center mb-8 font-montserrat text-xs">Upload your financial transaction logs (CSV format) for analysis.</p>

                    {/* Drag & Drop Zone */}
                    <div
                        className={`border border-dashed rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative z-10 ${dragging ? 'border-white/30 bg-white/5' : 'border-white/10 hover:border-white/20 hover:bg-[#1E1E1E]'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept=".csv"
                            className="hidden"
                        />

                        {!file ? (
                            <>
                                <Upload className={`h-10 w-10 mb-4 ${dragging ? 'text-white' : 'text-[#888888]'}`} />
                                <p className="text-white font-semibold mb-1 font-montserrat text-sm">Click to upload or drag and drop</p>
                                <p className="text-[10px] text-[#666666] font-montserrat uppercase tracking-wide">CSV files only (Max 100MB)</p>
                            </>
                        ) : (
                            <div className="flex flex-col items-center animate-fade-in">
                                <FileText className="h-10 w-10 text-white mb-2" />
                                <p className="text-white font-bold text-sm font-montserrat">{file.name}</p>
                                <p className="text-[10px] text-[#888888] font-mono">{(file.size / 1024).toFixed(2)} KB</p>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    className="mt-4 text-[10px] text-red-500 hover:text-red-400 uppercase tracking-widest font-bold"
                                >
                                    Remove File
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="flex items-center justify-center gap-2 mt-4 text-red-400 text-xs font-montserrat">
                            <AlertCircle className="h-3 w-3" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={clsx(
                            "w-full mt-8 py-4 rounded-xl text-xs tracking-[0.2em] font-montserrat font-bold transition-all duration-300 shadow-xl flex items-center justify-center gap-2",
                            !file || uploading
                                ? "bg-white/5 text-neuro-muted border border-transparent cursor-not-allowed"
                                : "bg-neuro-accent/10 hover:bg-neuro-accent/20 text-neuro-accent border border-neuro-accent/30 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        )}
                    >
                        {uploading ? (
                            <>
                                <div className="h-3 w-3 border-2 border-neuro-accent/50 border-t-neuro-accent rounded-full animate-spin"></div>
                                PROCESSING...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4" />
                                PROCESS DATA
                            </>
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
}
