
import React, { useMemo, useState, useEffect } from 'react';
import { Habit, ViewMode, Theme } from '../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

interface DashboardProps {
  habits: Habit[];
  year: number;
  month: number;
  viewMode: ViewMode;
  theme: Theme;
  onToggle: (habitId: string, date: string) => void;
  onDelete?: (habitId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ habits, year, month, viewMode, theme, onToggle, onDelete }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const allDates = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(year, month, i + 1);
    return {
      dateStr: d.toISOString().split('T')[0],
      day: i + 1,
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      weekNum: Math.floor((d.getDate() + new Date(year, month, 1).getDay() - 1) / 7) + 1
    };
  }), [year, month, daysInMonth]);

  const activeWeeks = useMemo(() => {
    const w: Record<number, typeof allDates> = {};
    allDates.forEach(d => { if (!w[d.weekNum]) w[d.weekNum] = []; w[d.weekNum].push(d); });
    const weeksList = Object.entries(w).sort(([a], [b]) => Number(a) - Number(b));
    if (viewMode === 'weekly') return [weeksList.find(([_, days]) => days.some(d => d.dateStr === todayStr)) || weeksList[0]];
    return weeksList;
  }, [allDates, viewMode, todayStr]);

  const visibleDates = useMemo(() => activeWeeks.flatMap(([_, days]) => days), [activeWeeks]);

  const [animationKey, setAnimationKey] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');
  
  // Track which celebrations have been shown
  const [shownCelebrations, setShownCelebrations] = useState<{[key: string]: boolean}>({});
    
  // Re-calculate animation key when habits change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [habits]);
  
  const chartData = useMemo(() => {
    if (viewMode === 'yearly') {
      return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => {
        const monthDays = new Date(year, i + 1, 0).getDate();
        const totalPossible = habits.length * monthDays;
        let done = 0;
        habits.forEach(h => h.completedDates.forEach(d => {
          const dt = new Date(d);
          if (dt.getFullYear() === year && dt.getMonth() === i) done++;
        }));
        return { name: m, rate: totalPossible > 0 ? (done / totalPossible) * 100 : 0 };
      });
    }
    return visibleDates.map(d => ({
      name: d.day,
      percentage: habits.length > 0 ? (habits.filter(h => h.completedDates.includes(d.dateStr)).length / habits.length) * 100 : 0
    }));
  }, [habits, visibleDates, viewMode, year]);

  const globalCompletion = useMemo(() => {
    const dates = viewMode === 'yearly' ? 365 : visibleDates.length;
    const total = habits.length * dates;
    let done = 0;
    habits.forEach(h => h.completedDates.forEach(d => {
      const dt = new Date(d);
      if (viewMode === 'yearly') { if (dt.getFullYear() === year) done++; }
      else { if (visibleDates.some(vd => vd.dateStr === d)) done++; }
    }));
    const rate = total > 0 ? (done / total) * 100 : 0;
    return [{ name: 'Done', value: rate }, { name: 'Remaining', value: Math.max(0, 100 - rate) }];
  }, [habits, visibleDates, viewMode, year]);
  
  // Check for 100% completion based on view mode
  const isDailyComplete = viewMode === 'daily' || viewMode === 'weekly' ? (
    visibleDates.length > 0 && 
    habits.length > 0 && 
    visibleDates.every(date => 
      habits.every(habit => habit.completedDates.includes(date.dateStr))
    ) && 
    habits.length === habits.filter(habit => 
      visibleDates.some(date => habit.completedDates.includes(date.dateStr))
    ).length
  ) : false;
  const isWeeklyComplete = viewMode === 'weekly' && globalCompletion[0].value >= 100;
  const isMonthlyComplete = viewMode === 'monthly' && globalCompletion[0].value >= 100;
  const isYearlyComplete = viewMode === 'yearly' && globalCompletion[0].value >= 100;

  // Check for 100% completion and trigger celebration
  useEffect(() => {
    if (globalCompletion[0].value >= 100 && !showCelebration) {
      const today = new Date().toISOString().split('T')[0];
      const currentPeriod = viewMode === 'daily' ? `day_${today}` :
                        viewMode === 'weekly' ? `week_${year}_${month}_${Math.ceil(new Date(year, month, new Date().getDate()).getDate() / 7)}` :
                        viewMode === 'monthly' ? `month_${year}_${month}` :
                        `year_${year}`;
      
      if (isDailyComplete && !shownCelebrations[currentPeriod] && (viewMode === 'daily' || viewMode === 'weekly')) {
        setCelebrationMessage('Daily Master! 🌟\nTushar Singh: "Perfect day!"');
        setShowCelebration(true);
        setShownCelebrations(prev => ({ ...prev, [currentPeriod]: true }));
      } else if (isWeeklyComplete && !shownCelebrations[currentPeriod] && viewMode === 'weekly') {
        setCelebrationMessage('Weekly Goal Complete! 🎉\nTushar Singh: "Great week!"');
        setShowCelebration(true);
        setShownCelebrations(prev => ({ ...prev, [currentPeriod]: true }));
      } else if (isMonthlyComplete && !shownCelebrations[currentPeriod] && viewMode === 'monthly') {
        setCelebrationMessage('Monthly Master! 🌟\nTushar Singh: "Amazing month!"');
        setShowCelebration(true);
        setShownCelebrations(prev => ({ ...prev, [currentPeriod]: true }));
      } else if (isYearlyComplete && !shownCelebrations[currentPeriod] && viewMode === 'yearly') {
        setCelebrationMessage('Yearly Champion! 🏆\nTushar Singh: "Incredible year!"');
        setShowCelebration(true);
        setShownCelebrations(prev => ({ ...prev, [currentPeriod]: true }));
      }
    }
  }, [globalCompletion, isDailyComplete, isWeeklyComplete, isMonthlyComplete, isYearlyComplete, showCelebration, shownCelebrations, viewMode, year, month]);
  
  // Auto-hide celebration after 5 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showCelebration) {
      timer = setTimeout(() => {
        setShowCelebration(false);
      }, 5000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showCelebration]);

  // Derived colors for consistency
  const panelBg = theme.isDark ? '#0f172a' : '#ffffff';
  const tableBg = theme.isDark ? '#0f172a' : '#ffffff';
  const borderColor = theme.isDark ? '#1e293b' : '#f1f5f9';
  const gridColor = theme.isDark ? '#334155' : '#f1f5f9';
  const textColor = theme.isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-6">
      {/* Celebration Popup */}
      {showCelebration && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300"
          onClick={() => setShowCelebration(false)}>
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 text-center animate-bounce-in"
            onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-black text-white mb-2">Congratulations!</h3>
            <p className="text-white font-bold text-sm whitespace-pre-line">{celebrationMessage}</p>
            <button 
              onClick={() => setShowCelebration(false)}
              className="mt-6 px-6 py-2 bg-white text-orange-600 rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart Section - Added min-w-0 to prevent Recharts calculation errors */}
        <div className={`lg:col-span-8 p-6 rounded-[2rem] border transition-colors min-w-0 overflow-hidden ${theme.isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-center mb-6">
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">{viewMode} Trend</h4>
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.primary }}></div>
                <span className="text-[9px] font-black uppercase opacity-60">Success Rate</span>
             </div>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'yearly' ? (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} animationKey={animationKey}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: textColor}} dy={10} />
                  <YAxis hide domain={[0, 100]} />
                  <Bar dataKey="rate" fill={theme.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} animationKey={animationKey}>
                  <defs>
                    <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.primary} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={theme.primary} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: textColor}} dy={10} />
                  <YAxis hide domain={[0, 100]} />
                  <Area type="monotone" dataKey="percentage" stroke={theme.primary} fill="url(#colorPrimary)" strokeWidth={3} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Circular Mastery Chart - Added min-w-0 */}
        <div className={`lg:col-span-4 p-6 rounded-[2rem] border transition-colors flex flex-col items-center justify-center relative min-w-0 overflow-hidden ${theme.isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
           <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">Mastery</h4>
           <div className="h-[180px] w-full relative flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart animationKey={animationKey}>
                 <Pie data={globalCompletion} innerRadius="75%" outerRadius="95%" paddingAngle={5} startAngle={90} endAngle={450} dataKey="value" stroke="none" cornerRadius={6}>
                   <Cell fill={theme.primary} />
                   <Cell fill={theme.isDark ? '#1e293b' : '#f1f5f9'} />
                 </Pie>
               </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black ${globalCompletion[0].value >= 100 ? (theme.isDark ? 'text-yellow-400' : 'text-yellow-600') : (theme.isDark ? 'text-white' : 'text-slate-900')}`}>
                  {Math.round(globalCompletion[0].value)}%
                </span>
                <span className="text-[9px] font-black uppercase opacity-40">Consistency</span>
             </div>
           </div>
        </div>
      </div>

      {/* Habit Matrix - Uses panelBg for sticky columns */}
      {viewMode !== 'yearly' && (
        <div className={`rounded-[2rem] border overflow-hidden transition-colors ${theme.isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="overflow-x-auto no-scrollbar touch-pan-x">
            <table className="w-full border-collapse">
              <thead>
                <tr className={theme.isDark ? 'bg-slate-900/50' : 'bg-slate-50/50'}>
                  <th 
                    className="sticky left-0 z-20 p-4 text-left w-32 md:w-56 border-r transition-all"
                    style={{ backgroundColor: panelBg, borderColor: borderColor }}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Routine</span>
                  </th>
                  {activeWeeks.map(([wNum, days]) => (
                    <th key={wNum} className="p-0 border-r" style={{ borderColor: borderColor }}>
                      <div className="text-[7px] font-black uppercase text-center py-1 opacity-30 border-b" style={{ borderColor: borderColor }}>W{wNum}</div>
                      <div className="flex">
                        {days.map(d => (
                          <div key={d.dateStr} className={`w-12 py-3 text-center ${d.dateStr === todayStr ? 'opacity-100' : 'opacity-40'}`}>
                            <div className="text-[8px] font-bold">{d.weekday}</div>
                            <div className="text-[11px] font-black">{d.day}</div>
                          </div>
                        ))}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => (
                  <tr key={habit.id} className="border-t" style={{ borderColor: borderColor }}>
                    <td 
                      className="sticky left-0 z-20 p-4 border-r flex items-center gap-3 transition-all"
                      style={{ backgroundColor: panelBg, borderColor: borderColor }}
                    >
                      <div className="w-1.5 h-6 rounded-full flex-shrink-0" style={{ backgroundColor: habit.color }}></div>
                      <span className={`text-xs font-bold truncate max-w-[80px] md:max-w-none ${theme.isDark ? 'text-white' : 'text-slate-700'}`}>{habit.name}</span>
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(habit.id)}
                          className="ml-auto p-1 rounded-lg hover:opacity-70 transition-opacity"
                          style={{ color: theme.isDark ? '#94a3b8' : '#64748b' }}
                          aria-label={`Delete ${habit.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </td>
                    {activeWeeks.map(([wNum, days]) => (
                      <td key={wNum} className="p-0 border-r" style={{ borderColor: borderColor }}>
                        <div className="flex">
                          {days.map(d => {
                            const done = habit.completedDates.includes(d.dateStr);
                            return (
                              <div 
                                key={d.dateStr}
                                onClick={() => onToggle(habit.id, d.dateStr)}
                                className={`w-12 h-[52px] flex items-center justify-center cursor-pointer transition-transform ${done ? 'scale-110' : 'active:scale-90'}`}
                              >
                                <div 
                                  className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center duration-300 ${
                                    done ? 'text-white' : (theme.isDark ? 'border-slate-700' : 'border-slate-200')
                                  }`}
                                  style={done ? { backgroundColor: theme.primary, borderColor: theme.primary } : undefined}
                                >
                                  {done && <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
