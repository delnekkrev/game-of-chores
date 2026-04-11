import React, { useEffect, useState } from 'react';
import { supabase } from '../App';
import { PROFILE_NAMES, PROFILE_CONFIG, getPlayerPhoto } from '../profileConfig';

const MEDALS = ['🥇', '🥈', '🥉'];
const MAX_BAR_HEIGHT = 130;

export default function Leaderboard({ scores, player }) {
  const [dbPlayers, setDbPlayers] = useState([]);

  useEffect(() => {
    fetchPlayers();
  }, [scores]);

  const fetchPlayers = async () => {
    const { data, error } = await supabase.from('players').select('*');
    if (!error && data) setDbPlayers(data);
  };

  const entries = PROFILE_NAMES.map(name => {
    const dbPlayer = dbPlayers.find(p => p.name === name);
    const points = dbPlayer ? (scores[dbPlayer.id] || 0) : 0;
    return { name, points, config: PROFILE_CONFIG[name] };
  }).sort((a, b) => b.points - a.points);

  const maxPoints = Math.max(...entries.map(e => e.points), 1);
  const topPoints = entries[0].points;
  const currentEntry = entries.find(e => e.name === player.name);
  const isLeading = currentEntry && currentEntry.points === topPoints && topPoints > 0;
  const leaderName = entries[0].name;
  const gap = topPoints - (currentEntry?.points || 0);

  return (
    <div className="bg-gray-800 rounded-2xl p-5 shadow-lg border border-gray-700/50">
      <h2 className="text-xl font-bold text-white mb-1 text-center">🏆 Leaderboard</h2>
      <p className="text-xs text-center text-gray-500 mb-6">Week standings</p>

      <div className="flex items-end justify-center gap-4 px-2">
        {entries.map((entry, idx) => {
          const isCurrentPlayer = entry.name === player.name;
          const barHeight = entry.points > 0
            ? Math.max((entry.points / maxPoints) * MAX_BAR_HEIGHT, 20)
            : 12;
          const photo = getPlayerPhoto(entry.name, player.name === entry.name ? player.photo : null);

          return (
            <div key={entry.name} className="flex flex-col items-center gap-1 flex-1">
              <div className="text-2xl">{MEDALS[idx]}</div>
              <div className={`text-sm font-bold ${isCurrentPlayer ? 'text-purple-400' : 'text-gray-300'}`}>
                {entry.points > 0 ? entry.points : '—'}
              </div>

              <div className="w-full flex items-end" style={{ height: `${MAX_BAR_HEIGHT}px` }}>
                <div
                  className={`w-full rounded-t-xl bg-gradient-to-t ${entry.config.barColor} transition-all duration-700 relative ${
                    isCurrentPlayer ? `shadow-lg ${entry.config.glowColor} ring-2 ring-white/20` : 'opacity-80'
                  }`}
                  style={{ height: `${barHeight}px` }}
                >
                  {isCurrentPlayer && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-gray-800" />
                  )}
                </div>
              </div>

              <div className={`flex flex-col items-center gap-1 pt-1 pb-1 ${isCurrentPlayer ? 'scale-110' : ''} transition-transform`}>
                <div className={`w-12 h-12 rounded-xl overflow-hidden shadow-md ${
                  isCurrentPlayer ? `ring-2 ring-purple-400 shadow-lg` : 'opacity-80'
                }`}>
                  {photo
                    ? <img src={photo} alt={entry.name} className="w-full h-full object-cover" />
                    : <div className={`w-full h-full bg-gradient-to-br ${entry.config.barColor} flex items-center justify-center text-2xl`}>👤</div>
                  }
                </div>
                <p className={`text-xs font-bold ${isCurrentPlayer ? 'text-purple-400' : 'text-gray-400'}`}>{entry.name}</p>
                <p className="text-xs text-gray-600">pts</p>
              </div>
            </div>
          );
        })}
      </div>

      {topPoints > 0 && (
        <div className={`mt-5 p-3 rounded-xl text-sm text-center font-medium ${
          isLeading
            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
        }`}>
          {isLeading
            ? `🔥 You're crushing it, ${player.name}! Keep the streak alive!`
            : `💨 ${leaderName} is ahead by ${gap} pts — time to grind! 💪`}
        </div>
      )}
    </div>
  );
}
