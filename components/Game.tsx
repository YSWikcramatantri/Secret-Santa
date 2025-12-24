
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
  MAX_SPEED,
  WIN_SCORE,
  OBSTACLES,
  COLLECTIBLES
} from '../constants';
import { Entity, Particle } from '../types';

interface GameProps {
  onGameOver: (score: number) => void;
  onWin: () => void;
}

const Game: React.FC<GameProps> = ({ onGameOver, onWin }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [livesDisplay, setLivesDisplay] = useState(3);
  
  const audioCtx = useRef<AudioContext | null>(null);
  const musicInterval = useRef<number | null>(null);

  const state = useRef({
    santaY: GROUND_Y - SANTA_SIZE,
    velocity: 0,
    isJumping: false,
    isDucking: false,
    speed: INITIAL_SPEED,
    score: 0,
    lives: 3,
    entities: [] as Entity[],
    particles: [] as Particle[],
    frameCount: 0,
    isFinished: false,
    invincibilityFrames: 0,
    screenShake: 0,
    backgroundOffset: 0,
    mountainOffset: 0,
    treeOffset: 0
  });

  const playSound = (freq: number, type: OscillatorType, duration: number, volume = 0.1) => {
    if (!audioCtx.current) return;
    try {
      const osc = audioCtx.current.createOscillator();
      const gain = audioCtx.current.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
      gain.gain.setValueAtTime(volume, audioCtx.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.current.destination);
      osc.start();
      osc.stop(audioCtx.current.currentTime + duration);
    } catch (e) {}
  };

  const startMusic = () => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const melody = [392, 329.63, 293.66, 261.63, 392, 392, 392]; // Jingle Bells snippet
    const bass = [130.81, 130.81, 130.81, 130.81, 146.83, 146.83, 164.81, 196.00];
    let step = 0;
    
    musicInterval.current = window.setInterval(() => {
      if (state.current.isFinished) return;
      // Bass
      if (step % 2 === 0) playSound(bass[Math.floor(step / 2) % bass.length], 'triangle', 0.4, 0.015);
      // Melody
      if (step % 4 === 0) playSound(melody[Math.floor(step / 4) % melody.length], 'square', 0.15, 0.01);
      step++;
    }, 150);
  };

  const createParticles = (x: number, y: number, color: string, count: number, text?: string) => {
    for (let i = 0; i < count; i++) {
      state.current.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - (text ? 2 : 0),
        life: 1.0,
        color,
        size: Math.random() * 4 + 2,
        text: i === 0 ? text : undefined
      });
    }
  };

  const spawnEntity = useCallback(() => {
    const isObstacle = Math.random() > 0.4;
    const id = Math.random().toString(36).substring(2, 9);
    
    if (isObstacle) {
      const config = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
      state.current.entities.push({
        id,
        type: 'obstacle',
        variant: config.variant,
        x: CANVAS_WIDTH + 50,
        y: config.variant === 'ICY_GAP' ? GROUND_Y : GROUND_Y - config.height,
        width: config.width,
        height: config.height
      });
    } else {
      const config = COLLECTIBLES[Math.floor(Math.random() * COLLECTIBLES.length)];
      state.current.entities.push({
        id,
        type: 'collectible',
        variant: config.variant,
        x: CANVAS_WIDTH + 50,
        y: GROUND_Y - 100 - Math.random() * 100,
        width: 35,
        height: 35
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

    const handleInput = (action: 'jump' | 'duck' | 'unduck') => {
      if (action === 'jump' && !state.current.isJumping) {
        state.current.velocity = JUMP_FORCE;
        state.current.isJumping = true;
        playSound(600, 'square', 0.1, 0.05);
      } else if (action === 'duck') {
        state.current.isDucking = true;
      } else if (action === 'unduck') {
        state.current.isDucking = false;
      }
    };

    const keyHandler = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') handleInput('jump');
      if (e.code === 'ArrowDown') handleInput(e.type === 'keydown' ? 'duck' : 'unduck');
    };

    const touchHandler = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const relY = (touch.clientY - rect.top) / rect.height;
      if (e.type === 'touchstart') {
        if (relY < 0.65) handleInput('jump');
        else handleInput('duck');
      } else {
        handleInput('unduck');
      }
    };

    window.addEventListener('keydown', keyHandler);
    window.addEventListener('keyup', keyHandler);
    canvas.addEventListener('touchstart', touchHandler, { passive: false });
    canvas.addEventListener('touchend', touchHandler, { passive: false });

    const update = () => {
      if (state.current.isFinished) return;

      // Gravity & Jump
      if (state.current.isJumping) {
        state.current.velocity += GRAVITY;
        state.current.santaY += state.current.velocity;
        if (state.current.santaY >= GROUND_Y - SANTA_SIZE) {
          state.current.santaY = GROUND_Y - SANTA_SIZE;
          state.current.isJumping = false;
          state.current.velocity = 0;
        }
      }

      // Progression
      state.current.speed = Math.min(MAX_SPEED, state.current.speed + SPEED_INCREMENT);
      state.current.backgroundOffset += state.current.speed * 0.1;
      state.current.mountainOffset += state.current.speed * 0.3;
      state.current.treeOffset += state.current.speed * 0.6;
      state.current.frameCount++;

      // Entities movement
      state.current.entities.forEach(e => (e.x -= state.current.speed));
      state.current.entities = state.current.entities.filter(e => e.x > -100);

      if (state.current.frameCount % Math.max(40, Math.floor(80 - state.current.speed * 3)) === 0) {
        spawnEntity();
      }

      // Particles
      state.current.particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.text) p.vy -= 0.1; // Float text up
      });
      state.current.particles = state.current.particles.filter(p => p.life > 0);

      // Collisions
      const santaHitbox = {
        x: 105,
        y: state.current.isDucking ? state.current.santaY + 30 : state.current.santaY + 10,
        w: SANTA_SIZE - 20,
        h: state.current.isDucking ? 34 : 54
      };

      state.current.entities = state.current.entities.filter(e => {
        const collision = 
          santaHitbox.x < e.x + e.width - 5 &&
          santaHitbox.x + santaHitbox.w > e.x + 5 &&
          santaHitbox.y < e.y + e.height - 5 &&
          santaHitbox.y + santaHitbox.h > e.y + 5;

        if (collision) {
          if (e.type === 'collectible') {
            const val = COLLECTIBLES.find(c => c.variant === e.variant)?.value || 1;
            state.current.score += val;
            setScoreDisplay(state.current.score);
            createParticles(e.x + e.width/2, e.y + e.height/2, '#facc15', 8, `+${val}`);
            playSound(880, 'triangle', 0.2, 0.1);
            if (state.current.score >= WIN_SCORE) {
              state.current.isFinished = true;
              onWin();
            }
            return false;
          } else {
            if (state.current.invincibilityFrames <= 0) {
              state.current.lives--;
              setLivesDisplay(state.current.lives);
              state.current.screenShake = 15;
              state.current.invincibilityFrames = 90;
              createParticles(120, state.current.santaY + 30, '#ef4444', 15);
              playSound(150, 'sawtooth', 0.3, 0.2);
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

      if (state.current.invincibilityFrames > 0) state.current.invincibilityFrames--;
      if (state.current.screenShake > 0) state.current.screenShake *= 0.9;
    };

    const draw = () => {
      ctx.save();
      // Screen Shake
      if (state.current.screenShake > 1) {
        ctx.translate((Math.random() - 0.5) * state.current.screenShake, (Math.random() - 0.5) * state.current.screenShake);
      }

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, '#0a0a2a');
      skyGrad.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Stars (Background Layer 1)
      ctx.fillStyle = 'white';
      for (let i = 0; i < 30; i++) {
        const x = (i * 123 - state.current.backgroundOffset) % CANVAS_WIDTH;
        const y = (i * 77) % (GROUND_Y - 50);
        ctx.fillRect(x < 0 ? x + CANVAS_WIDTH : x, y, 2, 2);
      }

      // Moon
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath(); ctx.arc(700, 60, 30, 0, Math.PI * 2); ctx.fill();

      // Mountains (Background Layer 2)
      ctx.fillStyle = '#334155';
      for (let i = 0; i < 4; i++) {
        const x = (i * 300 - state.current.mountainOffset) % (CANVAS_WIDTH + 300);
        const drawX = x < -300 ? x + CANVAS_WIDTH + 300 : x;
        ctx.beginPath();
        ctx.moveTo(drawX, GROUND_Y);
        ctx.lineTo(drawX + 150, GROUND_Y - 120);
        ctx.lineTo(drawX + 300, GROUND_Y);
        ctx.fill();
      }

      // Trees (Background Layer 3)
      ctx.fillStyle = '#064e3b';
      for (let i = 0; i < 8; i++) {
        const x = (i * 150 - state.current.treeOffset) % (CANVAS_WIDTH + 150);
        const drawX = x < -150 ? x + CANVAS_WIDTH + 150 : x;
        ctx.beginPath();
        ctx.moveTo(drawX, GROUND_Y);
        ctx.lineTo(drawX + 30, GROUND_Y - 60);
        ctx.lineTo(drawX + 60, GROUND_Y);
        ctx.fill();
      }

      // Ground
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
      ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(CANVAS_WIDTH, GROUND_Y); ctx.stroke();

      // Snow Particles (Ambient)
      ctx.fillStyle = 'white';
      for (let i = 0; i < 40; i++) {
        const x = (i * 55 + state.current.frameCount * 2) % CANVAS_WIDTH;
        const y = (i * 99 + state.current.frameCount * 3) % CANVAS_HEIGHT;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      }

      // Entities
      state.current.entities.forEach(e => {
        ctx.font = '36px serif';
        const emoji = [...OBSTACLES, ...COLLECTIBLES].find(o => o.variant === e.variant)?.emoji || '❓';
        ctx.fillText(emoji, e.x, e.y + e.height - 5);
      });

      // Santa
      if (state.current.invincibilityFrames % 10 < 5) {
        const bob = Math.sin(state.current.frameCount * 0.2) * 2;
        ctx.font = `${state.current.isDucking ? 44 : 64}px serif`;
        const yPos = state.current.isDucking ? state.current.santaY + 58 : state.current.santaY + 55;
        ctx.fillText('🎅', 100, yPos + bob);
      }

      // Effect Particles
      state.current.particles.forEach(p => {
        ctx.globalAlpha = p.life;
        if (p.text) {
          ctx.font = 'bold 20px "Press Start 2P"';
          ctx.fillStyle = p.color;
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      });
      ctx.globalAlpha = 1.0;

      // Scanline Effect (Overlay)
      ctx.fillStyle = 'rgba(18, 16, 16, 0.05)';
      for (let i = 0; i < CANVAS_HEIGHT; i += 4) {
        ctx.fillRect(0, i, CANVAS_WIDTH, 2);
      }

      ctx.restore();

      animationId = requestAnimationFrame(() => {
        update();
        draw();
      });
    };

    draw();

    return () => {
      window.removeEventListener('keydown', keyHandler);
      window.removeEventListener('keyup', keyHandler);
      canvas.removeEventListener('touchstart', touchHandler);
      canvas.removeEventListener('touchend', touchHandler);
      if (musicInterval.current) clearInterval(musicInterval.current);
      cancelAnimationFrame(animationId);
    };
  }, [onGameOver, onWin, spawnEntity]);

  return (
    <div className="relative w-full h-full touch-none select-none overflow-hidden">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain bg-slate-950 image-rendering-pixelated"
      />
      
      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none items-start">
        <div className="flex flex-col gap-2">
          <div className="bg-black/70 px-4 py-2 rounded-sm border-l-4 border-yellow-500 shadow-lg">
            <p className="text-[10px] text-slate-400 mb-1 pixel-font">PRESENTS</p>
            <p className="text-xl text-yellow-400 pixel-font">{scoreDisplay.toString().padStart(3, '0')}</p>
          </div>
          <div className="text-[10px] pixel-font text-white/40">GOAL: {WIN_SCORE}</div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <div className="bg-black/70 px-4 py-2 rounded-sm border-r-4 border-red-500 shadow-lg">
            <p className="text-[10px] text-slate-400 mb-1 pixel-font text-right">LIVES</p>
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <span key={i} className={`text-xl transition-all duration-300 ${i >= livesDisplay ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>❤️</span>
              ))}
            </div>
          </div>
          <div className="text-[10px] pixel-font text-green-400 animate-pulse">SPEED: {(state.current.speed * 10).toFixed(0)} KM/H</div>
        </div>
      </div>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-40 pointer-events-none">
        <p className="pixel-font text-[8px] text-white tracking-widest bg-black/40 px-3 py-1 rounded">
          SPACE TO JUMP • DOWN TO DUCK
        </p>
      </div>
    </div>
  );
};

export default Game;
