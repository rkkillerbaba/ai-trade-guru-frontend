'use client';

import { useState, useRef } from 'react';
import { Send, Paperclip, ChevronRight, BarChart3, ShieldCheck, Cpu, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_details?: string;
}

// 💎 Ultra-Premium Institutional Text Formatter Engine
function ProfessionalMarkdown({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split('\n');
  
  return (
    <div className="space-y-3.5 text-slate-700 leading-relaxed font-sans antialiased">
      {lines.map((line, lIdx) => {
        const cleanLine = line.trim();
        if (!cleanLine) return <div key={lIdx} className="h-1.5" />;

        // Subheadings (###) Ko Clean Premium Look Dena
        if (cleanLine.startsWith('###')) {
          return (
            <h3 key={lIdx} className="text-[13px] font-bold text-slate-900 mt-5 mb-1.5 tracking-wider uppercase border-l-2 border-blue-600 pl-2.5">
              {cleanLine.replace('###', '').trim()}
            </h3>
          );
        }

        // Clean Professional List Items
        const isBullet = cleanLine.startsWith('* ') || cleanLine.startsWith('- ');
        const parts = (isBullet ? cleanLine.substring(2) : cleanLine).split(/(\*\*.*?\*\*)/g);
        
        const renderedText = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            // Key metrics aur bold elements ko subtle high-contrast inline badge look dena
            return (
              <strong key={pIdx} className="font-semibold text-slate-950 bg-slate-100 px-1 py-0.5 rounded text-[13px]">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        return (
          <div key={lIdx} className={`text-[14px] font-medium tracking-normal text-slate-600 ${isBullet ? 'flex items-start gap-2.5 pl-1' : ''}`}>
            {isBullet && <span className="text-blue-600 mt-2 text-[5px] shrink-0">●</span>}
            <span className="leading-6">{renderedText}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function PremiumDashboard() {
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

      if (!response.ok) throw new Error('Server unexpected response status');

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
        { role: 'assistant', content: "System connection refresh requested. Please submit again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50/60 text-slate-800 antialiased">
      
      {/* 🔮 Injecting Premium Google Fonts Dynamically */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Embedded CSS Style Overrides for Ultimate Typography Experience */}
      <style jsx global>{`
        body {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
        }
        .font-mono-premium {
          font-family: 'JetBrains Mono', monospace !important;
        }
      `}</style>

      {/* Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200/80 flex justify-between items-center shadow-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg text-white shadow-sm">
            <BarChart3 size={18} />
          </div>
          <div>
            <h1 className="text-md font-extrabold text-slate-900 tracking-tight">AI TRADE GURU</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">Institutional Analytics Platform</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full">
            <ShieldCheck size={13} /> Secure Engine Active
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-3xl mx-auto space-y-6 py-4">
          {messages.filter(m => m && m.role !== 'system').map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              <div className={`max-w-[88%] ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-2xl rounded-tr-sm shadow-md px-5 py-3.5 text-sm font-medium' : 'w-full'}`}>
                
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                ) : (
                  <div className="bg-white border border-slate-200/70 shadow-sm rounded-2xl p-6 transition-all hover:shadow-md">
                    
                    {/* Deep Reasoning Dropdown using JetBrains Mono */}
                    {msg.reasoning_details && (
                      <details className="mb-4 text-xs bg-slate-50 border border-slate-200/60 rounded-xl overflow-hidden group">
                        <summary className="cursor-pointer font-semibold text-slate-500 hover:text-slate-800 p-3 flex items-center justify-between select-none transition-colors">
                          <span className="flex items-center gap-1.5 font-mono-premium text-[11px]">
                            <Cpu size={13} className="text-slate-400 animate-pulse" />
                            Core Engine Execution Path Log
                          </span>
                          <ChevronRight size={14} className="transform transition-transform group-open:rotate-90 text-slate-400" />
                        </summary>
                        <div className="px-4 pb-4 pt-2 font-mono-premium text-[11px] text-slate-500 border-t border-slate-100 whitespace-pre-wrap leading-relaxed bg-slate-50/50 max-h-60 overflow-y-auto">
                          {msg.reasoning_details}
                        </div>
                      </details>
                    )}

                    {/* Main AI Body Output with Premium Refined Structure */}
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md shrink-0 mt-0.5">
                        <Sparkles size={14} />
                      </div>
                      <div className="flex-1">
                        <ProfessionalMarkdown text={msg.content} />
                      </div>
                    </div>

                  </div>
                )}

              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm w-56 font-mono-premium">
              <Cpu size={14} className="animate-spin text-blue-600" />
              <span className="tracking-wide animate-pulse">PROCESSING TELEMETRY...</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Center */}
      <footer className="p-4 bg-white border-t border-slate-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
        <form onSubmit={sendMessage} className="max-w-3xl mx-auto flex items-end gap-2">
          
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept=".txt,.csv,.json,.log" />
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            className="p-3.5 text-slate-400 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all shrink-0 mb-0.5"
            title="Attach Log Data"
          >
            <Paperclip size={18} />
          </button>

          <div className="relative flex-1">
            <textarea 
              rows={1}
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your market position or paste execution logs..." 
              className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 rounded-xl pl-4 pr-12 py-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all resize-none min-h-[48px] max-h-[120px] font-medium"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 bottom-2 p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all"
            >
              <Send size={14} />
            </button>
          </div>

        </form>
      </footer>

    </div>
  );
}
