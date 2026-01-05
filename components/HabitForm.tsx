
import React, { useState } from 'react';
import { HabitCategory, Habit, Theme } from '../types';
import { CATEGORIES, CATEGORY_COLORS } from '../constants';

interface HabitFormProps {
  onAdd: (habit: Omit<Habit, 'id' | 'completedDates' | 'createdAt'>) => void;
  onClose: () => void;
  theme: Theme;
}

export const HabitForm: React.FC<HabitFormProps> = ({ onAdd, onClose, theme }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Productivity');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Real-time validation
  const isValid = name.trim().length > 0 && name.trim().length <= 50;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid) {
      setError('Habit name must be 1-50 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    // Add a small delay for better UX
    setTimeout(() => {
      onAdd({
        name,
        category,
        color: CATEGORY_COLORS[category]
      });
      setIsSubmitting(false);
      setName(''); // Reset form after successful submission
      setError('');
    }, 300);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center z-[100] p-0 md:p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div 
        className={`rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl w-full max-w-md p-6 md:p-10 animate-in slide-in-from-bottom md:zoom-in-95 duration-300 transition-colors border ${
          theme.isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-transparent'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 md:mb-8">
           <h3 className={`text-xl md:text-2xl font-black tracking-tight ${theme.isDark ? 'text-white' : 'text-slate-800'}`}>New Habit</h3>
           <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
          <div>
            <label className="block text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3">What's the habit?</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                // Clear error when user starts typing
                if (error) setError('');
              }}
              className={`w-full px-5 md:px-6 py-3 md:py-4 rounded-2xl border focus:ring-4 outline-none transition-all font-bold text-sm md:text-base placeholder:text-slate-500 ${
                error ? 'border-red-500' : (theme.isDark 
                  ? 'bg-slate-800 border-slate-700 text-white focus:bg-slate-700' 
                  : 'bg-slate-50 border-slate-100 text-slate-700 focus:bg-white focus:ring-slate-100')
              }`}
              placeholder="e.g. 5am Wake Up"
              style={{ '--tw-ring-color': theme.accent } as any}
              maxLength={50}
            />
            {/* Character counter */}
            <div className="flex justify-between mt-1">
              <span className={`text-[9px] ${name.length > 50 ? 'text-red-500' : 'text-slate-500'}`}>
                {name.length}/50
              </span>
              {error && (
                <span className="text-[9px] text-red-500">{error}</span>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3">Select Category</label>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 md:px-4 md:py-3 rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all border-2 ${
                    category === cat 
                      ? 'border-transparent shadow-lg text-white' 
                      : (theme.isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200')
                  }`}
                  style={category === cat ? { backgroundColor: theme.primary, boxShadow: theme.isDark ? 'none' : `0 10px 15px -3px ${theme.shadow.replace('shadow-', '')}` } : undefined}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 md:gap-4 pt-2 md:pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 px-4 py-3 md:py-4 rounded-2xl border-2 transition-all text-[9px] md:text-[11px] font-black uppercase tracking-widest ${
                theme.isDark ? 'border-slate-800 text-slate-500 hover:bg-slate-800' : 'border-slate-100 text-slate-400 hover:bg-slate-50'
              }`}
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className={`flex-[2] px-4 py-3 md:py-4 rounded-2xl text-white font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 text-[9px] md:text-[11px] ${
                isSubmitting || !isValid 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:brightness-110'
              }`}
              style={{ 
                backgroundColor: isSubmitting || !isValid ? theme.primary + '80' : theme.primary,
                boxShadow: theme.isDark ? '0 10px 25px -5px rgba(0,0,0,0.5)' : `0 10px 15px -3px ${theme.shadow.replace('shadow-', '')}` 
              }}
            >
              {isSubmitting ? 'Adding...' : 'Start Tracking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
