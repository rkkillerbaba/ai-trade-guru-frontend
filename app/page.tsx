'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, ChevronRight, BarChart3, Sun, Moon, Cpu, Sparkles, FileText, ChevronUp, Check, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// 📡 Supabase Client Initialization from Vercel Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_details?: string;
}

interface AIModel {
  name: string;
  id: string;
  badge: string;
}

// 🌐 Strictly Synced Stable Premium Free Cluster Mapping
const AVAILABLE_MODELS: AIModel[] = [
  { name: 'Gemini Pro', id: 'google/gemma-4-26b-a4b-it:free', badge: 'REASONING' },
  { name: 'GPT Pro', id: 'openai/gpt-oss-120b:free', badge: 'INTELLLECT' },
  { name: 'GPT Lite', id: 'openai/gpt-oss-20b:free', badge: 'SPEED' },
  { name: 'Nemotron Ultra', id: 'nvidia/nemotron-3-ultra-550b-a55b:free', badge: 'STRATEGY' }
];

function ProfessionalMarkdown({ text, isDark }: { text: string; isDark: boolean }) {
  if (!text) return null;
  const lines = text.split('\n');
  
  return (
    <div className={`space-y-3.5 leading-relaxed font-sans antialiased ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
      {lines.map((line, lIdx) => {
        let cleanLine = line.trim();
        if (!cleanLine) return <div key={lIdx} className="h-1.5" />;

        if (cleanLine.startsWith('###')) {
          return (
            <h3 key={lIdx} className={`text-[13px] font-bold mt-5 mb-2 tracking-wider uppercase border-l-2 pl-2.5 ${
              isDark ? 'text-cyan-400 border-cyan-400/60' : 'text-slate-900 border-blue-600'
            }`}>
              {cleanLine.replace('###', '').trim()}
            </h3>
          );
        }

        const isBullet = cleanLine.startsWith('* ') || cleanLine.startsWith('- ') || cleanLine.startsWith('• ');
        if (isBullet) {
          cleanLine = cleanLine.replace(/^([\*\-\•]\s*)/, '');
        }

        const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
        const renderedText = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className={`font-bold rounded text-[13px] inline-block tracking-tight px-1.5 py-0.5 mx-0.5 ${
                isDark ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30' : 'text-slate-950 bg-slate-100'
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
  const [selectedModel, setSelectedModel] = useState<AIModel>(AVAILABLE_MODELS[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 🔄 Auto Scroll System
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Click Outside Popover Controller
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 📝 Load External Parsing Scripts & Sync Cloud Handlers
  useEffect(() => {
    // 1. PDF Matrix Parser Engine Injection
    const pdfScript = document.createElement('script');
    pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    pdfScript.async = true;
    document.body.appendChild(pdfScript);
    pdfScript.onload = () => {
      if (window && (window as any).pdfjsLib) {
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      }
    };

    // 2. SheetJS Tabular Excel Module Injection
    const excelScript = document.createElement('script');
    excelScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    excelScript.async = true;
    document.body.appendChild(excelScript);

    // 💾 Initialize or Load Cloud Sessions
    initializeSession();

    return () => {
      document.body.removeChild(pdfScript);
      document.body.removeChild(excelScript);
    };
  }, []);

  // 🔑 Fetch Existing Session or Construct a New Identity Block
  const initializeSession = async () => {
    let localSessionId = localStorage.getItem('ai_trade_guru_session');
    
    if (!localSessionId) {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{}])
        .select();
      
      if (!error && data && data[0]) {
        localSessionId = data[0].id;
        localStorage.setItem('ai_trade_guru_session', localSessionId!);
      }
    }

    if (localSessionId) {
      setSessionId(localSessionId);
      
      // Pull history strictly from Supabase Database
      const { data: history, error: historyError } = await supabase
        .from('chat_messages')
        .select('role, content, reasoning_details')
        .eq('session_id', localSessionId)
        .order('id', { ascending: true });

      if (!historyError && history && history.length > 0) {
        setMessages(history as ChatMessage[]);
      } else {
        const systemMessage: ChatMessage = {
          role: 'system',
          content: 'Aap AI Trade Guru ke advanced behavioral coach hain. F&O traders ke behavioral mistakes ko deeply analyze kijiye.'
        };
        setMessages([systemMessage]);
        await supabase.from('chat_messages').insert([{ session_id: localSessionId, ...systemMessage }]);
      }
    }
  };

  // 🗑️ Hard Reset Session Command Trigger
  const clearChatSession = async () => {
    if (confirm("Kya aap sach mein chat history mita kar naya session start karna chahte hain?")) {
      localStorage.removeItem('ai_trade_guru_session');
      setMessages([]);
      await initializeSession();
    }
  };

  // 🚀 SUPABASE CLOUD FILE UPLOAD PIPELINE
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    setUploadingFile(true);
    setUploadStatus(`Uploading to Supabase...`);

    try {
      const uniqueFileName = `${Date.now()}_${file.name}`;

      // 1. Pipeline binary stream to Supabase Storage Bucket
      const { data: storageData, error: storageError } = await supabase.storage
        .from('trader-logs')
        .upload(`uploads/${uniqueFileName}`, file);

      if (storageError) throw storageError;

      // 2. Fetch public access URL reference path mapping
      const { data: urlData } = supabase.storage
        .from('trader-logs')
        .getPublicUrl(`uploads/${uniqueFileName}`);

      const publicFileUrl = urlData.publicUrl;

      // 3. Register meta metadata record to Supabase DB relational structure
      await supabase
        .from('user_uploads')
        .insert([
          { session_id: sessionId, file_name: file.name, file_url: publicFileUrl, file_type: fileExtension }
        ]);

      // 4. Client Side Fallback Context Read for Realtime Appending Pass
      if (['xlsx', 'xls', 'csv'].includes(fileExtension || '')) {
        const XLSX = (window as any).XLSX;
        if (XLSX) {
          const d = await file.arrayBuffer();
          const wb = XLSX.read(d, { type: 'array' });
          let txt = '';
          wb.SheetNames.forEach((n) => { txt += XLSX.utils.sheet_to_txt(wb.Sheets[n]); });
          setInput((prev) => `${prev}\n[Cloud Asset Reference: ${publicFileUrl}]\n${txt.trim()}`.trim());
        }
      } else if (fileExtension === 'pdf' || file.type === 'application/pdf') {
        const pdfjsLib = (window as any).pdfjsLib;
        if (pdfjsLib) {
          const arrayBuffer = await file.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          let compiledText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            compiledText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
          }
          setInput((prev) => `${prev}\n[Cloud Asset Reference: ${publicFileUrl}]\n${compiledText.trim()}`.trim());
        }
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (typeof event.target?.result === 'string') {
            setInput((prev) => `${prev}\n[Cloud Asset Reference: ${publicFileUrl}]\n${event.target?.result}`.trim());
          }
        };
        reader.readAsText(file);
      }

    } catch (err: any) {
      console.error(err);
      alert(`Upload Failed: Check if storage bucket "trader-logs" is set to Public. ${err.message}`);
    } finally {
      setUploadingFile(false);
      setUploadStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || uploadingFile || !sessionId) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Instant save user message tracking to Supabase DB
    await supabase.from('chat_messages').insert([
      { session_id: sessionId, role: userMessage.role, content: userMessage.content }
    ]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role || "user",
            content: msg.content || "",
            reasoning_details: msg.reasoning_details || null
          })),
          engine_id: selectedModel.id
        }),
      });

      if (!response.ok) throw new Error('Gateway route failure');

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

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: String(parsedContent).trim(),
        reasoning_details: parsedReasoning ? String(parsedReasoning).trim() : undefined
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Instant save AI model response matrix tracking to Supabase DB
      await supabase.from('chat_messages').insert([
        { 
          session_id: sessionId, 
          role: aiMessage.role, 
          content: aiMessage.content, 
          reasoning_details: aiMessage.reasoning_details 
        }
      ]);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-screen antialiased transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0b0f19] text-slate-100 font-sans' : 'bg-slate-50/60 text-slate-800 font-sans'
    }`}>
      
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <style jsx global>{`
        html, body { margin: 0; padding: 0; height: 100%; font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .font-mono-premium { font-family: 'JetBrains Mono', monospace !important; }
      `}</style>

      {/* Header Bar */}
      <header className={`px-4 py-3.5 sm:px-6 flex justify-between items-center relative z-10 border-b transition-colors ${
        isDarkMode ? 'bg-[#0f1626] border-slate-800 shadow-md' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-white transition-colors ${isDarkMode ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-900'}`}>
            <BarChart3 size={18} className={isDarkMode ? 'text-cyan-400' : 'text-white'} />
          </div>
          <div>
            <h1 className={`text-md font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI TRADE GURU</h1>
            <p className={`text-[9px] font-bold tracking-widest uppercase mt-0.5 ${isDarkMode ? 'text-cyan-400/80' : 'text-slate-400'}`}>
              Cloud Matrix Storage • <span className="text-blue-500 font-extrabold">{selectedModel.name}</span> Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 🗑️ Clear / Reset Session Button Layout */}
          <button
            type="button"
            onClick={clearChatSession}
            title="Start New Session"
            className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-red-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-red-600 hover:bg-slate-100'
            }`}
          >
            <RefreshCw size={17} />
          </button>

          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-cyan-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </div>
      </header>

      {/* Central Chat Feed */}
      <div className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all ${isDarkMode ? 'bg-[#0b0f19]' : 'bg-gradient-to-b from-slate-50 to-white'}`}>
        <div className="max-w-3xl mx-auto space-y-6 py-2 relative z-10">
          {messages.filter(m => m && m.role !== 'system').map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] sm:max-w-[85%] ${msg.role === 'user' ? (isDarkMode ? 'bg-cyan-950/60 border border-cyan-800 text-slate-100 rounded-2xl rounded-tr-sm shadow-md px-4 py-3 text-sm font-medium' : 'bg-slate-900 text-white rounded-2xl rounded-tr-sm shadow-md px-4 py-3 text-sm font-medium') : 'w-full'}`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap leading-relaxed font-sans">{msg.content}</p>
                ) : (
                  <div className={`border rounded-2xl p-5 sm:p-6 transition-all shadow-sm ${isDarkMode ? 'bg-[#121b2e] border-slate-800' : 'bg-white border-slate-200/70'}`}>
                    {msg.reasoning_details && (
                      <details className={`mb-4 text-xs border rounded-xl overflow-hidden group ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/60'}`}>
                        <summary className={`cursor-pointer font-semibold p-3 flex items-center justify-between select-none transition-colors ${isDarkMode ? 'text-amber-400' : 'text-slate-500'}`}>
                          <span className="flex items-center gap-1.5 font-mono-premium text-[11px]"><Cpu size={13} /> Process Step Engine Mapping</span>
                          <ChevronRight size={14} />
                        </summary>
                        <div className={`px-4 pb-4 pt-2 font-mono-premium text-[11px] border-t whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto ${isDarkMode ? 'text-slate-400 border-slate-800 bg-[#0f1626]' : 'text-slate-500 border-slate-100 bg-slate-50/50'}`}>
                          {msg.reasoning_details}
                        </div>
                      </details>
                    )}
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-md shrink-0 mt-0.5 ${isDarkMode ? 'bg-cyan-950/40 text-cyan-400' : 'bg-blue-50 text-blue-600'}`}><Sparkles size={14} /></div>
                      <div className="flex-1 w-full"><ProfessionalMarkdown text={msg.content} isDark={isDarkMode} /></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {uploadingFile && (
            <div className={`flex items-center gap-2.5 text-xs font-semibold px-4 py-3 rounded-xl shadow-sm w-64 font-mono-premium border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              <FileText size={14} className="animate-bounce text-amber-500" />
              <span className="tracking-wide animate-pulse text-[10px] uppercase">{uploadStatus}</span>
            </div>
          )}

          {loading && (
            <div className={`flex items-center gap-2.5 text-xs font-semibold px-4 py-3 rounded-xl shadow-sm w-56 font-mono-premium border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-cyan-400' : 'bg-white border-slate-200 text-slate-500'}`}>
              <Cpu size={14} className="animate-spin" />
              <span className="tracking-wide animate-pulse">RUNNING {selectedModel.name.toUpperCase()}...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* 🛠️ Footer Control Panel with Gold VIP Drop-Up Menu Check */}
      <footer className={`p-3 sm:p-4 border-t relative z-10 transition-colors ${
        isDarkMode ? 'bg-[#0f1626] border-slate-800' : 'bg-white border-slate-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]'
      }`}>
        <div className="max-w-3xl mx-auto flex flex-col gap-2.5">
          
          {/* Modern Floating Popover Trigger */}
          <div className="flex items-center justify-between gap-2 px-1 relative" ref={menuRef}>
            <span className={`text-[10px] font-bold tracking-widest uppercase ${isDarkMode ? 'text-slate-400 font-mono-premium' : 'text-slate-500'}`}>
              Engine Protocol:
            </span>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`text-[11px] font-bold py-1.5 px-3 rounded-lg border transition-all flex items-center gap-1.5 shadow-sm select-none ${
                  isDarkMode 
                    ? 'bg-[#121b2e] border-slate-700 text-cyan-400 hover:border-cyan-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{selectedModel.name}</span>
                <ChevronUp size={12} className={`transform transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* 🔮 Drop-up Popover Drawer with Golden VIP Check Icons */}
              {isMenuOpen && (
                <div className={`absolute right-0 bottom-full mb-2 w-48 rounded-xl border p-1.5 shadow-xl backdrop-blur-md transition-all z-50 ${
                  isDarkMode ? 'bg-[#0f1626]/95 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'
                }`}>
                  <div className="space-y-0.5">
                    {AVAILABLE_MODELS.map((model) => {
                      const isSelected = selectedModel.id === model.id;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => {
                            setSelectedModel(model);
                            setIsMenuOpen(false);
                          }}
                          className={`w-full text-left text-xs font-semibold px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                            isSelected 
                              ? (isDarkMode ? 'bg-slate-800/80 text-cyan-400 font-bold' : 'bg-slate-50 text-blue-600 font-bold') 
                              : (isDarkMode ? 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900')
                          }`}
                        >
                          <span>{model.name}</span>
                          {/* Luxury VIP Gold Check Icon */}
                          {isSelected && <Check size={13} className="shrink-0 stroke-[3] text-[#d4af37]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Input Bar Row */}
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload} 
              accept=".pdf,.xlsx,.xls,.csv,.txt,.log,.json,.docx" 
            />
            
            {/* Attachment Trigger */}
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className={`w-11 h-11 rounded-xl border transition-all shrink-0 flex items-center justify-center ${
                isDarkMode ? 'bg-[#121b2e] border-slate-700 text-slate-400 hover:text-cyan-400' : 'bg-slate-50 border-slate-300 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <Paperclip size={18} />
            </button>

            <div className="relative flex-1 flex items-center bg-transparent">
              <textarea 
                rows={1}
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Type or drop files via ${selectedModel.name}...`} 
                className={`w-full border rounded-xl pl-4 pr-14 py-3 text-sm focus:outline-none transition-all resize-none min-h-[44px] max-h-[100px] font-medium leading-normal ${
                  isDarkMode 
                    ? 'bg-[#121b2e] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-cyan-500/60' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'
                }`}
              />
              
              <button 
                type="button"
                disabled={loading || !input.trim() || uploadingFile}
                onClick={sendMessage}
                className={`absolute right-2 w-9 h-9 rounded-xl transition-all flex items-center justify-center shadow-md ${
                  isDarkMode 
                    ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:opacity-20' 
                    : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30'
                }`}
                style={{ top: '50%', transform: 'translateY(-50%)' }}
              >
                <Send size={15} className="stroke-[2.5]" />
              </button>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
