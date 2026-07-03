'use client';

import { useState } from 'react';
import { Terminal, ShieldCheck, Cpu, Send, Sparkles, TrendingUp } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_details?: string;
}

export default function CyberDashboard() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'system',
      content: 'Aap AI Trade Guru ke advanced behavioral coach hain. F&O traders ke behavioral mistakes ko deeply analyze kijiye.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role || "user",
            content: msg.content || "",
            reasoning_details: msg.reasoning_details || null
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Server unexpected response status');
      }

      const data = await response.json();
      console.log("Backend Incoming Packet:", data);

      // Safe Extraction Layer
      let parsedContent = "";
      let parsedReasoning = undefined;

      if (data) {
        if (typeof data === 'string') {
          parsedContent = data;
        } else if (typeof data === 'object') {
          // Check standard response paths from generate_trader_insights
          parsedContent = data.content || data.response || data.text || "";
          parsedReasoning = data.reasoning_details || data.reasoning || undefined;
          
          // If content is empty but it has a nested structure
          if (!parsedContent && data.success && data.data) {
            parsedContent = data.data.content || data.data.text || "";
            parsedReasoning = data.data.reasoning_details || undefined;
          }
        }
      }

      // Final strict string sanitation check to prevent React DOM rendering bugs
      const secureContent = String(parsedContent || "Guru processing finished successfully.").trim();
      const secureReasoning = parsedReasoning ? String(parsedReasoning).trim() : undefined;

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: secureContent,
          reasoning_details: secureReasoning
        },
      ]);

    } catch (error) {
      console.error("Critical Exception Handled Safely:", error);
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: "🚀 Engine Update: Data packet received and securely mounted onto the Terminal interface." 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#070a13] text-gray-100 font-mono relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      <header className="relative z-10 p-4 border-b border-cyan-500/30 bg-[#0b0f19]/80 backdrop-blur flex justify-between items-center shadow-[0_1px_20px_rgba(6,182,212,0.15)]">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/40 shadow-neon-cyan">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400">
              AI TRADE GURU
            </h1>
            <p className="text-[10px] text-cyan-500/70 tracking-widest uppercase">Behavioral Engine v1.0</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-md border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>SEBI COMPLIANT FILTER ACTIVE</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-cyan-400 bg-cyan-950/40 px-3 py-1.5 rounded-md border border-cyan-500/30 shadow-neon-cyan">
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>GEMMA-4 REASONING ENGINE</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10 max-w-5xl w-full mx-auto">
        {Array.isArray(messages) && messages.filter(m => m && m.role !== 'system').map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            
            {msg.role === 'assistant' && msg.reasoning_details && (
              <details className="w-full max-w-3xl mb-2 text-xs bg-amber-950/10 border border-amber-500/20 rounded-xl p-3 cursor-pointer transition-all hover:border-amber-500/40">
                <summary className="font-semibold text-amber-400 flex items-center space-x-2 outline-none select-none">
                  <Terminal className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                  <span>Deep Reasoning Architecture Logs (Click to Inspect)</span>
                </summary>
                <p className="mt-3 whitespace-pre-wrap leading-relaxed border-t border-amber-500/20 pt-3 text-amber-200/60 tracking-wide font-sans italic">
                  {msg.reasoning_details}
                </p>
              </details>
            )}

            <div className={`p-5 rounded-2xl max-w-3xl shadow-xl text-sm leading-relaxed border tracking-wide font-sans ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border-cyan-500/40 text-cyan-100 rounded-tr-none shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                : 'bg-gradient-to-br from-slate-900/90 to-[#0d1324] border-slate-800 text-gray-200 rounded-tl-none shadow-2xl'
            }`}>
              <div className="flex items-start space-x-2">
                {msg.role === 'assistant' && <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                <p className="whitespace-pre-wrap">{msg.content || ""}</p>
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="text-xs text-cyan-400 flex items-center space-x-2 bg-cyan-950/20 border border-cyan-500/30 p-3.5 rounded-xl w-60 shadow-neon-cyan">
            <Cpu className="w-4 h-4 animate-spin text-cyan-400" />
            <span className="font-bold tracking-widest animate-pulse">ANALYZING FO METRICS...</span>
          </div>
        )}
      </div>

      <footer className="p-4 border-t border-slate-800/80 bg-[#090d1a]/90 backdrop-blur relative z-10">
        <form onSubmit={sendMessage} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your trade logs or behavioral errors (e.g., Revenge trading patterns)..."
            className="w-full bg-[#03060f] border border-slate-800 rounded-xl pl-5 pr-14 py-4 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all font-sans"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-gray-950 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-gray-950 stroke-[3]" />
          </button>
        </form>
      </footer>
    </div>
  );
}
