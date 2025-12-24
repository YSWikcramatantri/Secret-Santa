
export enum GameScreen {
  START = 'START',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
  WON = 'WON',
  MEMORY = 'MEMORY',
  TRIVIA_CARD = 'TRIVIA_CARD',
  MESSAGE = 'MESSAGE'
}

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'obstacle' | 'collectible';
  id: string;
  variant: string;
}

export interface GameState {
  score: number;
  lives: number;
  speed: number;
  isJumping: boolean;
  isDucking: boolean;
  jumpVelocity: number;
  santaY: number;
}

// Fix: Added missing Flashcard interface used by the flashcards component
export interface Flashcard {
  id: number;
  front: string;
  back: string;
}
