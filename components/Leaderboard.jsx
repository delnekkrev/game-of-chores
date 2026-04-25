import React, { useEffect, useState, useCallback } from 'react';
import { supabase, DAILY_TASKS, MAX_POINTS, KID_NAME } from '../App';

function getTodayId() {
  return new Date().toISOString().split('T')[0];
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse(); // oldest → newest
}

function formatDayLabel(dateStr, todayId) {
  if (dateStr === todayId) return 'Today';
  const diffDays = Math.round(
    (new Date(todayId) - new Date(dateStr + 'T12:00:00')) / 86_400_000
  );
  if (diffDays === 1) return 'Yesterday';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

export default function ParentView({ onBack }) {
  const [dayData, setDayData] = useState({});
  const [loading, setLoading] = useState(true);

  const todayId = getTodayId();
  const last7   = getLast7Days();

  const loadData = useCallback(async () => {
    const { data, error } = await supabase
      .from('daily_completions')
      .select('task_id, date_id, completed_at')
      .in('date_id', last7)
      .order('completed_at', { ascending: false });

    if (!error && data) {
      const grouped = Object.fromEntries(last7.map(d => [d, []]));
      data.forEach(c => { if (grouped[c.date_id]) grouped[c.date_id].push(c); });
      setDayData(grouped);
    }
    setLoading(false);
  }, []); // eslint-disable-line

  useEffect(() => { loadData(); }, [loadData]);

  // ── Helpers ─────────────────────────────────────────────────
  const getPoints = (dateId) =>
    (dayData[dateId] || []).reduce((sum, c) => {
      const task = DAILY_TASKS.find(t => t.id === c.task_id);
      return sum + (task?.points || 0);
    }, 0);

  const todayCompletions  = dayData[todayId] || [];
  const todayPoints       = getPoints(todayId);
  const todayPct          = Math.min(100, Math.round((todayPoints / MAX_POINTS) * 100));
  const completedTodayIds = new Set(todayCompletions.map(c => c.task_id));
  const missingToday      = DAILY_TASKS.filter(t => !completedTodayIds.has(t.id));

  // Streak: consecutive days (oldest to yesterday) with activity, + today if active
  const streak = (() => {
    let s = 0;
    for (let i = last7.length - 2; i >= 0; i--) {
      if ((dayData[last7[i]] || []).length > 0) s++;
      else break;
    }
    if (todayCompletions.length > 0) s++;
    return s;
  })();

  // ── Loading ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white text-lg animate-pulse">Loading progress... 📊</p>
      </div>
    );
  }

  // ── Main view ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-white">

      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-slate-400 hover:text-white transition-colors text-sm px-2 py-1"
          >
            ← Back
          </button>
          <div>
            <h1 className="font-black text-lg">{KID_NAME}'s Progress 📊</h1>
            <p className="text-slate-400 text-xs">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4 pb-10">

        {/* ── Today's summary ── */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
          <h2 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-4">
            Today's Summary
          </h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-700 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-yellow-400">{todayPoints}</p>
              <p className="text-xs text-slate-400 mt-1">Points</p>
            </div>
            <div className="bg-slate-700 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-green-400">{todayCompletions.length}</p>
              <p className="text-xs text-slate-400 mt-1">Done</p>
            </div>
            <div className="bg-slate-700 rounded-xl p-3 text-center">
              <p className="text-2xl font-black text-orange-400">
                {streak > 0 ? `${streak}🔥` : '—'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Streak</p>
            </div>
          </div>
          <div className="bg-slate-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-400 transition-all duration-500"
              style={{ width: `${todayPct}%` }}
            />
          </div>
          <p className="text-slate-500 text-xs text-right mt-1">
            {todayPct}% of daily goal ({MAX_POINTS} pts possible)
          </p>
        </div>

        {/* ── Today's checkoffs ── */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700">
            <h2 className="text-slate-400 text-xs uppercase tracking-wider font-bold">
              Today's Checkoffs{todayCompletions.length > 0 && ` (${todayCompletions.length})`}
            </h2>
          </div>
          <div className="p-3">
            {todayCompletions.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <p className="text-3xl mb-2">💤</p>
                <p>Nothing checked off yet today</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {todayCompletions.map(c => {
                  const task = DAILY_TASKS.find(t => t.id === c.task_id);
                  if (!task) return null;
                  return (
                    <div
                      key={c.task_id}
                      className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-green-500 text-xs">✓</span>
                        <span className="text-base">{task.emoji}</span>
                        <span className="text-sm">{task.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-yellow-400 font-bold">+{task.points}</span>
                        <span className="text-slate-500">{formatTime(c.completed_at)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Still to do / perfect day ── */}
        {missingToday.length === 0 && todayCompletions.length > 0 ? (
          <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-6 text-center">
            <p className="text-4xl mb-2">🏆</p>
            <p className="text-green-400 font-black text-lg">Perfect Day!</p>
            <p className="text-slate-400 text-sm mt-1">
              All {DAILY_TASKS.length} tasks completed!
            </p>
          </div>
        ) : missingToday.length > 0 ? (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-700">
              <h2 className="text-slate-400 text-xs uppercase tracking-wider font-bold">
                Still To Do ({missingToday.length})
              </h2>
            </div>
            <div className="p-3 space-y-0.5">
              {missingToday.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between py-2 px-2 text-slate-400"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 text-xs">○</span>
                    <span className="text-base">{task.emoji}</span>
                    <span className="text-sm">{task.name}</span>
                  </div>
                  <span className="text-slate-500 text-xs">+{task.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── 7-day history ── */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700">
            <h2 className="text-slate-400 text-xs uppercase tracking-wider font-bold">
              Last 7 Days
            </h2>
          </div>
          <div className="p-3 space-y-2">
            {last7.map(dateStr => {
              const pts     = getPoints(dateStr);
              const pct     = Math.round((pts / MAX_POINTS) * 100);
              const count   = (dayData[dateStr] || []).length;
              const isToday = dateStr === todayId;

              return (
                <div
                  key={dateStr}
                  className={`p-3 rounded-xl ${
                    isToday
                      ? 'bg-blue-900/20 border border-blue-500/20'
                      : 'bg-slate-700/30'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-semibold ${isToday ? 'text-blue-300' : 'text-white'}`}>
                      {formatDayLabel(dateStr, todayId)}
                    </span>
                    <span className={`text-sm font-bold ${pts > 0 ? 'text-yellow-400' : 'text-slate-600'}`}>
                      {pts > 0 ? `${pts} pts` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-600 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          pct >= 80 ? 'bg-green-400' :
                          pct >= 50 ? 'bg-blue-400'  :
                          pct >  0  ? 'bg-yellow-400' :
                          'bg-slate-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400 w-20 text-right flex-shrink-0">
                      {count > 0 ? `${count}/${DAILY_TASKS.length} tasks` : 'nothing done'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
