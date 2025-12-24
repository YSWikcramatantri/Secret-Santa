
import React, { useState } from 'react';
import { GameScreen } from './types';
import Game from './components/Game';
import MemoryGame from './components/MemoryGame';
import Flashcards from './components/Flashcards';
import RetroMessage from './components/RetroMessage';
import StartScreen from './components/StartScreen';

const App: React.FC = () => {
  const [screen, setScreen] = useState<GameScreen>(GameScreen.START);
  const [finalScore, setFinalScore] = useState(0);

  const startGame = () => {
    setScreen(GameScreen.PLAYING);
  };

  const handleGameOver = (score: number) => {
    setFinalScore(score);
    setScreen(GameScreen.GAMEOVER);
  };

  const handleWin = () => {
    setScreen(GameScreen.WON);
    setTimeout(() => {
      setScreen(GameScreen.MEMORY);
    }, 2500);
  };

  const handleMemoryFinished = () => {
    setScreen(GameScreen.TRIVIA_CARD);
  };

  const handleTriviaFinished = () => {
    setScreen(GameScreen.MESSAGE);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-4xl h-[65vh] sm:aspect-[2/1] sm:h-auto bg-slate-900 border-4 sm:border-8 border-slate-700 shadow-2xl overflow-hidden rounded-lg">
        {screen === GameScreen.START && (
          <StartScreen onStart={startGame} />
        )}
        
        {screen === GameScreen.PLAYING && (
          <Game 
            onGameOver={handleGameOver} 
            onWin={handleWin}
          />
        )}

        {screen === GameScreen.GAMEOVER && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 text-white text-center p-8">
            <h1 className="text-2xl sm:text-4xl mb-8 text-red-500 pixel-font uppercase">Game Over</h1>
            <p className="mb-4 text-lg sm:text-xl pixel-font">Final Score: {finalScore}</p>
            <button 
              onClick={() => setScreen(GameScreen.START)}
              className="px-6 py-3 sm:px-8 sm:py-4 bg-green-600 hover:bg-green-500 border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all pixel-font text-xs sm:text-base uppercase"
            >
              Try Again
            </button>
          </div>
        )}

        {screen === GameScreen.WON && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-900/90 z-50 text-white text-center p-8">
            <h1 className="text-2xl sm:text-4xl mb-4 text-yellow-400 pixel-font uppercase">You Win!</h1>
            <p className="mb-4 text-sm sm:text-xl pixel-font">Santa delivered all the gifts!</p>
            <div className="animate-bounce text-4xl sm:text-6xl">🎅🎄✨</div>
            <p className="mt-8 text-[8px] sm:text-sm opacity-70 pixel-font animate-pulse uppercase">Level 2: Memory Challenge</p>
          </div>
        )}

        {screen === GameScreen.MEMORY && (
          <MemoryGame onComplete={handleMemoryFinished} />
        )}

        {screen === GameScreen.TRIVIA_CARD && (
          <Flashcards onComplete={handleTriviaFinished} />
        )}

        {screen === GameScreen.MESSAGE && (
          <RetroMessage />
        )}
      </div>
    </div>
  );
};

export default App;
