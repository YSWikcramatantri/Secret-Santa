
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GROUND_Y, 
  SANTA_SIZE, 
  GRAVITY, 
  JUMP_FORCE, 
  INITIAL_SPEED, 
  SPEED_INCREMENT, 
  WIN_SCORE,
  OBSTACLES,
  COLLECTIBLES
} from '../constants';
import { Entity } from '../types';

interface GameProps {
  onGameOver: (score: number) => void;
  onWin: () => void;
}

const Game: React.FC<GameProps> = ({ onGameOver, onWin }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  // Audio Refs
  const audioCtx = useRef<AudioContext | null>(null);
  const musicInterval = useRef<number | null>(null);

  const playSound = (freq: number, type: OscillatorType, duration: number, volume = 0.1) => {
    if (!audioCtx.current) return;
    try {
      if (audioCtx.current.state === 'suspended') {
        audioCtx.current.resume();
      }
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(volume, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start();
      osc.stop(audioCtx.current.currentTime + duration);
    } catch (e) {
      console.warn("Audio failed", e);
    }
  };

  const playJumpSound = () => {
    if (!audioCtx.current) return;
    const osc = audioCtx.current.createOscillator();
    const gain = audioCtx.current.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, audioCtx.current.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.current.currentTime + 0.1);
    gain.gain.setValueAtTime(0.05, audioCtx.current.currentTime);
    gain.gain.linearRampToValueAtTime(0, audioCtx.current.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(audioCtx.current.destination);
    osc.start();
    osc.stop(audioCtx.current.currentTime + 0.1);
  };

  const playCollectSound = () => playSound(880, 'triangle', 0.2, 0.1);
  const playHitSound = () => playSound(100, 'sawtooth', 0.3, 0.15);

  const startMusic = () => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    let step = 0;
    musicInterval.current = window.setInterval(() => {
      playSound(notes[step % notes.length], 'square', 0.1, 0.02);
      step++;
    }, 200);
  };

  const state = useRef({
    santaY: GROUND_Y - SANTA_SIZE,
    velocity: 0,
    isJumping: false,
    isDucking: false,
    speed: INITIAL_SPEED,
    score: 0,
    lives: 3,
    entities: [] as Entity[],
    frameCount: 0,
    isFinished: false,
    invincibilityFrames: 0
  });

  const spawnEntity = useCallback(() => {
    const isObstacle = Math.random() > 0.45;
    const id = Math.random().toString(36).substr(2, 9);
    
    if (isObstacle) {
      const type = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
      state.current.entities.push({
        id,
        type: 'obstacle',
        variant: type.variant,
        x: CANVAS_WIDTH,
        y: type.variant === 'ICY_GAP' ? GROUND_Y : GROUND_Y - type.height,
        width: type.width,
        height: type.height
      });
    } else {
      const type = COLLECTIBLES[Math.floor(Math.random() * COLLECTIBLES.length)];
      state.current.entities.push({
        id,
        type: 'collectible',
        variant: type.variant,
        x: CANVAS_WIDTH,
        y: GROUND_Y - 100 - Math.random() * 80,
        width: 30,
        height: 30
      });
    }
  }, []);

  useEffect(() => {
    startMusic();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !state.current.isJumping) {
        state.current.velocity = JUMP_FORCE;
        state.current.isJumping = true;
        playJumpSound();
      }
      if (e.code === 'ArrowDown') {
        state.current.isDucking = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        state.current.isDucking = false;
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const relY = (touch.clientY - rect.top) / rect.height;
      
      // Top 65% of screen = Jump
      if (relY < 0.65) {
        if (!state.current.isJumping) {
          state.current.velocity = JUMP_FORCE;
          state.current.isJumping = true;
          playJumpSound();
        }
      } else {
        // Bottom 35% = Duck
        state.current.isDucking = true;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      state.current.isDucking = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    const update = () => {
      if (state.current.isFinished) return;

      if (state.current.isJumping) {
        state.current.velocity += GRAVITY;
        state.current.santaY += state.current.velocity;
        if (state.current.santaY >= GROUND_Y - SANTA_SIZE) {
          state.current.santaY = GROUND_Y - SANTA_SIZE;
          state.current.isJumping = false;
          state.current.velocity = 0;
        }
      }

      state.current.entities.forEach(entity => {
        entity.x -= state.current.speed;
      });

      state.current.entities = state.current.entities.filter(e => e.x > -100);

      state.current.frameCount++;
      const spawnRate = 80;
      if (state.current.frameCount % spawnRate === 0) {
        spawnEntity();
      }

      const santaRect = {
        x: 100,
        y: state.current.isDucking ? state.current.santaY + 32 : state.current.santaY,
        width: SANTA_SIZE - 10,
        height: state.current.isDucking ? SANTA_SIZE / 2 : SANTA_SIZE
      };

      state.current.entities = state.current.entities.filter(entity => {
        const entityRect = {
          x: entity.x + 5,
          y: entity.y + 5,
          width: entity.width - 10,
          height: entity.height - 10
        };

        const collision = 
          santaRect.x < entityRect.x + entityRect.width &&
          santaRect.x + santaRect.width > entityRect.x &&
          santaRect.y < entityRect.y + entityRect.height &&
          santaRect.y + santaRect.height > entityRect.y;

        if (collision) {
          if (entity.type === 'collectible') {
            const val = COLLECTIBLES.find(c => c.variant === entity.variant)?.value || 1;
            state.current.score += val;
            setScore(state.current.score);
            playCollectSound();
            
            if (state.current.score >= WIN_SCORE) {
              state.current.isFinished = true;
              onWin();
            }
            return false;
          } else {
            if (state.current.invincibilityFrames <= 0) {
              state.current.lives--;
              setLives(state.current.lives);
              playHitSound();
              state.current.invincibilityFrames = 60;
              
              if (state.current.lives <= 0) {
                state.current.isFinished = true;
                onGameOver(state.current.score);
              }
            }
            return true;
          }
        }
        return true;
      });

      if (state.current.invincibilityFrames > 0) {
        state.current.invincibilityFrames--;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#0a0a2a';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = 'white';
      for (let i = 0; i < 20; i++) {
        const x = (state.current.frameCount * 0.5 + i * 100) % CANVAS_WIDTH;
        ctx.fillRect(x, (i * 13) % (GROUND_Y - 50), 2, 2);
      }

      ctx.fillStyle = '#fdfdfd';
      ctx.beginPath();
      ctx.arc(700, 60, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#eef2ff';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
      ctx.stroke();

      state.current.entities.forEach(entity => {
        ctx.font = '30px serif';
        const config = [...OBSTACLES, ...COLLECTIBLES].find(o => o.variant === entity.variant);
        ctx.fillText(config?.emoji || '❓', entity.x, entity.y + entity.height - 5);
      });

      if (state.current.invincibilityFrames % 10 < 5) {
        ctx.font = `${state.current.isDucking ? 40 : 60}px serif`;
        ctx.fillText('🎅', 100, state.current.santaY + (state.current.isDucking ? 55 : 55));
      }

      animationId = requestAnimationFrame(() => {
        update();
        draw();
      });
    };

    draw();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      if (musicInterval.current) clearInterval(musicInterval.current);
      cancelAnimationFrame(animationId);
    };
  }, [onGameOver, onWin, spawnEntity]);

  return (
    <div className="relative w-full h-full touch-none select-none">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain bg-slate-950"
      />
      
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
        <div className="bg-black/50 px-2 py-1 sm:px-3 sm:py-1 rounded border border-white/20">
          <p className="text-[6px] sm:text-[8px] text-slate-400 mb-0.5 pixel-font">GIFTS</p>
          <p className="text-sm sm:text-lg text-yellow-400 pixel-font">{score.toString().padStart(3, '0')}</p>
        </div>
        
        <div className="bg-black/50 px-2 py-1 sm:px-3 sm:py-1 rounded border border-white/20 flex gap-1 sm:gap-2 items-end">
          <p className="text-[6px] sm:text-[8px] text-slate-400 mb-0.5 pixel-font mr-1 uppercase">Life</p>
          {[...Array(3)].map((_, i) => (
            <span key={i} className={`text-sm sm:text-lg transition-opacity ${i >= lives ? 'opacity-20 grayscale' : 'opacity-100'}`}>❤️</span>
          ))}
        </div>
      </div>

      <div className="absolute bottom-2 left-0 right-0 flex justify-center opacity-30 pointer-events-none">
        <p className="pixel-font text-[6px] sm:text-[8px] text-white">TAP TOP TO JUMP • HOLD BOTTOM TO DUCK</p>
      </div>
    </div>
  );
};

export default Game;
