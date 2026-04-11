import React, { useEffect, useState } from 'react';
import { supabase } from '../App';

export default function Leaderboard({ scores, player }) {
  const [allPlayers, setAllPlayers] = useState([]);
  const [topPlayers, setTopPlayers] = useState([]);

  useEffect(() => {
    fetchAllPlayers();
  }, [scores]);

  const fetchAllPlayers = async () => {
    const { data, error } = await supabase.from('players').select('*').order('created_at', { ascending: true });
    if (!error && data) {
      setAllPlayers(data);
      
      // Create leaderboard with scores
      const leaderboard = data.map(p => ({
        ...p,
        points: scores[p.id] || 0
      })).sort((a, b) => b.points - a.points);
      
      setTopPlayers(leaderboard);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg sticky top-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🏆 Leaderboard</h2>
      
      <div className="space-y-3">
        {topPlayers.map((p, idx) => {
          const isCurrentPlayer = p.id === player.id;
          const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
          
          return (
            <div
              key={p.id}
              className={`p-4 rounded-lg transition-all ${
                isCurrentPlayer
                  ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{medal}</span>
                  <div>
                    <p className={`font-bold ${isCurrentPlayer ? 'text-lg' : ''}`}>{p.name}</p>
                    <p className={`text-sm ${isCurrentPlayer ? 'text-white/80' : 'text-gray-600'}`}>
                      {idx + 1}{idx === 0 ? '🎯' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{p.points}</p>
                  <p className={`text-xs ${isCurrentPlayer ? 'text-white/70' : 'text-gray-500'}`}>pts</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-2 h-2 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{
                    width: `${Math.min((p.points / Math.max(...topPlayers.map(pl => pl.points), 100)) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {topPlayers.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          <p>👀 Waiting for players...</p>
          <p className="text-sm mt-2">Complete tasks to see the leaderboard!</p>
        </div>
      )}

      {/* Falling behind indicator */}
      {topPlayers.length > 1 && topPlayers[0].points > 0 && (
        <div className="mt-6 p-4 bg-orange-100 border-l-4 border-orange-500 rounded">
          {topPlayers[0].id !== player.id && (
            <p className="text-orange-700 text-sm">
              <strong>⚠️ Keep up!</strong> {topPlayers[0].name} is leading by {topPlayers[0].points - (scores[player.id] || 0)} points! 💪
            </p>
          )}
          {topPlayers[0].id === player.id && (
            <p className="text-green-700 text-sm">
              <strong>🎉 You're in the lead!</strong> Keep completing tasks to stay ahead! 🚀
            </p>
          )}
        </div>
      )}
    </div>
  );
}
