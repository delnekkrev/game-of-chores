import React from 'react';

export default function TaskItem({ task, isCompleted, onToggle, justChecked }) {
  return (
    <button
      onClick={() => onToggle(task.id)}
      className={`
        w-full flex items-center gap-3 p-3.5 rounded-xl text-left
        border transition-all duration-300
        ${isCompleted
          ? 'bg-green-900/30 border-green-500/30'
          : 'bg-slate-700/40 border-slate-600/50 hover:border-slate-500 hover:bg-slate-700/70'
        }
        ${justChecked ? 'scale-95' : 'scale-100'}
      `}
    >
      {/* Checkbox circle */}
      <div
        className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
          transition-all duration-200
          ${isCompleted ? 'bg-green-500 border-green-400' : 'border-slate-500 bg-transparent'}
        `}
      >
        {isCompleted && (
          <svg
            className="w-3.5 h-3.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Task name + description */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{task.emoji}</span>
          <span
            className={`text-sm font-semibold leading-snug ${
              isCompleted ? 'line-through text-slate-500' : 'text-white'
            }`}
          >
            {task.name}
          </span>
        </div>
        {!isCompleted && task.desc && (
          <p className="text-xs text-slate-500 mt-0.5 ml-6">{task.desc}</p>
        )}
      </div>

      {/* Points badge */}
      <div className="flex-shrink-0 text-right">
        {isCompleted ? (
          <span className="text-green-400 text-sm font-bold">+{task.points} ✓</span>
        ) : (
          <span className="text-yellow-400 text-sm font-bold">+{task.points}</span>
        )}
        <p className="text-xs text-slate-500">pts</p>
      </div>
    </button>
  );
}
