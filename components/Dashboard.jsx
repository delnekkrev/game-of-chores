import React, { useEffect, useState, useCallback } from 'react';
import { supabase, KID_NAME, DAILY_TASKS, MAX_POINTS, PARENT_PIN } from '../App';
import ParentView from './Leaderboard';
import TaskSection from './TaskList';

function getTodayId() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return '☀️ Good morning';
  if (h < 17) return '⚡ Good afternoon';
  return '🌙 Good evening';
}

function getProgressEmoji(pct) {
  if (pct >= 100) return '🏆';
  if (pct >= 75)  return '🔥';
  if (pct >= 50)  return '⚡';
  if (pct >= 25)  return '💪';
  return '🎮';
}

function getProgressGradient(pct) {
  if (pct >= 100) return 'linear-gradient(to right, #f59e0b, #fbbf24, #fcd34d)';
  if (pct >= 75)  return 'linear-gradient(to right, #22c55e, #4ade80)';
  if (pct >= 50)  return 'linear-gradient(to right, #3b82f6, #60a5fa)';
  return 'linear-gradient(to right, #6366f1, #818cf8)';
}

export default function Dashboard() {
  const [completed,     setCompleted]     = useState(new Set());
  const [loading,       setLoading]       = useState(true);
  const [dbError,       setDbError]       = useState(false);
  const [mode,          setMode]          = useState('kid');   // 'kid' | 'parent'
  const [pinInput,      setPinInput]      = useState('');
  const [pinError,      setPinError]      = useState('');
  const [showPinModal,  setShowPinModal]  = useState(false);
  const [streak,        setStreak]        = useState(0);
  const [justChecked,   setJustChecked]   = useState(null);

  const todayId = getTodayId();

  // ── Fetch today's completions ──────────────────────────────
  const fetchToday = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('daily_completions')
        .select('task_id')
        .eq('date_id', todayId);

      if (error) { setDbError(true); }
      else        { setCompleted(new Set((data || []).map(c => c.task_id))); }
    } catch {
      setDbError(true);
    }
    setLoading(false);
  }, [todayId]);

  // ── Fetch streak (consecutive prior days with any activity) ─
  const fetchStreak = useCallback(async () => {
    const past = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (i + 1));
      return d.toISOString().split('T')[0];
    });

    const { data } = await supabase
      .from('daily_completions')
      .select('date_id')
      .in('date_id', past);

    if (data) {
      const active = new Set(data.map(c => c.date_id));
      let s = 0;
      for (const dateStr of past) {
        if (active.has(dateStr)) s++;
        else break;
      }
      setStreak(s);
    }
  }, []);

  useEffect(() => {
    fetchToday();
    fetchStreak();
  }, [fetchToday, fetchStreak]);

  // ── Toggle a task on/off ───────────────────────────────────
  const handleToggle = async (taskId) => {
    const wasCompleted = completed.has(taskId);

    // Optimistic UI
    setCompleted(prev => {
      const next = new Set(prev);
      if (wasCompleted) { next.delete(taskId); }
      else              { next.add(taskId); setJustChecked(taskId); setTimeout(() => setJustChecked(null), 400); }
      return next;
    });

    if (!wasCompleted) {
      const { error } = await supabase
        .from('daily_completions')
        .insert([{ task_id: taskId, date_id: todayId }]);

      if (error) {
        // Revert
        setCompleted(prev => { const n = new Set(prev); n.delete(taskId); return n; });
      }
    } else {
      const { error } = await supabase
        .from('daily_completions')
        .delete()
        .eq('task_id', taskId)
        .eq('date_id', todayId);

      if (error) {
        // Revert
        setCompleted(prev => new Set([...prev, taskId]));
      }
    }
  };

  // ── Parent PIN ─────────────────────────────────────────────
  const closePinModal = () => { setShowPinModal(false); setPinInput(''); setPinError(''); };

  const handleParentUnlock = () => {
    if (pinInput === PARENT_PIN) {
      setMode('parent');
      closePinModal();
    } else {
      setPinError('Wrong PIN — try again!');
      setPinInput('');
    }
  };

  // ── Derived values ─────────────────────────────────────────
  const totalPoints  = DAILY_TASKS.filter(t => completed.has(t.id)).reduce((s, t) => s + t.points, 0);
  const progressPct  = Math.min(100, Math.round((totalPoints / MAX_POINTS) * 100));
  const morningTasks   = DAILY_TASKS.filter(t => t.time === 'morning');
  const afternoonTasks = DAILY_TASKS.filter(t => t.time === 'afternoon');
  const eveningTasks   = DAILY_TASKS.filter(t => t.time === 'evening');

  // ── Render: parent mode ────────────────────────────────────
  if (mode === 'parent') {
    return <ParentView onBack={() => setMode('kid')} />;
  }

  // ── Render: loading ────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🎮</div>
          <p className="text-white text-lg font-bold">Loading your missions...</p>
        </div>
      </div>
    );
  }

  // ── Render: DB not set up ──────────────────────────────────
  if (dbError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
        <div className="bg-slate-800 rounded-2xl p-6 max-w-sm text-center border border-red-500/30 text-white">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="font-bold text-lg mb-2">Database Not Ready</h2>
          <p className="text-slate-400 text-sm mb-3">
            Create the <code className="text-yellow-400">daily_completions</code> table in Supabase
            by running the SQL in <strong>SETUP_DB.sql</strong>.
          </p>
          <p className="text-slate-500 text-xs">Also check your .env file has the right Supabase keys.</p>
        </div>
      </div>
    );
  }

  // ── Render: main kid view ──────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* ── Header ── */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-xs">{getGreeting()},</p>
            <h1 className="text-xl font-black">{KID_NAME} 👾</h1>
          </div>
          <div className="text-right">
            {streak > 0 && (
              <p className="text-orange-400 text-xs font-bold mb-1">🔥 {streak} day streak</p>
            )}
            <button
              onClick={() => setShowPinModal(true)}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              🔒 Parent
            </button>
          </div>
        </div>
      </div>

      {/* ── XP / Points card ── */}
      <div className="max-w-lg mx-auto px-4 pt-5 pb-3">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">Today's XP</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-yellow-400">{totalPoints}</span>
                <span className="text-slate-500 text-sm">/ {MAX_POINTS} pts</span>
              </div>
            </div>
            <span className="text-4xl">{getProgressEmoji(progressPct)}</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-700 rounded-full h-5 overflow-hidden">
            <div
              className="h-5 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
              style={{
                width: `${progressPct}%`,
                background: getProgressGradient(progressPct),
                minWidth: progressPct > 0 ? '2rem' : '0',
              }}
            >
              {progressPct >= 15 && (
                <span className="absolute right-2 top-0 h-full flex items-center text-xs font-bold text-white/80">
                  {progressPct}%
                </span>
              )}
            </div>
          </div>

          {progressPct >= 100 && (
            <p className="text-center text-yellow-400 font-bold text-sm mt-3 animate-pulse">
              🏆 PERFECT DAY — ALL TASKS DONE! 🏆
            </p>
          )}
        </div>
      </div>

      {/* ── Task Sections ── */}
      <div className="max-w-lg mx-auto px-4 pb-10 space-y-4">
        <TaskSection
          title="☀️ Morning Routine"
          tasks={morningTasks}
          completed={completed}
          onToggle={handleToggle}
          accentColor="yellow"
          justChecked={justChecked}
        />
        <TaskSection
          title="📚 Afternoon"
          tasks={afternoonTasks}
          completed={completed}
          onToggle={handleToggle}
          accentColor="blue"
          justChecked={justChecked}
        />
        <TaskSection
          title="🌙 Evening Routine"
          tasks={eveningTasks}
          completed={completed}
          onToggle={handleToggle}
          accentColor="purple"
          justChecked={justChecked}
        />
      </div>

      {/* Date footer */}
      <div className="text-center pb-8">
        <p className="text-slate-700 text-xs">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
          })}
        </p>
      </div>

      {/* ── Parent PIN Modal ── */}
      {showPinModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closePinModal()}
        >
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-xs border border-slate-600 shadow-2xl">
            <div className="text-center mb-5">
              <div className="text-4xl mb-2">🔒</div>
              <h3 className="text-lg font-bold">Parent Access</h3>
              <p className="text-slate-400 text-sm mt-1">
                Enter your PIN to see {KID_NAME}'s progress
              </p>
            </div>
            <input
              type="password"
              inputMode="numeric"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setPinError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleParentUnlock()}
              placeholder="••••"
              maxLength={6}
              className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-blue-500 mb-3 text-white"
              autoFocus
            />
            {pinError && (
              <p className="text-red-400 text-sm text-center mb-3">{pinError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={closePinModal}
                className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleParentUnlock}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors font-bold"
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
