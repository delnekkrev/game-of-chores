import React, { useState } from 'react';

export default function SignIn({ onSignIn }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (name.length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    onSignIn(name);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏠🎮</div>
          <h1 className="text-3xl font-bold text-gray-800">Chore Reward Game</h1>
          <p className="text-gray-600 mt-2">Earn points, win rewards!</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Player Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-lg"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
          >
            🚀 Join Game
          </button>
        </form>

        <div className="mt-8 p-4 bg-purple-100 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>💡 Tip:</strong> Each device should have a different player name. Open this app on your fiancé's and son's phones and sign in as them!
          </p>
        </div>
      </div>
    </div>
  );
}
