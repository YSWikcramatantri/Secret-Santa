
import React from 'react';

interface TriviaCardProps {
  onComplete: () => void;
}

const TriviaCard: React.FC<TriviaCardProps> = ({ onComplete }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-indigo-950 p-6 sm:p-12 text-center">
      <h2 className="text-xl sm:text-2xl text-yellow-400 mb-8 pixel-font uppercase tracking-tighter animate-pulse">
        Christmas Fact
      </h2>
      
      <div className="max-w-md w-full bg-white border-8 border-red-600 p-6 sm:p-10 rounded-xl shadow-2xl transform hover:scale-105 transition-transform">
        <div className="mb-6">
          <span className="text-5xl sm:text-7xl">✉️</span>
        </div>
        
        <h3 className="text-xl sm:text-2xl text-slate-900 pixel-font mb-4 uppercase leading-tight">
          The First Card
        </h3>
        
        <p className="text-lg sm:text-2xl text-slate-700 retro-text leading-relaxed">
          The first Christmas card was designed by <span className="text-red-600 font-bold underline">John Callcott Horsley</span> in London in <span className="text-blue-600 font-bold">1843</span> for Sir Henry Cole. Only 1,000 were printed!
        </p>
      </div>

      <button 
        onClick={onComplete}
        className="mt-10 px-8 py-3 bg-green-600 hover:bg-green-500 border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all text-white pixel-font text-xs sm:text-base uppercase"
      >
        Read the Letter
      </button>

      <div className="absolute bottom-4 text-[8px] pixel-font text-white/30 uppercase">
        Historical Archive • Christmas Joy
      </div>
    </div>
  );
};

export default TriviaCard;
