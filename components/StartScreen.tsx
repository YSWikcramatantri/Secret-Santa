
import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-slate-950 text-white p-4 sm:p-8 overflow-y-auto">
      <div className="mb-4 sm:mb-8 flex flex-col items-center">
        <div className="text-4xl sm:text-6xl mb-2 sm:mb-4 animate-bounce">🎅</div>
        <h1 className="text-xl sm:text-3xl md:text-5xl text-red-500 pixel-font drop-shadow-lg text-center leading-tight">
          SANTA DASH
        </h1>
        <p className="text-[10px] sm:text-lg text-green-400 pixel-font mt-1 sm:mt-2">STEADY & RETRO</p>
      </div>

      <div className="bg-black/40 p-3 sm:p-6 rounded-lg border-2 border-slate-700 mb-6 sm:mb-8 max-w-md w-full">
        <h2 className="text-[8px] sm:text-[10px] pixel-font mb-2 sm:mb-4 text-yellow-500 uppercase">Controls:</h2>
        <ul className="text-[7px] sm:text-[10px] space-y-2 sm:space-y-3 pixel-font text-slate-300">
          <li className="flex items-center gap-2">
            <span className="bg-slate-700 px-1.5 py-0.5 rounded text-white">SPACE / TAP TOP</span> Jump 🏠 ☃️
          </li>
          <li className="flex items-center gap-2">
            <span className="bg-slate-700 px-1.5 py-0.5 rounded text-white">DOWN / HOLD BOTTOM</span> Duck 🕳️
          </li>
          <li className="flex items-center gap-2 text-green-400">
            Collect 🎁 and 🍭 for points!
          </li>
          <li className="text-red-400">Steady speed • Difficulty: Easy</li>
        </ul>
      </div>

      <button 
        onClick={onStart}
        className="px-6 py-3 sm:px-12 sm:py-6 bg-red-600 hover:bg-red-500 border-b-4 sm:border-b-8 border-red-800 active:border-b-0 active:translate-y-2 transition-all pixel-font text-sm sm:text-xl group"
      >
        <span className="group-hover:scale-110 block transition-transform uppercase">Play Now</span>
      </button>

      <div className="mt-6 text-[6px] sm:text-[8px] pixel-font text-slate-500 text-center">
        &copy; 2025 Yowun Sajeewana Wickramatnatri<br/>
        <span className="opacity-50 mt-1 block">CHIPTUNE AUDIO ACTIVE • TOUCH ENABLED</span>
      </div>
    </div>
  );
};

export default StartScreen;
