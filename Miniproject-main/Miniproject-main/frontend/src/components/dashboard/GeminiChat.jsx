import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, X, Maximize2, Minimize2, Sparkles } from 'lucide-react';
import { api } from '../../services/api';

export const GeminiChat = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Hello! I am your Neuro AI assistant. How can I help you with the NeuroGraph platform today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const data = await api.chatWithAI(input);
            setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', content: "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later." }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[550px] glass-panel border border-neuro-accent/30 rounded-3xl shadow-2xl flex flex-col z-[100] animate-fade-in-up overflow-hidden bg-neuro-card/90">
            {/* Header */}
            <div className="p-4 bg-neuro-accent/10 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-neuro-accent/20 flex items-center justify-center border border-neuro-accent/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                        <Sparkles className="h-5 w-5 text-neuro-accent animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white tracking-wide">Neurograph Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-neuro-success"></span>
                            <span className="text-[10px] text-neuro-success font-bold uppercase tracking-widest">AI Online</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-neuro-muted hover:text-white">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                        <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border 
                                ${msg.role === 'user' ? 'bg-neuro-accent/20 border-neuro-accent/30' : 'bg-neuro-lighter/30 border-white/10'}`}>
                                {msg.role === 'user' ? <User className="h-4 w-4 text-neuro-accent" /> : <Bot className="h-4 w-4 text-white" />}
                            </div>
                            <div className={`p-3 rounded-2xl text-xs leading-relaxed 
                                ${msg.role === 'user' ? 'bg-neuro-accent text-white rounded-tr-none' : 'bg-neuro-lighter/40 text-neuro-text border border-white/5 rounded-tl-none'}`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="flex gap-3">
                            <div className="h-8 w-8 rounded-lg bg-neuro-lighter/30 border border-white/10 flex items-center justify-center shrink-0">
                                <Bot className="h-4 w-4 text-white" />
                            </div>
                            <div className="bg-neuro-lighter/40 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                                <span className="h-1.5 w-1.5 bg-neuro-muted rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="h-1.5 w-1.5 bg-neuro-muted rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="h-1.5 w-1.5 bg-neuro-muted rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black/20">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Gemini anything..."
                        className="w-full bg-neuro-bg/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-neuro-accent/50 focus:bg-neuro-card transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neuro-accent hover:text-white disabled:opacity-30 transition-colors"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </form>
        </div>
    );
};
