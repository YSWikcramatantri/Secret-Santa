
import React, { useState, useEffect } from 'react';

const RetroMessage: React.FC = () => {
  const bodyText = "Merry Christmas, my dearest Arunodi. May you shine like the morning sun, filling my life with warmth and radiance.";
  const closingText = "Your loving friend, Yowun";
  
  const [displayedBody, setDisplayedBody] = useState("");
  const [displayedClosing, setDisplayedClosing] = useState("");
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    let bodyIndex = 0;
    const bodyInterval = setInterval(() => {
      setDisplayedBody(bodyText.slice(0, bodyIndex));
      bodyIndex++;
      if (bodyIndex > bodyText.length) {
        clearInterval(bodyInterval);
        
        // Start typing closing after body is done
        let closingIndex = 0;
        const closingInterval = setInterval(() => {
          setDisplayedClosing(closingText.slice(0, closingIndex));
          closingIndex++;
          if (closingIndex > closingText.length) {
            clearInterval(closingInterval);
            setTimeout(() => setShowHeart(true), 800);
          }
        }, 80);
      }
    }, 60);

    return () => {
      clearInterval(bodyInterval);
    };
  }, []);

  // Helper to highlight the name within the body text
  const renderHighlightedText = (text: string) => {
    const parts = text.split("Arunodi");
    if (parts.length === 1) return text;
    return (
      <>
        {parts[0]}
        <span className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">Arunodi</span>
        {parts[1]}
      </>
    );
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black p-4 sm:p-12 text-center overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none z-0">
        {/* Retro scanline and vignette effect */}
        <div className="w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
        <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,1)]"></div>
      </div>
      
      <div className="max-w-xl w-full relative z-10 flex flex-col items-center">
        <h1 className="text-xl sm:text-3xl mb-8 sm:mb-12 text-green-500 pixel-font animate-pulse tracking-tighter">
          MISSION ACCOMPLISHED
        </h1>
        
        <div className="w-full bg-slate-900/40 p-6 sm:p-10 rounded-lg border border-white/10 shadow-inner">
          {/* Letter Body */}
          <div className="text-left mb-8">
            <p className="text-xl sm:text-3xl text-white retro-text leading-relaxed tracking-wide min-h-[120px]">
              {renderHighlightedText(displayedBody)}
              {displayedBody.length < bodyText.length && (
                <span className="animate-blink bg-white ml-1">&nbsp;</span>
              )}
            </p>
          </div>

          {/* Letter Closing */}
          <div className="text-right mt-6 sm:mt-10 min-h-[60px]">
            <p className="text-lg sm:text-2xl text-red-400 retro-text italic">
              {displayedClosing}
              {displayedBody.length >= bodyText.length && displayedClosing.length < closingText.length && (
                <span className="animate-blink bg-red-400 ml-1">&nbsp;</span>
              )}
            </p>
          </div>
        </div>

        {/* Centered Heart and Decorations */}
        <div className={`mt-8 sm:mt-12 transition-all duration-1000 transform ${showHeart ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-50'}`}>
          <div className="relative inline-block">
            <span className="text-6xl sm:text-8xl text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-bounce inline-block">
              ❤️
            </span>
            <div className="absolute -top-4 -left-4 text-2xl animate-spin text-blue-300 opacity-60">❄️</div>
            <div className="absolute -bottom-4 -right-4 text-2xl animate-spin text-yellow-200 opacity-60">✨</div>
          </div>
          
          <div className="mt-6 flex justify-center gap-6">
             <span className="text-xl animate-pulse text-white/40">❄️</span>
             <span className="text-xl animate-pulse text-white/40 delay-300">❄️</span>
             <span className="text-xl animate-pulse text-white/40 delay-700">❄️</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 0.8s infinite;
          display: inline-block;
          width: 10px;
          height: 1.2em;
          vertical-align: middle;
        }
      `}</style>
    </div>
  );
};

export default RetroMessage;
