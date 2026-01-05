
import React, { useState, useEffect, useCallback } from 'react';
import { Habit, ViewMode, Theme } from './types';
import { INITIAL_HABITS, THEMES } from './constants';
import { HabitForm } from './components/HabitForm';
import { Dashboard } from './components/Dashboard';
import { getHabitInsights } from './services/geminiService';

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('zenhabit_data');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('zenhabit_theme');
    if (saved) {
      const parsed = JSON.parse(saved);
      const found = THEMES.find(t => t.id === parsed.id);
      return found || THEMES[0];
    }
    return THEMES[0];
  });

  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [showAddForm, setShowAddForm] = useState(false);
  const [aiInsight, setAiInsight] = useState<{insight: string, suggestion: string, quote: string} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('zenhabit_data', JSON.stringify(habits));
    
    // Trigger visual feedback when habits change
    const handleHabitChange = () => {
      // Add any additional logic here when habits change
    };
    
    handleHabitChange();
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('zenhabit_theme', JSON.stringify(theme));
    document.documentElement.style.setProperty('--theme-primary', theme.primary);
    document.documentElement.style.setProperty('--theme-accent', theme.accent);
    
    // Apply global body background based on theme
    if (theme.isDark) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#020617'; // Slate 950
      document.body.style.color = '#f8fafc';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f8fafc';
      document.body.style.color = '#0f172a';
    }
  }, [theme]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
  };

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info' | 'error'} | null>(null);
  
  const toggleHabitDate = (habitId: string, dateStr: string) => {
    const habit = habits.find(h => h.id === habitId);
    const isCompleted = habit?.completedDates.includes(dateStr);
    
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          completedDates: isCompleted 
            ? h.completedDates.filter(d => d !== dateStr)
            : [...h.completedDates, dateStr]
        };
      }
      return h;
    }));
    
    // Show notification
    if (habit) {
      setNotification({
        message: isCompleted 
          ? `Removed "${habit.name}" from ${dateStr}` 
          : `Completed "${habit.name}" for ${dateStr}`,
        type: 'success'
      });
      
      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  const addHabit = (newHabit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => {
    const habit: Habit = {
      ...newHabit,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completedDates: []
    };
    setHabits(prev => [habit, ...prev]);
  };
  
  const deleteHabit = (habitId: string) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      setHabits(prev => prev.filter(h => h.id !== habitId));
      
      // Show notification
      const deletedHabit = habits.find(h => h.id === habitId);
      if (deletedHabit) {
        setNotification({
          message: `Removed "${deletedHabit.name}" from your routine`,
          type: 'info'
        });
        
        // Auto-hide notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    }
  };

  const fetchInsights = async () => {
    if (habits.length === 0) return;
    
    setIsAiLoading(true);
    
    try {
      const result = await getHabitInsights(habits);
      setAiInsight(result);
    } catch (error) {
      console.error('Error fetching insights:', error);
      // Use fallback response
      setAiInsight({
        insight: "Consistency is key. Small daily actions create lasting change.",
        suggestion: "Focus on one habit at a time for maximum impact.",
        quote: "The journey of a thousand miles begins with a single step."
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

  return (
    <div className={`min-h-screen pb-10 transition-colors duration-500 ${theme.isDark ? 'bg-[#020617]' : 'bg-[#f8fafc]'}`}>
      
      {/* Enhanced Sticky Header */}
      <header className={`sticky top-0 z-[60] backdrop-blur-xl transition-all duration-500 border-b ${theme.isDark ? 'bg-[#020617]/85 border-slate-800 shadow-2xl shadow-black/40' : 'bg-white/85 border-slate-200 shadow-sm shadow-slate-200/50'}`}>
        <div className="max-w-[1440px] mx-auto">
          {/* Main Tier */}
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: theme.primary }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className={`text-lg font-black tracking-tighter leading-none ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Life Changer</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">Mastery</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowThemeMenu(true)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${
                  theme.isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }}></div>
              </button>
              <button 
                onClick={() => setShowAddForm(true)}
                className="text-white h-10 px-4 rounded-xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all shadow-lg"
                style={{ backgroundColor: theme.primary }}
              >
                New
              </button>
            </div>
          </div>

          {/* Sub-Navigation Tier */}
          <div className={`border-t py-2 px-4 flex items-center gap-3 overflow-x-auto no-scrollbar ${theme.isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <div className={`p-0.5 rounded-lg flex items-center flex-shrink-0 ${theme.isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
              {(['weekly', 'monthly', 'yearly'] as ViewMode[]).map((mode) => (
                <button 
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${
                    viewMode === mode 
                      ? (theme.isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900 shadow-sm') 
                      : 'text-slate-500'
                  }`}
                  style={viewMode === mode && !theme.isDark ? { color: theme.primary } : undefined}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
               {viewMode !== 'yearly' && (
                  <select 
                    value={month} 
                    onChange={(e) => setMonth(Number(e.target.value))}
                    className={`appearance-none px-3 py-1.5 rounded-lg text-[10px] font-bold border outline-none ${
                      theme.isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                  </select>
               )}
               <select 
                  value={year} 
                  onChange={(e) => setYear(Number(e.target.value))}
                  className={`appearance-none px-3 py-1.5 rounded-lg text-[10px] font-bold border outline-none ${
                    theme.isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-700'
                  }`}
               >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
               </select>
            </div>
            
            <div className="flex-grow"></div>

            <button 
              onClick={requestNotificationPermission}
              className={`p-1.5 rounded-lg border transition-all flex-shrink-0 ${
                notificationStatus === 'granted' ? 'opacity-100' : 'opacity-40'
              } ${theme.isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              <svg className="w-4 h-4" style={{ color: notificationStatus === 'granted' ? theme.primary : 'currentColor' }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 py-6 space-y-6">
        
        {/* Hero Stack */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <section className={`md:col-span-8 bg-gradient-to-br ${theme.gradient} rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden`}>
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
             <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                  AI Behavior Coaching
                </div>
                {isAiLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-white/20 rounded-lg w-3/4"></div>
                    <div className="h-16 bg-white/10 rounded-xl w-full"></div>
                  </div>
                ) : aiInsight ? (
                  <div className="animate-in fade-in duration-700">
                    <h2 className="text-xl font-black leading-tight mb-2">{aiInsight.suggestion}</h2>
                    <p className="text-white/80 text-xs leading-relaxed mb-4">{aiInsight.insight}</p>
                    <div className="p-3 bg-black/20 rounded-xl italic text-[11px] flex gap-2">
                       <span className="text-lg text-white/40">“</span>
                       {aiInsight.quote}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={fetchInsights}
                        disabled={isAiLoading}
                        className={`p-2 rounded-lg ${isAiLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
                        style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                     <h2 className="text-2xl font-black mb-2">Connect Your Mind</h2>
                     <p className="text-white/80 text-xs mb-4">Analyze patterns with Gemini AI to optimize your morning routine.</p>
                     <button onClick={fetchInsights} className="bg-white text-slate-900 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">
                       Analyze Progress
                     </button>
                  </div>
                )}
             </div>
          </section>

          <section 
            className={`md:col-span-4 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[180px]`}
            style={{ backgroundColor: theme.primary }}
          >
             <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">Daily Snapshot</h3>
             <div className="grid grid-cols-2 gap-4">
                <div>
                   <p className="text-[10px] opacity-70 font-bold uppercase mb-1">Active</p>
                   <p className="text-3xl font-black">{habits.length}</p>
                </div>
                <div>
                   <p className="text-[10px] opacity-70 font-bold uppercase mb-1">Done Today</p>
                   <p className="text-3xl font-black">
                     {habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length}
                   </p>
                </div>
             </div>
             <div className="mt-6">
                <div className="flex justify-between items-center text-[9px] font-black uppercase mb-1.5">
                   <span>Consistency</span>
                   <span>{habits.length > 0 ? Math.round((habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length / habits.length) * 100) : 0}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-white transition-all duration-1000" 
                     style={{ width: `${habits.length > 0 ? (habits.filter(h => h.completedDates.includes(new Date().toISOString().split('T')[0])).length / habits.length) * 100 : 0}%` }}
                   ></div>
                </div>
             </div>
          </section>
        </div>

        <Dashboard 
          habits={habits} 
          year={year} 
          month={month} 
          viewMode={viewMode}
          theme={theme}
          onToggle={toggleHabitDate} 
          onDelete={deleteHabit}
        />

        {showAddForm && (
          <HabitForm 
            theme={theme}
            onAdd={(h) => { addHabit(h); setShowAddForm(false); }} 
            onClose={() => setShowAddForm(false)} 
          />
        )}
        
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl font-bold text-sm shadow-lg z-[100] transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 
            notification.type === 'error' ? 'bg-red-500 text-white' : 
            'bg-blue-500 text-white'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Theme Modal */}
        {showThemeMenu && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={() => setShowThemeMenu(false)}>
            <div className={`w-full max-w-sm rounded-[2.5rem] p-6 border animate-in slide-in-from-bottom duration-300 ${theme.isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                 <h4 className={`text-xs font-black uppercase tracking-widest opacity-50 ${theme.isDark ? 'text-white' : 'text-slate-900'}`}>Global Appearance</h4>
                 <button onClick={() => setShowThemeMenu(false)} className="text-slate-400 p-2">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {THEMES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setTheme(t); setShowThemeMenu(false); }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      theme.id === t.id 
                        ? (theme.isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-sm') 
                        : 'border-transparent'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: t.primary }}></div>
                    <span className={`text-[11px] font-bold ${theme.isDark ? 'text-slate-200' : 'text-slate-600'}`}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER: ALWAYS HIGHLIGHTED */}
      <footer className={`px-6 py-12 flex flex-col items-center gap-4 border-t mt-12 transition-all ${theme.isDark ? 'border-slate-800 bg-slate-900/10' : 'border-slate-200 bg-slate-50/50'}`}>
         <div className="flex flex-col items-center gap-3 text-center">
           <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme.isDark ? 'text-slate-500' : 'text-slate-400'}`}>
             Life Changer AI • 2025
           </div>
           <div className={`px-6 py-3 rounded-full text-[12px] font-black uppercase tracking-[0.2em] shadow-xl transition-all border transform hover:scale-105 ${
             theme.isDark 
               ? 'bg-slate-900 border-slate-700 text-white shadow-black/60' 
               : 'bg-white border-slate-100 text-slate-900 shadow-slate-200'
           }`}>
             Developed by <span style={{ color: theme.primary }} className="font-black italic underline decoration-4 underline-offset-8">Tushar Singh</span>
           </div>
         </div>
      </footer>
    </div>
  );
};

export default App;
