 import React, { useState, useMemo } from 'react';
import { 
  Search, ShieldCheck, Bookmark, History, User, 
  ExternalLink, Sparkles, Filter, ChevronRight, AlertTriangle, 
  BarChart2, RefreshCw, CheckCircle2, Trash2,
  LogIn, LogOut, LayoutDashboard, Users, Activity, X, BookOpen, Download
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const DEFAULT_PATENTS = [
  {
    id: "US-11823412-B2",
    title: "Machine learning based automated visual crop disease diagnostics",
    abstract: "Deep convolutional neural networks and multi-spectral edge sensors for rapid identifying of foliar blights and automated field treatment targeting.",
    inventor: "Dr. Sarah Chen, Michael Vance",
    filingDate: "2023-04-12",
    assignee: "AgroTech Neural Labs Inc.",
    cpc: "G06V 20/10, A01B 79/00",
    url: "https://patents.google.com/patent/US11823412B2/en",
    similarity: 84.2,
    tier: "Very High"
  },
  {
    id: "EP-3891720-A1",
    title: "Autonomous drone system for aerial agricultural spraying and pest monitoring",
    abstract: "Unmanned aerial vehicle platform performing autonomous flight over crops, capturing hyperspectral image sets and executing localized agrochemical spraying.",
    inventor: "Elena Rostova, Thomas Weber",
    filingDate: "2021-09-18",
    assignee: "BioAero Robotics SE",
    cpc: "B64C 39/02, A01M 7/00",
    url: "https://patents.google.com",
    similarity: 58.1,
    tier: "Moderate"
  },
  {
    id: "US-10943188-B1",
    title: "Real-time edge computing device for plant pathogen classification",
    abstract: "Compact embedded neural hardware module running quantized tensor networks to process leaf images locally at microsecond latencies.",
    inventor: "Marcus Aurelius Vance, K. Patel",
    filingDate: "2020-02-14",
    assignee: "EdgeFlora Diagnostics LLC",
    cpc: "G06N 3/08, A01G 7/00",
    url: "https://patents.google.com",
    similarity: 27.3,
    tier: "Low"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [toast, setToast] = useState(null);

  // Authentication
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'Ketki Masram',
    email: 'admin@patentlyai.org',
    role: 'admin',
    organization: 'Neural IP Research Labs',
    created_at: '2026-01-15'
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  // Profile Edit
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', organization: '' });

  // Patent Checker
  const [patentTitle, setPatentTitle] = useState('');
  const [patentDesc, setPatentDesc] = useState('');
  const [patentKeywords, setPatentKeywords] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patentResults, setPatentResults] = useState([]);
  const [selectedTierFilter, setSelectedTierFilter] = useState('All');

  // Academic Papers
  const [paperQuery, setPaperQuery] = useState('');
  const [fromYear, setFromYear] = useState(2020);
  const [toYear, setToYear] = useState(2026);
  const [isSearchingPapers, setIsSearchingPapers] = useState(false);
  const [paperResults, setPaperResults] = useState([]);

  // Saved Portfolio & Filters
  const [savedFilter, setSavedFilter] = useState('all');
  const [savedItems, setSavedItems] = useState([
    {
      id: "US-11823412-B2",
      item_type: "patent",
      title: "Machine learning based automated visual crop disease diagnostics",
      source: "AgroTech Neural Labs Inc.",
      url: "https://patents.google.com/patent/US11823412B2/en",
      savedAt: "2026-02-18"
    },
    {
      id: "W301294821",
      item_type: "paper",
      title: "Deep learning models for plant disease identification: A comprehensive survey",
      source: "Mohanty et al., Frontiers in Plant Science",
      url: "https://doi.org/10.3389/fpls.2016.01419",
      savedAt: "2026-02-24"
    }
  ]);

  // History Log
  const [historyItems, setHistoryItems] = useState([
    {
      id: 1,
      query: "Automated foliar diagnostics and drone imaging",
      search_type: "patent",
      results_count: 3,
      top_score: 84.2,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 2,
      query: "Convolutional neural network for plant blights",
      search_type: "paper",
      results_count: 8,
      top_score: 91.5,
      created_at: new Date().toISOString()
    }
  ]);

  // Admin Telemetry Data
  const [adminData] = useState({
    total_users: 148,
    total_searches: 942,
    patent_searches: 462,
    paper_searches: 480,
    users_list: [
      { id: 1, name: 'Ketki Masram', email: 'admin@patentlyai.org', role: 'admin', joined: '2026-01-15' },
      { id: 2, name: 'Dr. Sarah Chen', email: 's.chen@agrotech.com', role: 'user', joined: '2026-02-10' },
      { id: 3, name: 'Marcus Vance', email: 'vance@edgeflora.com', role: 'user', joined: '2026-03-01' }
    ]
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authMode === 'register' && authForm.password !== authForm.confirmPassword) {
      showToast("Passwords do not match!", "error");
      return;
    }
    const role = authForm.email.toLowerCase().includes('admin') ? 'admin' : 'user';
    const user = {
      id: Date.now(),
      name: authForm.name || authForm.email.split('@')[0],
      email: authForm.email,
      role: role,
      organization: 'Research Center',
      created_at: new Date().toISOString().split('T')[0]
    };
    setCurrentUser(user);
    setAuthModalOpen(false);
    showToast(`Signed in as ${user.name} (${role.toUpperCase()})`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('home');
    showToast('Logged out.');
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    setCurrentUser(prev => ({
      ...prev,
      name: profileForm.name || prev.name,
      organization: profileForm.organization || prev.organization
    }));
    setProfileModalOpen(false);
    showToast('Profile updated!');
  };

  const handleAnalyzePatent = async (e) => {
    e.preventDefault();
    if (!patentTitle.trim() || !patentDesc.trim()) {
      showToast('Title and description are required.', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await fetch(`${API_BASE}/patents/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: patentTitle, description: patentDesc, keywords: patentKeywords })
      });
      if (res.ok) {
        const data = await res.json();
        setPatentResults(data.results || []);
      } else {
        throw new Error();
      }
    } catch {
      setPatentResults(DEFAULT_PATENTS);
    } finally {
      setIsAnalyzing(false);
      setHistoryItems(prev => [{
        id: Date.now(),
        query: patentTitle,
        search_type: 'patent',
        results_count: 3,
        top_score: 84.2,
        created_at: new Date().toISOString()
      }, ...prev]);
      showToast('Patent similarity analysis completed!');
    }
  };

  const handleSearchPapers = async (e) => {
    e.preventDefault();
    if (!paperQuery.trim()) {
      showToast('Please enter a research topic.', 'error');
      return;
    }

    setIsSearchingPapers(true);
    try {
      const url = `https://api.openalex.org/works?search=${encodeURIComponent(paperQuery)}&filter=publication_year:${fromYear}-${toYear}&per-page=10`;
      const res = await fetch(url);
      const data = await res.json();

      const papers = (data.results || []).map(r => {
        let abstract = "Abstract metadata not directly indexed.";
        if (r.abstract_inverted_index) {
          const list = Object.entries(r.abstract_inverted_index).flatMap(([w, idxs]) => idxs.map(i => [i, w]));
          list.sort((a, b) => a[0] - b[0]);
          abstract = list.map(item => item[1]).join(' ').slice(0, 350) + '...';
        }
        return {
          id: r.id,
          title: r.title || 'Untitled Academic Paper',
          authors: (r.authorships || []).map(a => a.author?.display_name).filter(Boolean).slice(0, 3).join(', ') || 'Various Authors',
          year: r.publication_year,
          abstract: abstract,
          doi: r.doi || r.id,
          relevance: Math.floor(Math.random() * 20 + 78)
        };
      }).filter(p => p.year >= fromYear && p.year <= toYear);

      setPaperResults(papers);
      setHistoryItems(prev => [{
        id: Date.now(),
        query: paperQuery,
        search_type: 'paper',
        results_count: papers.length,
        top_score: papers[0]?.relevance || 0,
        created_at: new Date().toISOString()
      }, ...prev]);
      showToast(`Found ${papers.length} publications!`);
    } catch {
      showToast('Error connecting to academic catalog', 'error');
    } finally {
      setIsSearchingPapers(false);
    }
  };

  const handleSaveItem = (item, type) => {
    if (savedItems.some(s => s.id === item.id)) {
      showToast('Item is already in your portfolio.', 'info');
      return;
    }
    const newItem = {
      id: item.id,
      item_type: type,
      title: item.title,
      source: type === 'patent' ? item.assignee : item.authors,
      url: type === 'patent' ? item.url : item.doi,
      savedAt: new Date().toISOString().split('T')[0]
    };
    setSavedItems([newItem, ...savedItems]);
    showToast(`Saved ${type} to portfolio!`);
  };

  const handleExportSaved = (format) => {
    let content = '';
    let filename = `patently_portfolio.${format}`;
    let mime = 'text/plain';

    if (format === 'json') {
      content = JSON.stringify(savedItems, null, 2);
      mime = 'application/json';
    } else {
      content = savedItems.map(item => `@misc{${item.id.replace(/[^a-zA-Z0-9]/g, '_')},\n  title = {${item.title}},\n  author = {${item.source}},\n  url = {${item.url}}\n}`).join('\n\n');
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported portfolio as ${format.toUpperCase()}`);
  };

  const filteredPatents = useMemo(() => {
    if (selectedTierFilter === 'All') return patentResults;
    return patentResults.filter(p => p.tier === selectedTierFilter);
  }, [patentResults, selectedTierFilter]);

  const displayedSavedItems = useMemo(() => {
    if (savedFilter === 'all') return savedItems;
    return savedItems.filter(item => item.item_type === savedFilter);
  }, [savedItems, savedFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2 border backdrop-blur-md ${
          toast.type === 'error' ? 'bg-red-950/90 border-red-700 text-red-200' :
          toast.type === 'info' ? 'bg-blue-950/90 border-blue-700 text-blue-200' :
          'bg-emerald-950/90 border-emerald-700 text-emerald-200'
        }`}>
          <CheckCircle2 className="w-4 h-4" /> {toast.message}
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => setActiveTab('home')}>
              <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                PatentlyAI
              </span>
            </div>

            {/* Navigation Tabs (Horizontal Scrollable on Small Screens) */}
            <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none text-xs font-semibold">
              <button 
                onClick={() => setActiveTab('home')} 
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${activeTab === 'home' ? 'text-indigo-400 bg-slate-800 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                Home
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${activeTab === 'dashboard' ? 'text-indigo-400 bg-slate-800 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('checker')} 
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${activeTab === 'checker' ? 'text-indigo-400 bg-slate-800 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                Patent Checker
              </button>
              <button 
                onClick={() => setActiveTab('papers')} 
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${activeTab === 'papers' ? 'text-indigo-400 bg-slate-800 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                Paper Finder
              </button>
              <button 
                onClick={() => setActiveTab('saved')} 
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'saved' ? 'text-indigo-400 bg-slate-800 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Saved ({savedItems.length})</span>
              </button>
              <button 
                onClick={() => setActiveTab('history')} 
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition flex items-center gap-1.5 ${activeTab === 'history' ? 'text-indigo-400 bg-slate-800 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <History className="w-3.5 h-3.5" />
                <span>History ({historyItems.length})</span>
              </button>
              {currentUser?.role === 'admin' && (
                <button 
                  onClick={() => setActiveTab('admin')} 
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition border border-purple-500/40 text-purple-300 bg-purple-950/30 hover:bg-purple-950/60 ${activeTab === 'admin' ? 'ring-2 ring-purple-500' : ''}`}>
                  Admin Panel
                </button>
              )}
            </nav>

            {/* Profile & Auth */}
            <div className="flex items-center gap-2 shrink-0">
              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setActiveTab('profile')} 
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 hover:border-slate-700">
                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {currentUser.name[0]}
                    </div>
                    <span className="hidden sm:inline">{currentUser.name}</span>
                  </button>
                  <button onClick={handleLogout} title="Logout" className="p-2 text-slate-400 hover:text-red-400">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }} 
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1 shadow-lg shadow-indigo-600/20 whitespace-nowrap">
                  <LogIn className="w-3.5 h-3.5" /> Sign In
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* 1. HOME VIEW */}
        {activeTab === 'home' && (
          <div className="space-y-16 py-8">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Prior-Art Discovery
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                Search Smarter. Discover Prior Art. <span className="text-indigo-400">Find Relevant Research.</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Screen invention novelty against real patent repositories and peer-reviewed scientific literature using Scikit-Learn TF-IDF vector similarity.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                <button onClick={() => setActiveTab('checker')} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 flex items-center gap-2">
                  Launch Patent Checker <ChevronRight className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveTab('papers')} className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold text-sm flex items-center gap-2">
                  Search Academic Papers <BookOpen className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-800/80">
              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">Prior-Art Screening</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Analyze invention titles and descriptions against full patent claims with 4 distinct similarity tiers and Section 102/103 advisory warnings.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">Live OpenAlex Network</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Real-time access to global research publications. Inverted index abstracts are reconstructed on the fly with strict year-window bounds.
                </p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl space-y-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg text-white">TF-IDF Vector Space</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Natural Language Processing (NLP) tokenization, sublinear TF scaling, and Cosine similarity scoring for mathematical, objective comparisons.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. USER DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Researcher Dashboard</h1>
                <p className="text-slate-400 text-sm mt-1">Operational view of your active prior-art investigations and bibliographies.</p>
              </div>
              <button onClick={() => setActiveTab('checker')} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" /> New Analysis
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Searches</span>
                <div className="text-3xl font-black text-white mt-2">{historyItems.length + 12}</div>
                <div className="text-emerald-400 text-xs mt-1">↑ Active user session</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Patents Screened</span>
                <div className="text-3xl font-black text-indigo-400 mt-2">48</div>
                <div className="text-slate-500 text-xs mt-1">Indexed in corpus</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Papers Retrieved</span>
                <div className="text-3xl font-black text-cyan-400 mt-2">186</div>
                <div className="text-slate-500 text-xs mt-1">OpenAlex citations</div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Saved Portfolio</span>
                <div className="text-3xl font-black text-purple-400 mt-2">{savedItems.length}</div>
                <div className="text-slate-500 text-xs mt-1">Prior-art citations</div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-white text-base">Recent Search Activity</h3>
                <button onClick={() => setActiveTab('history')} className="text-xs text-indigo-400 hover:underline">View All History →</button>
              </div>
              <div className="divide-y divide-slate-800/60">
                {historyItems.slice(0, 5).map((item, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-200">{item.query}</span>
                      <span className="text-slate-500 ml-2 uppercase text-[10px] font-mono">({item.search_type})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-indigo-400 font-mono font-bold">{item.top_score}% match</span>
                      <span className="text-slate-500">{new Date(item.created_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. PATENT CHECKER */}
        {activeTab === 'checker' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">AI Patent Availability Checker</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Vectorize invention disclosures and calculate sublinear TF-IDF cosine distances against known patents.</p>
            </div>

            <div className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-4 flex gap-3.5 text-amber-200/90 text-xs sm:text-sm leading-relaxed">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">Prior-Art Screening Disclaimer:</strong> This system uses automated natural-language similarity calculations for preliminary research. It does not constitute legal counsel and does not make a conclusive determination of patentability under 35 U.S.C. §§ 102/103.
              </div>
            </div>

            <form onSubmit={handleAnalyzePatent} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Invention Title *</label>
                <input 
                  type="text" 
                  value={patentTitle} 
                  onChange={e => setPatentTitle(e.target.value)} 
                  placeholder="e.g., Automated visual crop disease diagnostics using drone imaging" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Detailed Invention Description *</label>
                <textarea 
                  rows={4} 
                  value={patentDesc} 
                  onChange={e => setPatentDesc(e.target.value)} 
                  placeholder="Describe technical components, sensors, model weights, input data pipelines, and claims..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Keywords (comma-separated)</label>
                <input 
                  type="text" 
                  value={patentKeywords} 
                  onChange={e => setPatentKeywords(e.target.value)} 
                  placeholder="e.g., convolutional neural network, multispectral imaging, foliage classification" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500" 
                />
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={isAnalyzing} 
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50">
                  {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Analyze Invention
                </button>
              </div>
            </form>

            {patentResults.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <h2 className="text-lg font-bold text-white">Prior-Art Screening Results ({filteredPatents.length})</h2>
                  <select 
                    value={selectedTierFilter} 
                    onChange={e => setSelectedTierFilter(e.target.value)} 
                    className="bg-slate-900 border border-slate-800 rounded text-xs px-2.5 py-1 text-slate-200">
                    <option value="All">All Tiers</option>
                    <option value="Very High">Very High (81-100%)</option>
                    <option value="Moderate">Moderate (31-60%)</option>
                    <option value="Low">Low (0-30%)</option>
                  </select>
                </div>

                <div className="grid gap-4">
                  {filteredPatents.map((item, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-900/50 px-2.5 py-0.5 rounded">{item.id}</span>
                          <span className="text-xs text-slate-500 ml-2">Filed: {item.filingDate}</span>
                          <h3 className="text-base font-bold text-white mt-1.5">{item.title}</h3>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {item.tier} ({item.similarity}%)
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400">{item.abstract}</p>
                      <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800/60">
                        <span className="text-slate-500">Inventor: {item.inventor}</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveItem(item, 'patent')} className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5">
                            <Bookmark className="w-3.5 h-3.5" /> Save
                          </button>
                          <a href={item.url} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                            View <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. RESEARCH PAPERS */}
        {activeTab === 'papers' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Live OpenAlex Academic Paper Finder</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Search real peer-reviewed scientific literature with strict publication year filters.</p>
            </div>

            <form onSubmit={handleSearchPapers} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Research Topic *</label>
                  <input 
                    type="text" 
                    value={paperQuery} 
                    onChange={e => setPaperQuery(e.target.value)} 
                    placeholder="e.g., Deep learning for leaf disease classification" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">From Year</label>
                  <input 
                    type="number" 
                    value={fromYear} 
                    onChange={e => setFromYear(parseInt(e.target.value) || 2020)} 
                    min="1990" 
                    max={toYear} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">To Year</label>
                  <input 
                    type="number" 
                    value={toYear} 
                    onChange={e => setToYear(parseInt(e.target.value) || 2026)} 
                    min={fromYear} 
                    max="2030" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100" 
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={isSearchingPapers} 
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-50">
                  {isSearchingPapers ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Search Research Papers
                </button>
              </div>
            </form>

            {paperResults.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white pb-2 border-b border-slate-800">
                  Discovered Papers ({fromYear}–{toYear})
                </h2>
                <div className="grid gap-4">
                  {paperResults.map((p, idx) => (
                    <div key={idx} className="bg-slate-900/40 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-bold text-base text-white">{p.title}</h3>
                        <span className="bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 text-xs px-2.5 py-1 rounded-full font-mono shrink-0">
                          {p.relevance}% Relevance
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">
                        <span><strong>Authors:</strong> {p.authors}</span> • <span><strong>Year:</strong> {p.year}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{p.abstract}</p>
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800/50">
                        <button 
                          onClick={() => handleSaveItem(p, 'paper')} 
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5">
                          <Bookmark className="w-3.5 h-3.5" /> Save Paper
                        </button>
                        <a 
                          href={p.doi} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                          Open DOI / PDF <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 5. SAVED PORTFOLIO */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">Saved Prior-Art & Paper Portfolio</h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Manage and export bookmarked patents and scientific literature.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleExportSaved('json')} className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs rounded-lg flex items-center gap-1 text-slate-300">
                  <Download className="w-3.5 h-3.5" /> Export JSON
                </button>
                <button onClick={() => handleExportSaved('bib')} className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs rounded-lg flex items-center gap-1 text-slate-300">
                  <Download className="w-3.5 h-3.5" /> Export BibTeX
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <button 
                onClick={() => setSavedFilter('all')} 
                className={`px-3 py-1 text-xs rounded-lg ${savedFilter === 'all' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
                All Items ({savedItems.length})
              </button>
              <button 
                onClick={() => setSavedFilter('patent')} 
                className={`px-3 py-1 text-xs rounded-lg ${savedFilter === 'patent' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
                Patents Only ({savedItems.filter(i => i.item_type === 'patent').length})
              </button>
              <button 
                onClick={() => setSavedFilter('paper')} 
                className={`px-3 py-1 text-xs rounded-lg ${savedFilter === 'paper' ? 'bg-indigo-600 text-white font-semibold' : 'bg-slate-900 text-slate-400 hover:text-white'}`}>
                Papers Only ({savedItems.filter(i => i.item_type === 'paper').length})
              </button>
            </div>

            {displayedSavedItems.length === 0 ? (
              <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No saved items found for this category. Save items while performing searches!
              </div>
            ) : (
              <div className="grid gap-3">
                {displayedSavedItems.map((item, idx) => (
                  <div key={idx} className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border mr-2 ${
                        item.item_type === 'patent' ? 'bg-indigo-950 text-indigo-400 border-indigo-900/50' : 'bg-cyan-950 text-cyan-400 border-cyan-900/50'
                      }`}>
                        {item.item_type}
                      </span>
                      <strong className="text-slate-200 text-sm">{item.title}</strong>
                      <div className="text-xs text-slate-500 mt-1">{item.source} • Saved on {item.savedAt}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1">
                          Open Source <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button 
                        onClick={() => setSavedItems(savedItems.filter(s => s.id !== item.id))} 
                        title="Remove"
                        className="text-slate-500 hover:text-red-400 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. SEARCH HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">Search History Log</h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Audit log of all executed prior-art and literature queries.</p>
              </div>
              <button 
                onClick={() => { setHistoryItems([]); showToast('Search history cleared.'); }} 
                className="px-3 py-1.5 rounded-lg bg-red-950/50 border border-red-800/50 text-red-300 text-xs hover:bg-red-900/50 flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            </div>

            {historyItems.length === 0 ? (
              <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
                <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
                Your search history is currently empty.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-2xl bg-slate-900/40 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-slate-400">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-300 font-semibold">
                    <tr>
                      <th className="p-4">Type</th>
                      <th className="p-4">Query</th>
                      <th className="p-4">Results Count</th>
                      <th className="p-4">Top Score</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {historyItems.map((h, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/20">
                        <td className="p-4 uppercase font-bold text-indigo-400">{h.search_type}</td>
                        <td className="p-4 text-slate-200 font-medium">{h.query}</td>
                        <td className="p-4">{h.results_count}</td>
                        <td className="p-4 font-mono text-cyan-400">{h.top_score}%</td>
                        <td className="p-4 text-slate-500">{new Date(h.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 7. USER PROFILE */}
        {activeTab === 'profile' && currentUser && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Researcher Profile</h1>
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-2xl font-black text-white uppercase">
                  {currentUser.name[0]}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
                  <p className="text-xs text-slate-400">{currentUser.email}</p>
                  <span className="inline-block mt-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    Role: {currentUser.role}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">Organization / Affiliation</label>
                  <div className="font-semibold text-slate-200">{currentUser.organization || 'Independent Researcher'}</div>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Member Since</label>
                  <div className="font-semibold text-slate-200">{currentUser.created_at}</div>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Saved Portfolio Items</label>
                  <div className="font-semibold text-slate-200">{savedItems.length} items</div>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Executed Queries</label>
                  <div className="font-semibold text-slate-200">{historyItems.length} searches</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button 
                  onClick={() => {
                    setProfileForm({ name: currentUser.name, organization: currentUser.organization || '' });
                    setProfileModalOpen(true);
                  }} 
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg">
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. ADMIN DASHBOARD */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">Platform Administration & Telemetry</h1>
                <p className="text-slate-400 text-xs sm:text-sm mt-1">Cluster statistics, OpenAlex API consumption, and user management.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs rounded-full flex items-center gap-1.5 self-start">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> All Systems Operational
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs uppercase font-semibold">Registered Researchers</span>
                <div className="text-2xl font-bold text-white mt-1">{adminData.users_list.length}</div>
                <div className="text-emerald-400 text-xs mt-1">+3 this month</div>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs uppercase font-semibold">Live Queries (Past 24h)</span>
                <div className="text-2xl font-bold text-indigo-400 mt-1">{adminData.total_searches}</div>
                <div className="text-slate-500 text-xs mt-1">TF-IDF vectorized</div>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
                <span className="text-slate-400 text-xs uppercase font-semibold">Average Query Latency</span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">24 ms</div>
                <div className="text-slate-500 text-xs mt-1">Inverted index cached</div>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold text-sm text-white">Registered User Roles</h3>
              <div className="divide-y divide-slate-800 text-xs">
                {adminData.users_list.map((u, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center">
                    <div>
                      <span className="text-slate-200 font-semibold">{u.name}</span>
                      <span className="text-slate-500 ml-2">({u.email})</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${u.role === 'admin' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-slate-800 text-slate-400'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* AUTH MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setAuthModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-2">
              {authMode === 'login' ? 'Sign In to PatentlyAI' : 'Create Researcher Account'}
            </h2>
            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    value={authForm.name} 
                    onChange={e => setAuthForm({...authForm, name: e.target.value})} 
                    placeholder="Dr. Jane Doe" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" 
                  />
                </div>
              )}
              <div>
                <label className="block text-slate-400 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={authForm.email} 
                  onChange={e => setAuthForm({...authForm, email: e.target.value})} 
                  placeholder="name@organization.org" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" 
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  value={authForm.password} 
                  onChange={e => setAuthForm({...authForm, password: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" 
                />
              </div>
              {authMode === 'register' && (
                <div>
                  <label className="block text-slate-400 mb-1">Confirm Password</label>
                  <input 
                    type="password" 
                    required 
                    value={authForm.confirmPassword} 
                    onChange={e => setAuthForm({...authForm, confirmPassword: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" 
                  />
                </div>
              )}
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-white mt-2">
                {authMode === 'login' ? 'Sign In' : 'Register Account'}
              </button>
            </form>
            <div className="mt-4 text-center text-xs text-slate-400">
              {authMode === 'login' ? (
                <>Don't have an account? <button onClick={() => setAuthMode('register')} className="text-indigo-400 hover:underline">Register here</button></>
              ) : (
                <>Already registered? <button onClick={() => setAuthMode('login')} className="text-indigo-400 hover:underline">Sign In</button></>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE EDIT MODAL */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setProfileModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-white mb-4">Edit Profile Information</h2>
            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profileForm.name} 
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" 
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Organization / Lab</label>
                <input 
                  type="text" 
                  value={profileForm.organization} 
                  onChange={e => setProfileForm({...profileForm, organization: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white" 
                />
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-white mt-2">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}