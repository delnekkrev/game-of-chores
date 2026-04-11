import React, { useEffect, useState } from 'react';
import { supabase } from '../App';
import { PROFILE_NAMES, getPlayerPhoto } from '../profileConfig';

const EMOJIS = ['🔥', '💪', '👑', '🎉', '😂', '❤️', '🤩', '💯', '🙌', '😤'];

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export default function Reactions({ player }) {
  const [reactions, setReactions] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState('🔥');
  const [target, setTarget] = useState('Everyone');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [tableReady, setTableReady] = useState(true);

  const targets = ['Everyone', ...PROFILE_NAMES.filter(n => n !== player.name)];

  useEffect(() => {
    fetchReactions();
    const channel = supabase
      .channel('reactions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reactions' }, () => fetchReactions())
      .subscribe();
    return () => channel.unsubscribe();
  }, []);

  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from('reactions').select('*')
      .order('created_at', { ascending: false }).limit(20);
    if (error) { setTableReady(false); return; }
    setTableReady(true);
    setReactions(data || []);
  };

  const sendReaction = async () => {
    if (sending) return;
    setSending(true);
    const { error } = await supabase.from('reactions').insert([{
      sender_name: player.name,
      target_name: target,
      emoji: selectedEmoji,
      message: message.trim(),
    }]);
    if (error) setTableReady(false);
    setMessage('');
    setSending(false);
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-700/50">
      <h2 className="font-bold text-white mb-4">⚡ Team Hype</h2>

      {!tableReady ? (
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm mb-1">Team Hype needs a one-time setup.</p>
          <p className="text-gray-600 text-xs">Run <span className="text-purple-400 font-mono">REACTIONS_SETUP.sql</span> in your Supabase SQL editor.</p>
        </div>
      ) : (
        <>
          {/* Emoji picker */}
          <div className="flex flex-wrap gap-2 mb-3">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setSelectedEmoji(e)}
                className={`text-xl w-9 h-9 rounded-lg transition-all ${
                  selectedEmoji === e
                    ? 'bg-purple-700 ring-2 ring-purple-400 scale-110'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                {e}
              </button>
            ))}
          </div>

          {/* Target + message + send */}
          <div className="flex gap-2 mb-3">
            <select
              value={target}
              onChange={e => setTarget(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-700 text-sm text-gray-200 border border-gray-600 focus:outline-none focus:border-purple-500 flex-shrink-0"
            >
              {targets.map(t => (
                <option key={t} value={t}>{t === 'Everyone' ? '👥 Everyone' : `→ ${t}`}</option>
              ))}
            </select>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, 40))}
              onKeyDown={e => e.key === 'Enter' && sendReaction()}
              placeholder="Add a message... (optional)"
              className="flex-1 px-3 py-2 rounded-lg bg-gray-700 text-gray-200 text-sm border border-gray-600 focus:outline-none focus:border-purple-500 placeholder-gray-500 min-w-0"
            />
            <button
              onClick={sendReaction}
              disabled={sending}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 flex-shrink-0"
            >
              {selectedEmoji}
            </button>
          </div>

          {/* Feed */}
          {reactions.length > 0 ? (
            <div className="space-y-2 max-h-52 overflow-y-auto">
              {reactions.map(r => {
                const photo = getPlayerPhoto(r.sender_name, null, r.sender_name === player.name ? player.photoData : null);
                return (
                  <div key={r.id} className="flex items-center gap-2 bg-gray-700/50 rounded-xl px-3 py-2 border border-gray-700/30">
                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-600">
                      {photo
                        ? <img src={photo} alt={r.sender_name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1 flex-wrap">
                        <span className="text-xs font-bold text-gray-200">{r.sender_name}</span>
                        <span className="text-xs text-gray-600">→</span>
                        <span className="text-xs text-gray-400">{r.target_name}</span>
                        <span className="text-base leading-none">{r.emoji}</span>
                      </div>
                      {r.message && <p className="text-xs text-gray-500 truncate">"{r.message}"</p>}
                    </div>
                    <span className="text-xs text-gray-600 flex-shrink-0">{timeAgo(r.created_at)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-600 py-3">No hype yet — be the first! 🚀</p>
          )}
        </>
      )}
    </div>
  );
}
