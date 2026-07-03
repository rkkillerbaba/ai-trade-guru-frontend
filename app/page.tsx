'use client';

import { useState, useRef, useEffect } from 'react';
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
    <div className={`space-y-3 leading-relaxed font-sans antialiased ${isDark ? 'text-gray-200' : 'text-slate-700'}`}>
      {lines.map((line, lIdx) => {
        let cleanLine = line.trim();
        if (!cleanLine) return <div key={lIdx} className="h-1.5" />;

        // Subheadings Handling
        if (cleanLine.startsWith('###')) {
          return (
            <h3 key={lIdx} className={`text-[13px] font-bold mt-5 mb-1.5 tracking-wider uppercase border-l-2 pl-2.5 ${
              isDark ? 'text-cyan-400 border-cyan-500 shadow-neon-cyan' : 'text-slate-900 border-blue-600'
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
              <strong key={pIdx} className={`font-bold rounded text-[13px] inline-block tracking-tight px-1 py-0.5 mx-0.5 ${
                isDark 
                  ? 'text-cyan-400 bg-cyan-950/50 border border-cyan-500/20 shadow-neon-cyan' 
                  : 'text-slate-950 bg-slate-100/80'
              }`}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        return (
          <div key={lIdx} className={`text-[14px] font-medium tracking-normal ${isDark ? 'text-gray-300' : 'text-slate-600'} ${isBullet ? 'flex items-start gap-2.5 pl-1' : ''}`}>
            {isBullet && <span className={`${isDark ? 'text-cyan-400 shadow-neon-cyan' : 'text-blue-600'} mt-2 text-[5px] shrink-0`}>●</span>}
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
    <div className={`flex flex-col h-screen antialiased transition-colors duration-300 ${
      isDarkMode ? 'bg-[#070a13] text-gray-100 font-mono relative overflow-hidden' : 'bg-slate-50/60 text-slate-800 font-sans'
    }`}>
      
      {/* 🔮 Premium Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Global CSS Force Rules */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
        }
        .font-mono-premium {
          font-family: 'JetBrains Mono', monospace !important;
        }
        .shadow-neon-cyan {
          text-shadow: 0 0 8px rgba(34, 211, 238, 0.4);
        }
        .box-neon-cyan {
          box-shadow: 0 0 15px rgba(6, 182, 212, 0.2);
        }
      `}</style>

      {/* Cyber Background Mesh for Dark Mode Only */}
      {isDarkMode && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293715_1px,transparent_1px),linear-gradient(to_bottom,#1f293715_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      )}

      {/* Header Bar */}
      <header className={`px-6 py-4 flex justify-between items-center relative z-10 border-b transition-colors ${
        isDarkMode 
          ? 'bg-[#0b0f19]/90 border-cyan-500/20 shadow-[0_1px_15px_rgba(6,182,212,0.1)] backdrop-blur' 
          : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-white shadow-sm transition-colors ${isDarkMode ? 'bg-cyan-500/10 border border-cyan-400/40 box-neon-cyan' : 'bg-slate-900'}`}>
            <BarChart3 size={18} className={isDarkMode ? 'text-cyan-400' : 'text-white'} />
          </div>
          <div>
            <h1 className={`text-md font-extrabold tracking-tight ${isDarkMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 shadow-neon-cyan' : 'text-slate-900'}`}>
              AI TRADE GURU
            </h1>
            <p className={`text-[10px] font-bold tracking-widest uppercase mt-0.5 ${isDarkMode ? 'text-cyan-500/70' : 'text-slate-400'}`}>
              {isDarkMode ? 'Behavioral Engine v1.0' : 'Institutional Analytics Platform'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Mode Tag */}
          <div className={`hidden sm:flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border transition-colors ${
            isDarkMode 
              ? 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30 box-neon-cyan' 
              : 'text-emerald-600 bg-emerald-50 border-emerald-200/60'
          }`}>
            <ShieldCheck size={13} className={isDarkMode ? 'animate-pulse' : ''} /> 
            <span>{isDarkMode ? 'GEMMA-4 ACTIVE' : 'Secure Engine Active'}</span>
          </div>

          {/* 🌓 Premium Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
              isDarkMode 
                ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/80 box-neon-cyan' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Switch Environment Theme"
          >
            {isDarkMode ? <Sun size={17} className="animate-spin-slow" /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Central Chat Feed Container */}
      <div className={`flex-1 overflow-y-auto p-6 transition-all ${
        isDarkMode ? 'bg-gradient-to-b from-[#070a13] to-[#04060d]' : 'bg-gradient-to-b from-slate-50 to-white'
      }`}>
        <div className="max-w-3xl mx-auto space-y-6 py-4 relative z-10">
          {messages.filter(m => m && m.role !== 'system').map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              <div className={`max-w-[88%] ${msg.role === 'user' ? (isDarkMode ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border border-cyan-500/40 text-cyan-100 rounded-2xl rounded-tr-sm shadow-xl px-5 py-3.5 text-sm font-medium' : 'bg-slate-900 text-white rounded-2xl rounded-tr-sm shadow-md px-5 py-3.5 text-sm font-medium') : 'w-full'}`}>
                
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</p>
                ) : (
                  <div className={`border rounded-2xl p-6 transition-all shadow-sm hover:shadow-md ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-slate-900/90 to-[#0d1324] border-slate-800/80' 
                      : 'bg-white border-slate-200/70'
                  }`}>
                    
                    {/* Deep Reasoning Dropdown */}
                    {msg.reasoning_details && (
                      <details className={`mb-4 text-xs border rounded-xl overflow-hidden group ${
                        isDarkMode ? 'bg-amber-950/10 border-amber-500/20' : 'bg-slate-50 border-slate-200/60'
                      }`}>
                        <summary className={`cursor-pointer font-semibold p-3 flex items-center justify-between select-none transition-colors ${
                          isDarkMode ? 'text-amber-400 hover:text-amber-200' : 'text-slate-500 hover:text-slate-800'
                        }`}>
                          <span className="flex items-center gap-1.5 font-mono-premium text-[11px]">
                            <Cpu size={13} className={isDarkMode ? 'text-amber-500 animate-pulse' : 'text-slate-400 animate-pulse'} />
                            Core Engine Execution Path Log
                          </span>
                          <ChevronRight size={14} className="transform transition-transform group-open:rotate-90 text-slate-400" />
                        </summary>
                        <div className={`px-4 pb-4 pt-2 font-mono-premium text-[11px] border-t whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto ${
                          isDarkMode ? 'text-amber-200/60 border-amber-500/20 bg-amber-950/5' : 'text-slate-500 border-slate-100 bg-slate-50/50'
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
              isDarkMode ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-400' : 'bg-white border-slate-200 text-slate-500'
            }`}>
              <Cpu size={14} className={`animate-spin ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} />
              <span className="tracking-wide animate-pulse">{isDarkMode ? 'ANALYZING METRICS...' : 'PROCESSING TELEMETRY...'}</span>
            </div>
          )}
        </div>
      </div>

      {/* 🛠️ Highly User-Friendly Input Center (Fixed Spacing, Contrasts & Readability) */}
      <footer className={`p-5 border-t relative z-10 transition-colors ${
        isDarkMode ? 'bg-[#090d1a]/90 border-slate-800/80 shadow-[0_-2px_15px_rgba(0,0,0,0.3)]' : 'bg-white border-slate-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]'
      }`}>
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex items-end gap-3">
          
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".txt,.csv,.json,.log" />
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className={`p-4 rounded-xl border transition-all shrink-0 flex items-center justify-center ${
              isDarkMode 
                ? 'bg-[#03060f] border-slate-800 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/40' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Attach Log Data"
          >
            <Paperclip size={18} />
          </button>

          {/* Upgraded High Contrast User-Friendly Text Area Box */}
          <div className="relative flex-1">
            <textarea 
              rows={1}
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your market position or paste execution logs..." 
              className={`w-full border rounded-xl pl-5 pr-14 py-4 text-sm focus:outline-none transition-all resize-none min-h-[54px] max-h-[140px] font-medium leading-relaxed font-sans ${
                isDarkMode 
                  ? 'bg-[#03060f] border-slate-800 text-gray-100 placeholder-slate-600 focus:border-cyan-500/60 focus:shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner'
              }`}
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className={`absolute right-2.5 bottom-2.5 p-2.5 rounded-xl transition-all flex items-center justify-center ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-gray-950 hover:opacity-90 disabled:opacity-20' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30'
              }`}
            >
              <Send size={14} className="stroke-[2.5]" />
            </button>
          </div>

        </form>
      </footer>

    </div>
  );
}
