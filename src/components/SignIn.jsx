import React, { useState } from 'react';
import { PROFILE_NAMES, PROFILE_CONFIG, ALL_PHOTOS } from '../profileConfig';

const resizeImage = (file) => new Promise((resolve) => {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    const MAX = 300;
    let { width, height } = img;
    if (width > MAX || height > MAX) {
      const ratio = Math.min(MAX / width, MAX / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    canvas.getContext('2d').drawImage(img, 0, 0, width, height);
    URL.revokeObjectURL(url);
    resolve(canvas.toDataURL('image/jpeg', 0.8));
  };
  img.src = url;
});

export default function SignIn({ onSignIn }) {
  const [addingNew, setAddingNew] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPhoto, setCustomPhoto] = useState(ALL_PHOTOS[0].filename);
  const [customPhotoData, setCustomPhotoData] = useState(null);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await resizeImage(file);
    setCustomPhotoData(data);
    setCustomPhoto(null);
  };

  const handleAddNew = () => {
    if (!customName.trim() || customName.trim().length < 2) {
      setError('At least 2 characters');
      return;
    }
    onSignIn(customName.trim(), customPhotoData ? null : customPhoto, customPhotoData);
  };

  const reset = () => { setAddingNew(false); setCustomName(''); setCustomPhotoData(null); setCustomPhoto(ALL_PHOTOS[0].filename); setError(''); };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 px-4">
      <div className="text-center mb-12">
        <div className="text-5xl mb-4">🎖️</div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Chore of Duty</h1>
        <p className="text-gray-500 mt-2">Do the dishes. Earn the throne.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-8 mb-12">
        {PROFILE_NAMES.map(name => {
          const cfg = PROFILE_CONFIG[name];
          return (
            <button
              key={name}
              onClick={() => onSignIn(name, null, null)}
              className="flex flex-col items-center gap-3 group outline-none"
            >
              <div className="w-28 h-28 rounded-xl overflow-hidden ring-4 ring-transparent group-hover:ring-white group-focus:ring-white transition-all duration-200 group-hover:scale-105 shadow-xl">
                <img src={cfg.photo} alt={name} className="w-full h-full object-cover" />
              </div>
              <span className="text-gray-300 font-semibold text-lg tracking-wide group-hover:text-white transition-colors">
                {name}
              </span>
            </button>
          );
        })}

        {/* Add profile */}
        <div className="flex flex-col items-center gap-3">
          {!addingNew ? (
            <button
              onClick={() => setAddingNew(true)}
              className="flex flex-col items-center gap-3 group outline-none"
            >
              <div className="w-28 h-28 rounded-xl bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center text-5xl text-gray-600 group-hover:border-gray-400 group-hover:text-gray-400 transition-all duration-200 group-hover:scale-105">
                +
              </div>
              <span className="text-gray-600 font-semibold text-lg tracking-wide group-hover:text-gray-300 transition-colors">
                Add Profile
              </span>
            </button>
          ) : (
            <div className="flex flex-col items-center gap-3 bg-gray-900 rounded-2xl p-5 w-52 border border-gray-800">
              {/* Photo preview */}
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-purple-500">
                {customPhotoData
                  ? <img src={customPhotoData} alt="preview" className="w-full h-full object-cover" />
                  : customPhoto
                    ? <img src={ALL_PHOTOS.find(p => p.filename === customPhoto)?.src} alt="preset" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-gray-700 flex items-center justify-center text-2xl">👤</div>
                }
              </div>

              {/* Upload button */}
              <label className="cursor-pointer px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors">
                📷 Upload Photo
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>

              {/* Preset picker */}
              <div className="flex gap-2">
                {ALL_PHOTOS.map(p => (
                  <button
                    key={p.filename}
                    onClick={() => { setCustomPhoto(p.filename); setCustomPhotoData(null); }}
                    className={`w-10 h-10 rounded-lg overflow-hidden transition-all ${!customPhotoData && customPhoto === p.filename ? 'ring-2 ring-purple-400 scale-110' : 'opacity-40 hover:opacity-70'}`}
                  >
                    <img src={p.src} alt={p.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <input
                autoFocus
                type="text"
                value={customName}
                onChange={e => { setCustomName(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleAddNew()}
                placeholder="Name..."
                className="w-full px-3 py-1.5 bg-gray-800 text-white text-center rounded-lg border border-gray-700 focus:outline-none focus:border-purple-500 text-sm"
              />
              {error && <p className="text-red-400 text-xs text-center">{error}</p>}
              <div className="flex gap-2 w-full">
                <button onClick={handleAddNew} className="flex-1 py-1.5 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition-colors">Save</button>
                <button onClick={reset} className="flex-1 py-1.5 bg-gray-700 text-gray-300 text-sm rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
