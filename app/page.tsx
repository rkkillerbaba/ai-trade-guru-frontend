'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, ChevronRight, BarChart3, ShieldCheck, Cpu, Sparkles, Sun, Moon } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_details?: string;
}

// 💎 Dynamic Formatter Engine (Adapts styling based on Dark/Light mode)
function ProfessionalMarkdown({ text, isDark }: { text: string; isDark: boolean }) {
  if (!text) return null;
  const lines = text.split('\n');
  
  return (
    <div className={`space-y-3.5 leading-relaxed font-sans antialiased ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
      {lines.map((line, lIdx) => {
        let cleanLine = line.trim();
        if (!cleanLine) return <div key={lIdx} className="h-1.5" />;

        // Subheadings Handling
        if (cleanLine.startsWith('###')) {
          return (
            <h3 key={lIdx} className={`text-[13px] font-bold mt-5 mb-2 tracking-wider uppercase border-l-2 pl-2.5 ${
              isDark ? 'text-cyan-400 border-cyan-400/60' : 'text-slate-900 border-blue-600'
            }`}>
              {cleanLine.replace('###', '').trim()}
            </h3>
          );
        }

        // Bullet Points Handling
        const isBullet = cleanLine.startsWith('* ') || cleanLine.startsWith('- ') || cleanLine.startsWith('• ');
        if (isBullet) {
          cleanLine = cleanLine.replace(/^([\*\-\•]\s*)/, '');
        }

        const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
        const renderedText = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className={`font-bold rounded text-[13px] inline-block tracking-tight px-1.5 py-0.5 mx-0.5 ${
                isDark 
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30' 
                  : 'text-slate-950 bg-slate-100'
              }`}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        return (
          <div key={lIdx} className={`text-[14px] font-medium tracking-normal ${isDark ? 'text-slate-300' : 'text-slate-600'} ${isBullet ? 'flex items-start gap-2.5 pl-1' : ''}`}>
            {isBullet && <span className={`${isDark ? 'text-cyan-400' : 'text-blue-600'} mt-2 text-[5px] shrink-0`}>●</span>}
            <span className="leading-6">{renderedText}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function CombinedDashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: 'Aap AI Trade Guru ke advanced behavioral coach hain. F&O traders ke behavioral mistakes ko deeply analyze kijiye.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setInput((prev) => `${prev}\n[File: ${file.name}]\n${text}`.trim());
      }
    };
    reader.readAsText(file);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role || "user",
            content: msg.content || "",
            reasoning_details: msg.reasoning_details || null
          }))
        }),
      });

      if (!response.ok) throw new Error('Network error status caught');

      const data = await response.json();
      let parsedContent = "";
      let parsedReasoning = undefined;

      if (data) {
        if (typeof data === 'string') {
          parsedContent = data;
        } else if (typeof data === 'object') {
          parsedContent = data.content || data.response || data.text || "";
          parsedReasoning = data.reasoning_details || data.reasoning || undefined;
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: String(parsedContent).trim(),
          reasoning_details: parsedReasoning ? String(parsedReasoning).trim() : undefined
        },
      ]);

    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Telemetry synchronization reset. Please submit parameters again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-screen antialiased transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0b0f19] text-slate-100 font-sans' : 'bg-slate-50/60 text-slate-800 font-sans'
    }`}>
      
      {/* 🔮 Premium Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Global CSS Force Rules */}
      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }
        .font-mono-premium {
          font-family: 'JetBrains Mono', monospace !important;
        }
      `}</style>

      {/* Header Bar */}
      <header className={`px-4 py-3.5 sm:px-6 flex justify-between items-center relative z-10 border-b transition-colors ${
        isDarkMode 
          ? 'bg-[#0f1626] border-slate-800 shadow-md' 
          : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-white shadow-sm transition-colors ${isDarkMode ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-900'}`}>
            <BarChart3 size={18} className={isDarkMode ? 'text-cyan-400' : 'text-white'} />
          </div>
          <div>
            <h1 className={`text-md font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              AI TRADE GURU
            </h1>
            <p className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${isDarkMode ? 'text-cyan-400/80' : 'text-slate-400'}`}>
              Institutional Analytics Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Mode Tag */}
          <div className={`hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border transition-colors ${
            isDarkMode 
              ? 'text-cyan-400 bg-cyan-950/40 border-cyan-800/60' 
              : 'text-emerald-600 bg-emerald-50 border-emerald-200/60'
          }`}>
            <ShieldCheck size={13} /> 
            <span>Secure Engine Active</span>
          </div>

          {/* 🌓 Theme Toggle Button */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Central Chat Feed Container */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all ${
        isDarkMode ? 'bg-[#0b0f19]' : 'bg-gradient-to-b from-slate-50 to-white'
      }`}>
        <div className="max-w-3xl mx-auto space-y-6 py-2 relative z-10">
          {messages.filter(m => m && m.role !== 'system').map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              <div className={`max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? (isDarkMode ? 'bg-cyan-950/60 border border-cyan-800 text-slate-100 rounded-2xl rounded-tr-sm shadow-md px-4 py-3 text-sm font-medium' : 'bg-slate-900 text-white rounded-2xl rounded-tr-sm shadow-md px-4 py-3 text-sm font-medium') : 'w-full'}`}>
                
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</p>
                ) : (
                  <div className={`border rounded-2xl p-5 sm:p-6 transition-all shadow-sm ${
                    isDarkMode 
                      ? 'bg-[#121b2e] border-slate-800' 
                      : 'bg-white border-slate-200/70'
                  }`}>
                    
                    {/* Deep Reasoning Dropdown */}
                    {msg.reasoning_details && (
                      <details className={`mb-4 text-xs border rounded-xl overflow-hidden group ${
                        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/60'
                      }`}>
                        <summary className={`cursor-pointer font-semibold p-3 flex items-center justify-between select-none transition-colors ${
                          isDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-slate-500 hover:text-slate-800'
                        }`}>
                          <span className="flex items-center gap-1.5 font-mono-premium text-[11px]">
                            <Cpu size={13} className="text-slate-400 animate-pulse" />
                            Core Engine Execution Path Log
                          </span>
                          <ChevronRight size={14} className="transform transition-transform group-open:rotate-90 text-slate-400" />
                        </summary>
                        <div className={`px-4 pb-4 pt-2 font-mono-premium text-[11px] border-t whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto ${
                          isDarkMode ? 'text-slate-400 border-slate-800 bg-[#0f1626]' : 'text-slate-500 border-slate-100 bg-slate-50/50'
                        }`}>
                          {msg.reasoning_details}
                        </div>
                      </details>
                    )}

                    {/* Main AI Body Output */}
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${isDarkMode ? 'bg-cyan-950/40 text-cyan-400' : 'bg-blue-50 text-blue-600'}`}>
                        <Sparkles size={14} />
                      </div>
                      <div className="flex-1 w-full">
                        <ProfessionalMarkdown text={msg.content} isDark={isDarkMode} />
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          ))}

          {loading && (
            <div className={`flex items-center gap-2.5 text-xs font-semibold px-4 py-3 rounded-xl shadow-sm w-56 font-mono-premium border ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-cyan-400' : 'bg-white border-slate-200 text-slate-500'
            }`}>
              <Cpu size={14} className={`animate-spin ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} />
              <span className="tracking-wide animate-pulse">PROCESSING TELEMETRY...</span>
            </div>
          )}
        </div>
      </div>

      {/* 🛠️ Highly Optimized & Aligned Input Center */}
      <footer className={`p-3 sm:p-4 border-t relative z-10 transition-colors ${
        isDarkMode ? 'bg-[#0f1626] border-slate-800' : 'bg-white border-slate-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.01)]'
      }`}>
        <div className="max-w-3xl mx-auto flex items-center gap-2 bg-transparent">
          
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".txt,.csv,.json,.log" />
          
          {/* Attachment Button Perfectly Proportional */}
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className={`w-11 h-11 rounded-xl border transition-all shrink-0 flex items-center justify-center ${
              isDarkMode 
                ? 'bg-[#121b2e] border-slate-700 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Attach Log Data"
          >
            <Paperclip size={18} />
          </button>

          {/* Combined Flex Container to Fix Vertical Alignment */}
          <div className="relative flex-1 flex items-center">
            <textarea 
              rows={1}
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your trades or paste execution logs..." 
              className={`w-full border rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none transition-all resize-none min-h-[44px] max-h-[100px] font-medium leading-normal ${
                isDarkMode 
                  ? 'bg-[#121b2e] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-cyan-500/60' 
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'
              }`}
              style={{ display: 'block', boxSizing: 'border-box' }}
            />
            
            {/* Submit Button Centered Vertically inside Input Row */}
            <button 
              type="button"
              disabled={loading || !input.trim()}
              onClick={sendMessage}
              className={`absolute right-1.5 w-8 h-8 rounded-lg transition-all flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-20' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30'
              }`}
            >
              <Send size={13} className="stroke-[2.5]" />
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
}
