import React, { useState } from 'react';
import { HelpCircle, Send, MessageCircle, FileText, Search, ExternalLink, ShieldCheck, Download, Sparkles } from 'lucide-react';
import { GeminiChat } from '../components/dashboard/GeminiChat';
import { jsPDF } from 'jspdf';
import { api } from '../services/api';

const HelpCenter = () => {
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const email = localStorage.getItem('userEmail');

    const downloadPDF = (type) => {
        // ... (Same as before)
        const doc = new jsPDF();

        // Add styling
        doc.setFillColor(2, 6, 23); // Dark Background
        doc.rect(0, 0, 210, 297, 'F');

        doc.setTextColor(59, 130, 246); // Accent Color
        doc.setFontSize(22);
        doc.text("NEUROGRAPH SYSTEM", 105, 30, { align: "center" });

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text(type === 'guide' ? "Official User Guideline" : "Security & Privacy Policy", 105, 45, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text(`Generated for: ${email}`, 105, 55, { align: "center" });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 60, { align: "center" });

        doc.setDrawColor(59, 130, 246);
        doc.line(20, 70, 190, 70);

        doc.setTextColor(248, 250, 252);
        doc.setFontSize(12);

        let content = [];
        if (type === 'guide') {
            content = [
                "1. Introduction to NeuroGraph",
                "NeuroGraph is a cutting-edge financial risk analysis platform designed to identify",
                "suspicious transaction patterns using advanced graph analytics.",
                "",
                "2. Getting Started",
                "- Upload your transaction data in CSV format via the 'Upload' page.",
                "- Use the Dashboard to visualize the transaction network.",
                "- Red nodes indicate high-risk scores calculated by our AI engine.",
                "",
                "3. Analysis Tools",
                "- Filter transactions by date range and amount in the Sidebar.",
                "- Click on any node to view detailed account history and connections.",
                "- Export comprehensive reports using the PDF tools."
            ];
        } else {
            content = [
                "1. Data Security",
                "Your financial data is encrypted at rest and in transit. NeuroGraph follows",
                "industry-standard protocols to ensure account confidentiality.",
                "",
                "2. Two-Factor Authentication (2FA)",
                "We strongly recommend enabling 2FA in your Security settings. This adds",
                "an essential layer of protection against unauthorized access.",
                "",
                "3. Activity Auditing",
                "All user actions are logged in the 'My Audit Log' for transparent tracking.",
                "Review these logs regularly to ensure no suspicious activity from your account.",
                "",
                "4. Privacy Commitment",
                "We do not share your analysis data with third parties. Your graph models",
                "remain private to your organization."
            ];
        }

        let yPos = 85;
        content.forEach(line => {
            doc.text(line, 20, yPos);
            yPos += 10;
        });

        doc.save(type === 'guide' ? "NeuroGraph_Guideline.pdf" : "NeuroGraph_Security_Policy.pdf");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus('');
        try {
            const result = await api.submitHelpRequest({ email, subject, message });
            if (result.success) {
                setStatus('Request submitted! Our support team will contact you soon.');
                setSubject('');
                setMessage('');
            }
        } catch (error) {
            setStatus('Failed to submit request.');
        } finally {
            setSubmitting(false);
        }
    };

    const faqs = [
        { q: "How do I interpret the risk scores?", a: "Risk scores are calculated based on behavioral analysis, transaction frequency, and structural patterns in the finance network." },
        { q: "What should I do if a circular loop is detected?", a: "Analyze the involved accounts in the Audit Log and consider flagging them for manual review in the Dashboard." },
        { q: "How can I update my notification preferences?", a: "Go to Account Settings and toggle 'Email Notifications' to manage your alerts." }
    ];

    return (
        <div className="p-8 max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-2xl font-bold mb-8 text-neuro-text flex items-center gap-2">
                <HelpCircle className="text-neuro-accent" /> Help Center
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel border border-neuro-border rounded-2xl p-6 bg-neuro-card/50">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <MessageCircle className="h-5 w-5 text-neuro-accent" /> Submit a Support Ticket
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-neuro-muted uppercase mb-2">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g., Question about Risk Analysis"
                                    required
                                    className="w-full bg-neuro-bg/50 border border-neuro-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-neuro-accent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neuro-muted uppercase mb-2">Message</label>
                                <textarea
                                    rows="5"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your issue or question in detail..."
                                    required
                                    className="w-full bg-neuro-bg/50 border border-neuro-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-neuro-accent resize-none"
                                ></textarea>
                            </div>
                            {status && (
                                <div className={`p-4 rounded-xl text-xs font-medium ${status.includes('submitted') ? 'bg-neuro-success/10 text-neuro-success' : 'bg-neuro-danger/10 text-neuro-danger'}`}>
                                    {status}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 bg-neuro-accent hover:bg-neuro-accent/80 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                            >
                                <Send className="h-4 w-4" />
                                {submitting ? 'Sending...' : 'Send Request'}
                            </button>
                        </form>
                    </div>

                    {/* FAQs */}
                    <div className="glass-panel border border-neuro-border rounded-2xl p-6 bg-neuro-card/30">
                        <h3 className="text-lg font-bold mb-6">Frequently Asked Questions</h3>
                        <div className="space-y-6">
                            {faqs.map((faq, i) => (
                                <div key={i} className="group">
                                    <h4 className="text-sm font-bold text-neuro-text mb-2 flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-neuro-accent"></div>
                                        {faq.q}
                                    </h4>
                                    <p className="text-xs text-neuro-muted leading-relaxed pl-3.5 border-l border-neuro-border/50">
                                        {faq.a}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Resources */}
                <div className="space-y-6">
                    <div className="glass-panel border border-neuro-border rounded-2xl p-6 bg-neuro-lighter/10">
                        <h3 className="text-sm font-bold mb-4 uppercase tracking-wider text-neuro-muted">Documentation</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => downloadPDF('guide')}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neuro-lighter/20 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-4 w-4 text-neuro-accent" />
                                    <span className="text-xs font-medium">User Guide (PDF)</span>
                                </div>
                                <Download className="h-3 w-3 text-neuro-muted group-hover:text-neuro-accent" />
                            </button>
                            <button
                                onClick={() => downloadPDF('security')}
                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-neuro-lighter/20 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-4 w-4 text-neuro-accent" />
                                    <span className="text-xs font-medium">Security Policy (PDF)</span>
                                </div>
                                <Download className="h-3 w-3 text-neuro-muted group-hover:text-neuro-accent" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-neuro-accent/5 border border-neuro-accent/10 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles className="h-12 w-12 text-neuro-accent" />
                        </div>
                        <h4 className="text-sm font-bold text-neuro-accent mb-2 flex items-center gap-2">
                            NEUROGRAPH CHATBOT
                        </h4>
                        <p className="text-xs text-neuro-muted mb-4">Our Neurograph CHATBOT is ready to answer any questions about your financial analysis in real-time.</p>
                        <button
                            onClick={() => setIsChatOpen(true)}
                            className="w-full bg-neuro-accent text-white py-2.5 rounded-xl text-xs font-bold hover:shadow-[0_0_15px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2"
                        >
                            <MessageCircle className="h-4 w-4" />
                            Chat with our CHATBOT
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Chat Modal */}
            <GeminiChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
};

export default HelpCenter;
