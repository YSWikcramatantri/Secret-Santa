
import React, { useState, useEffect } from 'react';

interface MemoryGameProps {
  onComplete: () => void;
}

const EMOJIS = ['🎄', '🎁', '🎅', '❄️', '⛄', '🦌', '🍬', '🔔'];

const MemoryGame: React.FC<MemoryGameProps> = ({ onComplete }) => {
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    const shuffledCards = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
  }, []);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1);
      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          
          if (matchedCards.every(c => c.isMatched)) {
            setTimeout(onComplete, 1000);
          }
        }, 500);
      } else {
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-4 select-none">
      <div className="mb-6 text-center">
        <h2 className="text-xl sm:text-2xl text-red-500 pixel-font uppercase mb-2">Memory Match</h2>
        <p className="text-[10px] text-green-400 pixel-font uppercase">Find all the pairs! Moves: {moves}</p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-sm w-full h-[300px] sm:h-[350px]">
        {cards.map((card, index) => (
          <div
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={`
              relative cursor-pointer transition-all duration-300 transform preserve-3d
              ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
              h-full w-full
            `}
          >
            <div className={`
              absolute inset-0 flex items-center justify-center rounded-lg border-2 sm:border-4
              ${card.isMatched ? 'bg-green-900/50 border-green-500 opacity-50' : 'bg-slate-800 border-slate-600'}
              backface-hidden text-2xl sm:text-4xl
            `}>
              ❓
            </div>
            <div className={`
              absolute inset-0 flex items-center justify-center rounded-lg border-2 sm:border-4
              bg-white border-red-500 rotate-y-180 backface-hidden text-2xl sm:text-4xl
            `}>
              {card.emoji}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .rotate-y-180 { transform: rotateY(180deg); }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
};

export default MemoryGame;
