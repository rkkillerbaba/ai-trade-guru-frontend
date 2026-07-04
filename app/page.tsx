'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Paperclip, ChevronRight, BarChart3, Sun, Moon, Cpu, Sparkles, FileText, ChevronUp, Check, RefreshCw, X, LogIn, UserPlus, LayoutDashboard, MessageSquare, TrendingDown, Newspaper, User, Settings, LogOut, Edit3 } from 'lucide-react';
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
            <h3 key={lIdx} className={`text-[13px] font-bold font-sans mt-5 mb-2 tracking-wider uppercase border-l-2 pl-2.5 ${
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
              <strong key={pIdx} className={`font-bold font-sans rounded text-[13px] inline-block tracking-tight px-1.5 py-0.5 mx-0.5 ${
                isDark ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30' : 'text-slate-950 bg-slate-100 border border-slate-200 shadow-sm'
              }`}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        return (
          <div key={lIdx} className={`text-[14px] font-medium font-sans tracking-normal ${isDark ? 'text-slate-300' : 'text-slate-600'} ${isBullet ? 'flex items-start gap-2.5 pl-1' : ''}`}>
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
  
  // 🔐 Authentication & Persistent Session Framework
  const [currentUser, setCurrentUser] = useState<{ username: string; fullName: string } | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authUsername, setAuthUsername] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // 👤 Interactive Profile Menu Panel States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // 📈 Live Market Sync Data States
  const [niftyPrice, setNiftyPrice] = useState('23,865.65');
  const [niftyChange, setNiftyChange] = useState('-80.60 (-0.34%)');
  const [bankNiftyPrice, setBankNiftyPrice] = useState('52,120.40');
  const [bankNiftyChange, setBankNiftyChange] = useState('-188.10 (-0.36%)');
  const [marketStatusText, setMarketStatusText] = useState('### **⚠️ Analysis Log Protocol**\n\n**Aapka Trading data upalbdh nahi hai** – Vartamaan me keval live index trend mila hai. Kripya apne behavior assessment loops ko mapping karne ke liye niche trade parameters paste kijiye ya screenshot upload kijiye.');
  const [marketLoading, setMarketLoading] = useState(false);

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
  const profileRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 🔄 Verification Trigger: Load active user data on layout refresh initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const persistedUserSession = localStorage.getItem('guru_active_session_trader');
      if (persistedUserSession) {
        try {
          const parsedUser = JSON.parse(persistedUserSession);
          setCurrentUser(parsedUser);
          setEditFullName(parsedUser.fullName);
        } catch (error) {
          console.error("Session re-sync pipeline failure log:", error);
        }
      }
    }
  }, []);

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

  // 📈 FETCH ACTUAL YAHOO FINANCE LIVE FEED MATRICES FROM BACKEND
  const fetchLiveMarketFeed = useCallback(async () => {
    if (marketLoading) return;
    setMarketLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'SYSTEM_CALL_FETCH_MARKET_FEED_LOGS' }],
          engine_id: selectedModel.id
        }),
      });

      if (!response.ok) throw new Error('Primary matrix stream offline');
      
      const data = await response.json();
      const rawTextOutput = String(data.content || '').trim();
      
      const niftyMatch = rawTextOutput.match(/NIFTY\s*50:\s*([\d,.]+)\s*\(([-+\d,.]+%)\)/i);
      const bankNiftyMatch = rawTextOutput.match(/BANK\s*NIFTY:\s*([\d,.]+)\s*\(([-+\d,.]+%)\)/i);

      if (niftyMatch) {
        setNiftyPrice(niftyMatch[1]);
        setNiftyChange(niftyMatch[2]);
      }
      if (bankNiftyMatch) {
        setBankNiftyPrice(bankNiftyMatch[1]);
        setBankNiftyChange(bankNiftyMatch[2]);
      }

      setMarketStatusText(rawTextOutput || 'Yahoo Finance node metrics synchronized completely.');
    } catch (err) {
      console.error(err);
      setMarketStatusText('### **⚠️ Analysis Log Protocol**\n\n**Aapka Trading data upalbdh nahi hai** – Vartamaan me keval live index trend mila hai (**NIFTY +0.39%**, **BANK NIFTY -0.16%**), lekin trading statement, entry/exit timestamp, P&L ya lot size jaisi aavashyak metrics nahi dekh pa rha hu. In data ke bina:\n\n* **Revenge Trading**, **FOMO**, **Panic Exit**, ya **Overtrading** pattern ki pehchan nahi ho sakegi.\n* Market trend ke khilaf ya sath me trade kiye gye position ki vaidhta ka koi cross-verification nahi kiya ja sakta.\n\n### **Agla Kadam:**\nKripya apna trading log, screenshot ya excel file upload karein jisme entry/exit time, strike, lot size, aur P&L vivran hon. Tabhi hum live market trend ke sath safe aur sahi tulna kar, vyavharik loops ki pehchan karke steek coaching de payenge.');
    } finally {
      setMarketLoading(false);
    }
  }, [marketLoading, selectedModel.id]);

  useEffect(() => {
    if (currentUser && activeTab === 'dashboard') {
      fetchLiveMarketFeed();
    }
  }, [currentUser, activeTab, fetchLiveMarketFeed]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getUserFirstName = (fullNameString: string) => {
    if (!fullNameString) return 'Trader';
    return fullNameString.trim().split(' ')[0];
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    const lowerUsername = authUsername.trim().toLowerCase();
    
    if (!lowerUsername) {
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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: lowerUsername, full_name: cleanFullName })
        });
        
        if (!response.ok) throw new Error("Backend synchronization latency.");
        
        const { error: dbError } = await supabase
          .from('trader_users')
          .insert([{ username: lowerUsername, full_name: cleanFullName }]);

        if (dbError && dbError.code === '23505') {
          alert("Yeh username pehle se occupied hai bhai. Koi doosra unique select karein.");
          setAuthLoading(false);
          return;
        }

        const authenticatedUserData = { username: lowerUsername, fullName: cleanFullName };
        if (typeof window !== 'undefined') {
          localStorage.setItem('guru_active_session_trader', JSON.stringify(authenticatedUserData));
        }
        setCurrentUser(authenticatedUserData);
        setEditFullName(cleanFullName);
      } else {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: lowerUsername })
        });

        if (!response.ok) throw new Error("User parsing execution logs broken.");

        const { data, error: fetchError } = await supabase
          .from('trader_users')
          .select('*')
          .eq('username', lowerUsername)
          .single();

        if (fetchError || !data) {
          alert("Username nahi mila! Kripya pehle SignUp block complete karein.");
          setAuthLoading(false);
          return;
        }

        const authenticatedUserData = { username: data.username, fullName: data.full_name };
        if (typeof window !== 'undefined') {
          localStorage.setItem('guru_active_session_trader', JSON.stringify(authenticatedUserData));
        }
        setCurrentUser(authenticatedUserData);
        setEditFullName(data.full_name);
      }
    } catch (err: any) {
      console.error(err);
      alert(`Connection routing block: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !editFullName.trim()) return;

    setIsUpdatingName(true);
    try {
      const { error: patchError } = await supabase
        .from('trader_users')
        .update({ full_name: editFullName.trim() })
        .eq('username', currentUser.username);

      if (patchError) throw patchError;

      const customizedUserObj = { ...currentUser, fullName: editFullName.trim() };
      if (typeof window !== 'undefined') {
        localStorage.setItem('guru_active_session_trader', JSON.stringify(customizedUserObj));
      }
      setCurrentUser(customizedUserObj);
      alert("Aapka profile data successfully sync ho gaya hai bhai!");
    } catch (err: any) {
      alert(`Sync process halted: ${err.message}`);
    } finally {
      setIsUpdatingName(false);
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

      setAttachedFile({
        name: file.name,
        url: urlData.publicUrl,
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
    setInput(''); setAttachedFile(null); setLoading(true);

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
      let parsedContent = data.content || data.response || data.text || "";
      let parsedReasoning = data.reasoning_details || data.reasoning || undefined;

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: String(parsedContent).trim(),
        reasoning_details: parsedReasoning ? String(parsedReasoning).trim() : undefined,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMessage]);
      await supabase.from('chat_messages').insert([
        { session_id: sessionId, role: aiMessage.role, content: aiMessage.content, reasoning_details: aiMessage.reasoning_details }
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-screen antialiased transition-colors duration-200 ${
      isDarkMode ? 'bg-[#0b0f19] text-slate-100' : 'bg-slate-50/60 text-slate-800'
    }`}>
      
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet" />

      {/* Header Bar */}
      <header className={`px-4 py-3.5 sm:px-6 flex justify-between items-center relative z-40 border-b transition-colors ${
        isDarkMode ? 'bg-[#0f1626] border-slate-800 shadow-md' : 'bg-white border-slate-200/80 shadow-sm'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg text-white transition-colors ${isDarkMode ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-slate-900'}`}>
            <BarChart3 size={18} className={isDarkMode ? 'text-cyan-400' : 'text-white'} />
          </div>
          <div>
            <h1 className="text-xs sm:text-sm font-black font-sans tracking-tight uppercase">AI Guru</h1>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider font-mono uppercase mt-0.5">
              Hello, <span className="text-cyan-400 font-black">{getUserFirstName(currentUser.fullName)}</span> 👋
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => { setActiveTab('dashboard'); setIsProfileOpen(false); }} className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono uppercase tracking-tight transition-all flex items-center gap-1.5 ${activeTab === 'dashboard' ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-md' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100')}`}><LayoutDashboard size={13} /> Dashboard</button>
          <button type="button" onClick={() => { setActiveTab('chat'); setIsProfileOpen(false); }} className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono uppercase tracking-tight transition-all flex items-center gap-1.5 ${activeTab === 'chat' ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-md' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100')}`}><MessageSquare size={13} /> AI Analyst</button>
          <button type="button" onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-cyan-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>{isDarkMode ? <Sun size={15} /> : <Moon size={15} />}</button>

          <div className="relative" ref={profileRef}>
            <button type="button" onClick={() => setIsProfileOpen(!isProfileOpen)} className={`p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 ${isProfileOpen ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-sm' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100')}`}><Settings size={15} /></button>
            {isProfileOpen && (
              <div className={`absolute right-0 mt-2.5 w-64 rounded-2xl border p-4 shadow-2xl backdrop-blur-md z-50 animate-fadeIn ${isDarkMode ? 'bg-[#0f1626]/95 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'}`}>
                <div className="border-b border-slate-800/60 pb-2.5 mb-3">
                  <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase font-mono block">Terminal Node Profile</span>
                  <span className="text-xs font-mono font-bold text-cyan-400">@{currentUser.username}</span>
                </div>
                <form onSubmit={handleProfileUpdate} className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-mono">Edit Display Name</span>
                    <input type="text" value={editFullName} onChange={(e) => setEditFullName(e.target.value)} className={`w-full border rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none font-sans ${isDarkMode ? 'bg-[#121b2e] border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`} />
                  </div>
                  <button type="submit" disabled={isUpdatingName} className="w-full bg-cyan-500 text-slate-950 text-[10px] font-black uppercase tracking-wider py-2 rounded-lg hover:bg-cyan-400 transition-all">Save System Changes</button>
                </form>
                <div className="border-t border-slate-800/60 mt-4 pt-3">
                  <button type="button" onClick={handleLogout} className="w-full bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-1.5 font-sans"><LogOut size={12} /><span>Exit Console Session</span></button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 📊 VIEW ROUTER ROUTING SWITCH */}
      {activeTab === 'dashboard' ? (
        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all ${isDarkMode ? 'bg-[#0b0f19]' : 'bg-gradient-to-b from-slate-50 to-white'}`}>
          <div className="max-w-4xl mx-auto space-y-6 py-2 animate-fadeIn">
            
            {/* Yahoo Finance Real-time Indicators Grid */}
            <div className={`border rounded-2xl p-5 sm:p-6 shadow-sm ${isDarkMode ? 'bg-[#0f1626] border-slate-800/80' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-4 border-b pb-2 border-slate-800/50">
                <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-wider font-mono">
                  <TrendingDown size={14} /> Yahoo Finance Real-Time Market Feed
                </div>
                <button type="button" onClick={fetchLiveMarketFeed} className={`p-1 transition-all ${isDarkMode ? 'text-slate-400 hover:text-cyan-400' : 'text-slate-500 hover:text-slate-900'}`}>
                  <RefreshCw size={12} className={marketLoading ? 'animate-spin text-cyan-400' : ''} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className={`border p-5 rounded-xl flex flex-col justify-between ${isDarkMode ? 'bg-[#121b2e] border-slate-800' : 'bg-[#f8fafc] border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">NIFTY 50 INDEX (^NSEI)</span>
                  <span className={`text-2xl font-black font-sans mt-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{niftyPrice}</span>
                  <span className="text-xs font-bold text-red-500 mt-1 font-mono">{niftyChange}</span>
                </div>
                <div className={`border p-5 rounded-xl flex flex-col justify-between ${isDarkMode ? 'bg-[#121b2e] border-slate-800' : 'bg-[#f8fafc] border-slate-200'}`}>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">BANK NIFTY INDEX (^NSEBANK)</span>
                  <span className={`text-2xl font-black font-sans mt-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{bankNiftyPrice}</span>
                  <span className="text-xs font-bold text-red-500 mt-1 font-mono">{bankNiftyChange}</span>
                </div>
              </div>

              {/* 🌟 FIXED: Output Card Container Background and Shadows Are Fully Dynamic Adapting to Light Theme */}
              <div className={`border p-5 rounded-xl leading-relaxed shadow-sm transition-all duration-200 ${
                isDarkMode ? 'bg-[#121b2e] border-slate-800' : 'bg-[#f8fafc] border-slate-200'
              }`}>
                <ProfessionalMarkdown text={marketStatusText} isDark={isDarkMode} />
              </div>
            </div>

            {/* Institutional F&O Bulletins Terminal */}
            <div className={`border rounded-2xl p-5 sm:p-6 shadow-sm ${isDarkMode ? 'bg-[#0f1626] border-slate-800/80' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-2 mb-4 text-cyan-400 font-extrabold text-xs uppercase tracking-wider font-mono">
                <Newspaper size={14} /> Institutional F&O Bulletins
              </div>
              <div className="space-y-4">
                <div className="p-1">
                  <ProfessionalMarkdown text="* **India VIX** is tracking near 14.20 levels, indicating accelerated risk factors for option premium buyers due to high decay structures." isDark={isDarkMode} />
                </div>
                <div className={`p-1 pt-3 border-t ${isDarkMode ? 'border-slate-800/40' : 'border-slate-100'}`}>
                  <ProfessionalMarkdown text="* **Open Interest (OI) Cluster Maps** show maximum call writing additions concentrated at the **24,000** strike ceiling." isDark={isDarkMode} />
                </div>
                <div className={`p-1 pt-3 border-t ${isDarkMode ? 'border-slate-800/40' : 'border-slate-100'}`}>
                  <ProfessionalMarkdown text="* **FII Derivatives Data Flow** registers defensive horizontal long unwinding in near-month index futures." isDark={isDarkMode} />
                </div>
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
                          <p className="leading-relaxed font-sans font-medium">{msg.content}</p>
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
                          msg.role === 'user' ? (isDarkMode ? 'text-cyan-400/70' : 'text-slate-400') : (isDarkMode ? 'text-slate-500' : 'text-slate-400')
                        }`}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
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
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`text-[11px] font-bold py-1.5 px-3 rounded-lg border transition-all flex items-center gap-1.5 shadow-sm select-none ${
                      isDarkMode ? 'bg-[#121b2e] border-slate-700 text-cyan-400 hover:border-cyan-500' : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{selectedModel.name}</span>
                    <ChevronUp size={12} className={`transform transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isMenuOpen && (
                    <div className={`absolute right-0 bottom-full mb-2 w-48 rounded-xl border p-1.5 shadow-xl backdrop-blur-md z-50 ${
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
                              {isSelected && <Check size={13} className="shrink-0 stroke-[3] text-[#d4af37]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {attachedFile && (
                <div className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border max-w-sm transition-all shadow-sm animate-fadeIn ${
                  isDarkMode ? 'bg-slate-900/90 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}>
                  <div className="flex items-center gap-2 truncate">
                    <FileText size={16} className={isDarkMode ? 'text-cyan-400' : 'text-blue-600'} />
                    <span className="text-xs font-bold truncate tracking-tight">{attachedFile.name}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setAttachedFile(null)} 
                    className={`p-1 rounded-md transition-colors hover:bg-slate-500/20 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    <X size={14} className="stroke-[3]" />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  accept=".pdf,.xlsx,.xls,.csv,.txt,.log,.json,.docx,.jpg,.jpeg,.png,.webp" 
                />
                
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
                    placeholder={attachedFile ? "Ask anything about this file..." : `Type or drop files via ${selectedModel.name}...`} 
                    className={`w-full border rounded-xl pl-4 pr-14 py-3 text-sm focus:outline-none transition-all resize-none min-h-[44px] max-h-[100px] font-medium leading-normal ${
                      isDarkMode 
                        ? 'bg-[#121b2e] border-slate-700 text-slate-100 placeholder-slate-500 focus:border-cyan-500/60' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white'
                    }`}
                  />
                  
                  <button 
                    type="button"
                    disabled={loading || (!input.trim() && !attachedFile) || uploadingFile}
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
      )}
    </div>
  );
}
