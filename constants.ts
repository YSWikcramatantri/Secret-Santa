
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 400;
export const GROUND_Y = 320;
export const SANTA_SIZE = 64;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -14;
export const INITIAL_SPEED = 6;
export const SPEED_INCREMENT = 0; // Speed remains steady
export const WIN_SCORE = 100;

export const OBSTACLES = [
  { variant: 'CHIMNEY', width: 40, height: 60, emoji: '🏠' },
  { variant: 'SNOWMAN', width: 40, height: 60, emoji: '☃️' },
  { variant: 'ICY_GAP', width: 60, height: 20, emoji: '🕳️' }
];

export const COLLECTIBLES = [
  { variant: 'GIFT', value: 5, emoji: '🎁' },
  { variant: 'CANDY_CANE', value: 2, emoji: '🍭' }
];
