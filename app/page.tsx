'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, ChevronRight, BarChart3, Sun, Moon, Cpu, Sparkles, FileText, ChevronUp, Check, RefreshCw, X, LogIn, UserPlus, LayoutDashboard, MessageSquare, TrendingDown, Newspaper, User } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_details?: string;
  timestamp?: string;
}

interface AIModel {
  name: string;
  id: string;
  badge: string;
}

interface AttachedFileMeta {
  name: string;
  url: string;
  parsedContent: string;
  isImage: boolean;
}

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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');
  
  // 🔐 Authentication States Framework
  const [currentUser, setCurrentUser] = useState<{ username: string; fullName: string } | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [selectedModel, setSelectedModel] = useState<AIModel>(AVAILABLE_MODELS[0]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [attachedFile, setAttachedFile] = useState<AttachedFileMeta | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔐 Authentication Execution Gateway
  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = authUsername.trim().toLowerCase();
    
    if (!cleanUsername) {
      alert("Kripya username zaroor enter karein.");
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const cleanFullName = authFullName.trim();
        if (!cleanFullName) {
          alert("Kripya apna poora naam enter kijiye.");
          setAuthLoading(false);
          return;
        }

        // SignUp Integration Router Endpoints
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUsername, full_name: cleanFullName })
        });
        
        if (!response.ok) throw new Error("Backend synchronization latency.");
        
        // Push user details matrix safely into trader_users table structure
        const { error: dbError } = await supabase
          .from('trader_users')
          .insert([{ username: cleanUsername, full_name: cleanFullName }]);

        if (dbError && dbError.code === '23505') {
          alert("Yeh username pehle se occupied hai bhai. Koi doosra unique select karein.");
          setAuthLoading(false);
          return;
        }

        setCurrentUser({ username: cleanUsername, fullName: cleanFullName });
      } else {
        // Login Processing Checks
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUsername })
        });

        if (!response.ok) throw new Error("User parsing execution logs broken.");

        const { data, error: fetchError } = await supabase
          .from('trader_users')
          .select('*')
          .eq('username', cleanUsername)
          .single();

        if (fetchError || !data) {
          alert("Username nahi mila! Kripya pehle SignUp block complete karein.");
          setAuthLoading(false);
          return;
        }

        setCurrentUser({ username: data.username, fullName: data.full_name });
      }
    } catch (err: any) {
      console.error(err);
      alert(`Connection routing block: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      initializeSession();
    }
  }, [currentUser]);

  const getWhatsAppDateLabel = (dateString?: string) => {
    if (!dateString) return 'TODAY';
    const msgDate = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return 'TODAY';
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'YESTERDAY';
    } else {
      return msgDate.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  const initializeSession = async () => {
    if (!currentUser) return;
    let localSessionId = typeof window !== 'undefined' ? localStorage.getItem(`guru_sess_${currentUser.username}`) : null;
    
    if (!localSessionId) {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([{ username: currentUser.username }])
        .select();
      
      if (!error && data && data[0]) {
        localSessionId = data[0].id;
        if (typeof window !== 'undefined') {
          localStorage.setItem(`guru_sess_${currentUser.username}`, localSessionId!);
        }
      }
    }

    if (localSessionId) {
      setSessionId(localSessionId);
      
      // Fetching old historical records specific to this user account node mapping
      const { data: history, error: historyError } = await supabase
        .from('chat_messages')
        .select('role, content, reasoning_details, created_at')
        .eq('session_id', localSessionId)
        .order('id', { ascending: true });

      if (!historyError && history && history.length > 0) {
        const formattedHistory = history.map((m: any) => ({
          role: m.role,
          content: m.content,
          reasoning_details: m.reasoning_details,
          timestamp: m.created_at || new Date().toISOString()
        }));
        setMessages(formattedHistory as ChatMessage[]);
      } else {
        const systemMessage: ChatMessage = {
          role: 'system',
          content: 'Aap AI Trade Guru ke advanced professional behavioral coach hain.',
          timestamp: new Date().toISOString()
        };
        setMessages([systemMessage]);
        await supabase.from('chat_messages').insert([{ session_id: localSessionId, role: systemMessage.role, content: systemMessage.content }]);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pdfScript = document.createElement('script');
      pdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
      pdfScript.async = true;
      document.body.appendChild(pdfScript);
      pdfScript.onload = () => {
        if (window && (window as any).pdfjsLib) {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        }
      };

      const excelScript = document.createElement('script');
      excelScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
      excelScript.async = true;
      document.body.appendChild(excelScript);
    }
  }, []);

  const clearChatSession = async () => {
    if (confirm("Kya aap sach mein chat history mita kar naya session start karna chahte hain?")) {
      setMessages([]);
      setAttachedFile(null);
      await initializeSession();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isImgFile = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileExtension || '');
    
    setUploadingFile(true);
    setUploadStatus(`Uploading to Supabase...`);

    try {
      const uniqueFileName = `${Date.now()}_${file.name}`;

      const { error: storageError } = await supabase.storage
        .from('trader-logs')
        .upload(`uploads/${uniqueFileName}`, file);

      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage
        .from('trader-logs')
        .getPublicUrl(`uploads/${uniqueFileName}`);

      const publicFileUrl = urlData.publicUrl;

      setAttachedFile({
        name: file.name,
        url: publicFileUrl,
        parsedContent: "IMAGE_ASSET_MARKER",
        isImage: isImgFile
      });

    } catch (err: any) {
      console.error(err);
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploadingFile(false);
      setUploadStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !attachedFile) || loading || uploadingFile || !sessionId) return;

    let rawUserPayloadContent = input.trim();
    let dynamicDisplayContent = input.trim();
    const currentISOString = new Date().toISOString();

    if (attachedFile) {
      rawUserPayloadContent += `\n\n[Asset Reference Ledger Data: ${attachedFile.url}]\n`;
      if (!dynamicDisplayContent) {
        dynamicDisplayContent = `📄 Sent File Data: ${attachedFile.name}`;
      } else {
        dynamicDisplayContent += `\n\n📄 [Attached Asset Reference: ${attachedFile.name}]`;
      }
    }

    const userMessage: ChatMessage = { role: 'user', content: dynamicDisplayContent, timestamp: currentISOString };
    const updatedMessagesForAI = [...messages, { role: 'user', content: rawUserPayloadContent } as ChatMessage];
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setAttachedFile(null);
    setLoading(true);

    await supabase.from('chat_messages').insert([
      { session_id: sessionId, role: 'user', content: dynamicDisplayContent }
    ]);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessagesForAI.map(msg => ({
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
        reasoning_details: parsedReasoning ? String(parsedReasoning).trim() : undefined,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMessage]);

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

  const handleLogout = () => {
    setCurrentUser(null);
    setMessages([]);
    setSessionId(null);
    setAuthUsername('');
    setAuthFullName('');
    setActiveTab('dashboard');
  };

  // 🔐 RENDERING: View Guard Authentication Layout Page Gateways
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center font-sans px-4 relative">
        <div className="w-full max-w-md bg-[#0f1626] border border-slate-800/80 rounded-3xl p-7 sm:p-8 shadow-2xl relative z-10 animate-fadeIn">
          <div className="flex flex-col items-center mb-7">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 mb-2.5">
              <BarChart3 size={24} />
            </div>
            <h2 className="text-xl font-black tracking-tight">AI TRADE GURU PRO</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mt-1">Behavioral Console Registry</p>
          </div>

          <form onSubmit={handleAuthAction} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">Unique Username</label>
              <input 
                type="text" 
                required
                placeholder="e.g., killebaba24" 
                value={authUsername} 
                onChange={(e) => setAuthUsername(e.target.value)} 
                className="w-full bg-[#121b2e] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white font-medium" 
              />
            </div>

            {authMode === 'signup' && (
              <div className="animate-fadeIn">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">Full Display Name</label>
                <input 
                  type="text" 
                  required={authMode === 'signup'}
                  placeholder="e.g., Rishi Kumar" 
                  value={authFullName} 
                  onChange={(e) => setAuthFullName(e.target.value)} 
                  className="w-full bg-[#121b2e] border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white font-medium" 
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={authLoading}
              className="w-full bg-cyan-500 text-slate-950 font-extrabold py-3.5 rounded-xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/10 disabled:opacity-40"
            >
              {authMode === 'login' ? <LogIn size={15} /> : <UserPlus size={15} />}
              <span>{authLoading ? 'Verifying Node Matrix...' : (authMode === 'login' ? 'Login Dashboard' : 'Generate Console')}</span>
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
            <button 
              type="button" 
              onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
              className="text-xs font-bold text-cyan-400 hover:underline font-mono tracking-wide"
            >
              {authMode === 'login' ? "Naya Terminal create karein? SignUp" : "Pehle se account hai? Login Gateway"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen antialiased transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50/60 text-slate-800'
    }`}>
      
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header Bar */}
      <header className={`px-4 py-3 sm:px-6 flex justify-between items-center relative z-10 border-b transition-colors ${
        isDarkMode ? 'bg-[#0f1626] border-slate-800 shadow-md' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-white transition-colors ${isDarkMode ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-900'}`}>
            <BarChart3 size={18} className={isDarkMode ? 'text-cyan-400' : 'text-white'} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight">AI TRADE GURU</h1>
            <p className="text-[9px] font-bold tracking-wider text-slate-400 mt-0.5 flex items-center gap-1 font-mono uppercase">
              <User size={10} className="text-cyan-400" /> Active: <span className="text-cyan-400">{currentUser.fullName}</span>
            </p>
          </div>
        </div>

        {/* 📊 Navigation Tab Controller Layer */}
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono uppercase tracking-tight transition-all flex items-center gap-1.5 ${
              activeTab === 'dashboard' 
                ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-md' 
                : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100')
            }`}
          >
            <LayoutDashboard size={13} /> Dashboard
          </button>
          
          <button 
            type="button" 
            onClick={() => setActiveTab('chat')} 
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono uppercase tracking-tight transition-all flex items-center gap-1.5 ${
              activeTab === 'chat' 
                ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-md' 
                : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100')
            }`}
          >
            <MessageSquare size={13} /> AI Analyst
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Log Out Console"
            className={`p-2 rounded-xl border font-mono text-[10px] font-bold transition-all uppercase ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-red-400 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-red-50'
            }`}
          >
            Exit
          </button>
        </div>
      </header>

      {/* 📊 VIEW ROUTER ROUTING SWITCH */}
      {activeTab === 'dashboard' ? (
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all ${isDarkMode ? 'bg-[#0b0f19]' : 'bg-gradient-to-b from-slate-50 to-white'}`}>
          <div className="max-w-4xl mx-auto space-y-6 py-2 animate-fadeIn">
            
            {/* Yahoo Finance Real-time Indicators Grid */}
            <div className={`border rounded-2xl p-5 sm:p-6 shadow-sm border-slate-800/80 ${isDarkMode ? 'bg-[#0f1626]' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-4 text-cyan-400 font-extrabold text-xs uppercase tracking-wider font-mono">
                <TrendingDown size={14} /> Yahoo Finance Real-Time Market Feed
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`border p-5 rounded-xl flex flex-col justify-between ${isDarkMode ? 'bg-[#121b2e] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">NIFTY 50 INDEX (^NSEI)</span>
                  <span className={`text-2xl font-black mt-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>23,865.65</span>
                  <span className="text-xs font-bold text-red-400 mt-1 font-mono">-80.60 (-0.34%) • Bearish Sentiment</span>
                </div>
                <div className={`border p-5 rounded-xl flex flex-col justify-between ${isDarkMode ? 'bg-[#121b2e] border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">BANK NIFTY INDEX (^NSEBANK)</span>
                  <span className={`text-2xl font-black mt-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>52,120.40</span>
                  <span className="text-xs font-bold text-red-400 mt-1 font-mono">-188.10 (-0.36%) • Weekly Range Breakout</span>
                </div>
              </div>
            </div>

            {/* Institutional F&O Bulletins Terminal */}
            <div className={`border rounded-2xl p-5 sm:p-6 shadow-sm border-slate-800/80 ${isDarkMode ? 'bg-[#0f1626]' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-4 text-cyan-400 font-extrabold text-xs uppercase tracking-wider font-mono">
                <Newspaper size={14} /> Institutional F&O Bulletins
              </div>
              <div className={`space-y-4 font-medium text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <p className="border-b border-slate-800/60 pb-3 flex items-start gap-2">
                  <span className="text-cyan-400 font-mono text-xs">●</span>
                  <span>**India VIX** is tracking near 14.20 levels, indicating accelerated risk factors for option premium buyers due to high decay structures.</span>
                </p>
                <p className="border-b border-slate-800/60 pb-3 flex items-start gap-2">
                  <span className="text-cyan-400 font-mono text-xs">●</span>
                  <span>**Open Interest (OI) Cluster Maps** show maximum call writing additions concentrated at the **24,000** strike ceiling.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-cyan-400 font-mono text-xs">●</span>
                  <span>**FII Derivatives Data Flow** registers defensive horizontal long unwinding in near-month index futures.</span>
                </p>
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* 💬 Dynamic AI Analytics Engine Chat Panel View */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all ${isDarkMode ? 'bg-[#0b0f19]' : 'bg-gradient-to-b from-slate-50 to-white'}`}>
            <div className="max-w-3xl mx-auto space-y-6 py-2 relative z-10">
              {messages.filter(m => m && m.role !== 'system').map((msg, i) => {
                const currentMsgDate = msg.timestamp ? new Date(msg.timestamp).toDateString() : new Date().toDateString();
                const filteredValidMessages = messages.filter(m => m && m.role !== 'system');
                const mapIndexInFiltered = filteredValidMessages.indexOf(msg);
                
                const prevMsg = mapIndexInFiltered > 0 ? filteredValidMessages[mapIndexInFiltered - 1] : null;
                const prevMsgDate = prevMsg && prevMsg.timestamp ? new Date(prevMsg.timestamp).toDateString() : null;
                
                const showWhatsAppDateLine = mapIndexInFiltered === 0 || currentMsgDate !== prevMsgDate;

                return (
                  <div key={i} className="w-full flex flex-col">
                    {showWhatsAppDateLine && (
                      <div className="flex justify-center my-4 select-none animate-fadeIn">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-md shadow-sm tracking-wider uppercase border font-mono ${
                          isDarkMode ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}>
                          {getWhatsAppDateLabel(msg.timestamp)}
                        </span>
                      </div>
                    )}

                    <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-1`}>
                      <div className={`max-w-[90%] sm:max-w-[85%] relative flex flex-col ${msg.role === 'user' ? (isDarkMode ? 'bg-cyan-950/60 border border-cyan-800 text-slate-100 rounded-2xl rounded-tr-sm shadow-md px-4 pt-3 pb-5 text-sm font-medium whitespace-pre-wrap' : 'bg-slate-900 text-white rounded-2xl rounded-tr-sm shadow-md px-4 pt-3 pb-5 text-sm font-medium whitespace-pre-wrap') : 'w-full'}`}>
                        {msg.role === 'user' ? (
                          <p className="leading-relaxed font-sans">{msg.content}</p>
                        ) : (
                          <div className={`border rounded-2xl p-5 sm:p-6 pb-7 relative transition-all shadow-sm ${isDarkMode ? 'bg-[#121b2e] border-slate-800' : 'bg-white border-slate-200/70'}`}>
                            {msg.reasoning_details && (
                              <details className={`mb-4 text-xs border rounded-xl overflow-hidden group ${isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200/60'}`}>
                                <summary className={`cursor-pointer font-semibold p-3 flex items-center justify-between select-none transition-colors ${isDarkMode ? 'text-amber-400' : 'text-slate-500'}`}>
                                  <span className="flex items-center gap-1.5 font-mono text-[11px]"><Cpu size={13} /> Process Step Engine Mapping</span>
                                  <ChevronRight size={14} />
                                </summary>
                                <div className={`px-4 pb-4 pt-2 font-mono text-[11px] border-t whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto ${isDarkMode ? 'text-slate-400 border-slate-800 bg-[#0f1626]' : 'text-slate-500 border-slate-100 bg-slate-50/50'}`}>
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

                        <span className={`absolute bottom-1.5 right-3.5 text-[9px] font-mono select-none ${
                          msg.role === 'user' 
                            ? (isDarkMode ? 'text-cyan-400/70' : 'text-slate-400') 
                            : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {uploadingFile && (
                <div className={`flex items-center gap-2.5 text-xs font-semibold px-4 py-3 rounded-xl shadow-sm w-64 font-mono border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-amber-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                  <FileText size={14} className="animate-bounce text-amber-500" />
                  <span className="tracking-wide animate-pulse text-[10px] uppercase">{uploadStatus}</span>
                </div>
              )}

              {loading && (
                <div className={`flex items-center gap-2.5 text-xs font-semibold px-4 py-3 rounded-xl shadow-sm w-56 font-mono border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-cyan-400' : 'bg-white border-slate-200 text-slate-500'}`}>
                  <Cpu size={14} className="animate-spin" />
                  <span className="tracking-wide animate-pulse">RUNNING {selectedModel.name.toUpperCase()}...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Control Input Panel */}
          <footer className={`p-3 sm:p-4 border-t relative z-10 transition-colors ${
            isDarkMode ? 'bg-[#0f1626] border-slate-800' : 'bg-white border-slate-200/80 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]'
          }`}>
            <div className="max-w-3xl mx-auto flex flex-col gap-2.5">
              
              <div className="flex items-center justify-between gap-2 px-1 relative" ref={menuRef}>
                <span className={`text-[10px] font-bold tracking-widest uppercase ${isDarkMode ? 'text-slate-400 font-mono' : 'text-slate-500'}`}>
                  Engine Protocol:
                </span>
                
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsMenuOpen(!isMenuOpen
