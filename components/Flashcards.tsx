import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Flashcard } from '../types';

interface FlashcardsProps {
  onComplete: () => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ onComplete }) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        // Safe access to API Key using process.env as per requirements
        const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : undefined;
        
        if (!apiKey) {
          throw new Error("API Key not found in environment");
        }

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Generate 5 interesting Christmas trivia flashcards. Each should have a 'front' (the topic/item) and a 'back' (a cool fact).",
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  front: { type: Type.STRING },
                  back: { type: Type.STRING }
                },
                required: ["id", "front", "back"]
              }
            }
          }
        });

        const textOutput = response.text;
        if (textOutput) {
          const data = JSON.parse(textOutput);
          setCards(data);
        } else {
          throw new Error("Empty response from AI");
        }
      } catch (error) {
        console.error("Flashcards fallback triggered:", error);
        // Robust fallback data if API is unavailable
        setCards([
          { id: 1, front: "Reindeer", back: "Reindeer are the only deer species where both males and females grow antlers." },
          { id: 2, front: "Christmas Trees", back: "The first artificial Christmas trees were made in Germany using goose feathers dyed green." },
          { id: 3, front: "Mistletoe", back: "Mistletoe is actually a parasitic plant that lives on trees like oak and apple." },
          { id: 4, front: "Santa's Red Suit", back: "Santa's red suit was already popular before Coca-Cola's famous 1930s ads!" },
          { id: 5, front: "Jingle Bells", back: "Jingle Bells was originally written for Thanksgiving, not Christmas!" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      onComplete();
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white pixel-font">
        <div className="text-4xl animate-spin mb-4">🌟</div>
        <p className="text-sm">GENERATING TRIVIA...</p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-900 to-green-950 p-6">
      <h2 className="text-xl text-yellow-400 mb-8 pixel-font text-center">XMAS CHALLENGE: TRIVIA</h2>
      
      <div className="w-full max-w-md h-64 perspective-1000">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full h-full transition-transform duration-500 transform-style-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white border-8 border-red-500 rounded-xl flex items-center justify-center p-8 shadow-xl">
             <div className="text-center">
                <p className="text-xs text-slate-400 mb-2 pixel-font">TOPIC</p>
                <h3 className="text-2xl text-slate-900 pixel-font">{currentCard?.front}</h3>
                <p className="mt-8 text-[8px] text-slate-400 pixel-font animate-pulse uppercase">Click to flip</p>
             </div>
          </div>
          
          {/* Back */}
          <div className="absolute inset-0 backface-hidden bg-slate-100 border-8 border-green-600 rounded-xl flex items-center justify-center p-8 shadow-xl rotate-y-180">
            <div className="text-center overflow-auto max-h-full">
               <p className="text-xs text-slate-400 mb-2 pixel-font">DID YOU KNOW?</p>
               <p className="text-lg text-slate-800 retro-text leading-tight">{currentCard?.back}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-[10px] text-white pixel-font">CARD {currentIndex + 1} OF {cards.length}</p>
        <button 
          onClick={handleNext}
          disabled={!isFlipped}
          className={`px-8 py-3 rounded pixel-font transition-all ${isFlipped ? 'bg-yellow-500 hover:bg-yellow-400 text-slate-900' : 'bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed'}`}
        >
          {currentIndex === cards.length - 1 ? 'FINISH' : 'NEXT CARD'}
        </button>
      </div>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
};

export default Flashcards;