import React, { useEffect, useState } from 'react';
import { supabase } from '../App';
import { getPlayerPhoto } from '../profileConfig';

export default function Challenges({ player, weekId }) {
  const [challenges, setChallenges] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPoints, setNewPoints] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [tableReady, setTableReady] = useState(true);

  useEffect(() => {
    if (!weekId) return;
    fetchChallenges();
    const channel = supabase
      .channel('challenges-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'challenges' }, fetchChallenges)
      .subscribe();
    return () => channel.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekId]);

  const fetchChallenges = async () => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('week_id', weekId)
      .order('created_at', { ascending: false });
    if (error) { setTableReady(false); return; }
    setTableReady(true);
    setChallenges(data || []);
  };

  const createChallenge = async () => {
    const title = newTitle.trim();
    const pts = parseInt(newPoints);
    if (!title || !pts || pts < 1 || pts > 9999) return;
    setSubmitting(true);
    await supabase.from('challenges').insert([{
      creator_name: player.name,
      title,
      points: pts,
      week_id: weekId,
    }]);
    setNewTitle('');
    setNewPoints('');
    setShowForm(false);
    setSubmitting(false);
  };

  const completeChallenge = async (challenge) => {
    if (completing) return;
    setCompleting(challenge.id);
    // Atomic update — only succeeds if not yet claimed
    const { data: updated } = await supabase
      .from('challenges')
      .update({ completed_by: player.name, completed_at: new Date().toISOString() })
      .eq('id', challenge.id)
      .is('completed_by', null)
      .select();

    if (updated && updated.length > 0) {
      // Award points
      let { data: dbPlayers } = await supabase.from('players').select('id').eq('name', player.name);
      if (!dbPlayers || dbPlayers.length === 0) {
        const { data: newP } = await supabase.from('players').insert([{ name: player.name }]).select();
        dbPlayers = newP;
      }
      const playerId = dbPlayers[0].id;
      const { data: existingScore } = await supabase
        .from('weekly_scores').select('id, total_points')
        .eq('player_id', playerId).eq('week_id', weekId).single();
      if (existingScore) {
        await supabase.from('weekly_scores')
          .update({ total_points: existingScore.total_points + challenge.points })
          .eq('id', existingScore.id);
      } else {
        await supabase.from('weekly_scores')
          .insert([{ player_id: playerId, week_id: weekId, total_points: challenge.points }]);
      }
    }
    setCompleting(null);
  };

  const deleteChallenge = async (id) => {
    await supabase.from('challenges').delete().eq('id', id);
  };

  if (!tableReady) {
    return (
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700/50 text-center">
        <p className="text-2xl mb-2">⚙️</p>
        <p className="text-gray-300 text-sm font-semibold mb-1">Challenges needs a one-time setup.</p>
        <p className="text-gray-500 text-xs">Run <span className="text-purple-400 font-mono">CHALLENGES_SETUP.sql</span> in your Supabase SQL editor.</p>
      </div>
    );
  }

  const open = challenges.filter(c => !c.completed_by);
  const claimed = challenges.filter(c => c.completed_by);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">⚔️ Challenges</h2>
          <p className="text-xs text-gray-500 mt-0.5">Post a one-time task — first to finish wins the points.</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all shadow-lg"
        >
          + New
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-gray-800 rounded-2xl p-4 border border-yellow-500/30 space-y-3">
          <p className="text-sm font-bold text-yellow-400">🎯 New Challenge</p>
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value.slice(0, 80))}
            onKeyDown={e => e.key === 'Enter' && createChallenge()}
            placeholder='e.g. "Help me find my keys"'
            className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:border-yellow-500 text-gray-100 text-sm placeholder-gray-500"
            autoFocus
          />
          <div className="flex gap-2">
            <input
              type="number"
              value={newPoints}
              onChange={e => setNewPoints(e.target.value)}
              placeholder="Points"
              min="1" max="9999"
              className="w-28 px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-xl focus:outline-none focus:border-yellow-500 text-gray-100 text-sm placeholder-gray-500"
            />
            <button
              onClick={() => { setShowForm(false); setNewTitle(''); setNewPoints(''); }}
              className="flex-1 py-2 bg-gray-700 text-gray-400 rounded-xl text-sm hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createChallenge}
              disabled={submitting || !newTitle.trim() || !newPoints || parseInt(newPoints) < 1}
              className="flex-1 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-xl text-sm hover:opacity-90 disabled:opacity-40 transition-all"
            >
              {submitting ? '...' : 'Post 🚀'}
            </button>
          </div>
        </div>
      )}

      {/* Open challenges */}
      {open.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">Open — {open.length}</p>
          {open.map(c => {
            const isCreator = c.creator_name === player.name;
            const photo = getPlayerPhoto(c.creator_name, null, null);
            const isCompleting = completing === c.id;
            return (
              <div key={c.id} className="bg-gray-800 rounded-xl border border-yellow-500/20 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-600 mt-0.5">
                    {photo
                      ? <img src={photo} alt={c.creator_name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-sm">👤</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white break-words leading-snug">{c.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">by {c.creator_name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-1">
                    <span className="text-base font-black text-yellow-400">+{c.points}</span>
                    {!isCreator ? (
                      <button
                        onClick={() => completeChallenge(c)}
                        disabled={!!completing}
                        className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isCompleting ? '...' : 'Done ✓'}
                      </button>
                    ) : (
                      <button
                        onClick={() => deleteChallenge(c.id)}
                        className="text-red-500 hover:text-red-400 text-xs transition-colors px-1"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !showForm && (
          <div className="bg-gray-800 rounded-xl border border-gray-700/50 p-8 text-center">
            <p className="text-3xl mb-2">🎯</p>
            <p className="text-gray-400 text-sm">No open challenges this week.</p>
            <p className="text-gray-600 text-xs mt-1">Be the first to post one!</p>
          </div>
        )
      )}

      {/* Claimed */}
      {claimed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-1">Claimed</p>
          {claimed.map(c => (
            <div key={c.id} className="bg-gray-800/50 rounded-xl border border-gray-700/30 px-4 py-3 opacity-60">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 line-through break-words">{c.title}</p>
                  <p className="text-xs text-green-500 mt-0.5">✓ {c.completed_by} claimed it</p>
                </div>
                <span className="text-sm font-bold text-gray-600 flex-shrink-0">+{c.points}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
