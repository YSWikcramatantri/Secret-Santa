
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 400;
export const GROUND_Y = 320;
export const SANTA_SIZE = 64;
export const GRAVITY = 0.7;
export const JUMP_FORCE = -15;
export const INITIAL_SPEED = 5;
export const SPEED_INCREMENT = 0.001; // Slow increase for arcade challenge
export const MAX_SPEED = 12;
export const WIN_SCORE = 100;

export const OBSTACLES = [
  { variant: 'CHIMNEY', width: 45, height: 60, emoji: '🏠' },
  { variant: 'SNOWMAN', width: 40, height: 65, emoji: '☃️' },
  { variant: 'ICY_GAP', width: 70, height: 30, emoji: '🕳️' },
  { variant: 'REINDEER_GONE_WILD', width: 50, height: 50, emoji: '🦌' }
];

export const COLLECTIBLES = [
  { variant: 'GIFT', value: 5, emoji: '🎁' },
  { variant: 'CANDY_CANE', value: 2, emoji: '🍭' },
  { variant: 'STAR', value: 10, emoji: '⭐' }
];
