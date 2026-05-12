// =============================================================================
// state.js  —  Shared mutable game state variables + entity factories
// =============================================================================
const canvas = document.getElementById('c');
const ctx    = canvas.getContext('2d');
const W = 640, H = 480;
// ── GAME STATE ─────────────────────────────────────────────────────────────
let state='TITLE';
let paused=false;
let lives=3, score=0, timer=90, hurryTriggered=false, hurryScroll=-9999;
let levelNum=0, collectedItems=[false,false,false,false,false];
let frameCount=0, deathTimer=0, winTimer=0;
let catRespawnTimers=[0,0,0,0];
let shockwaves=[]; // Phase 3: [{floor, x, dir, speed, life, maxLife}]

// ── ENTITY FACTORIES ───────────────────────────────────────────────────────
const GRAVITY   = 0.07;   // lower gravity for floatier arc
const WALK_SPD  = 2.4;
// Low gravity means we need less force to reach the same height,
// but the arc takes much longer — which is the desired slow feel.
const TRAMP_FORCE = -7.2;   // tuned for lower gravity to still reach top floor
const TRAMP_COLORS = PAL.trampColors;

function makeTrampoline(cx){
  return {cx, x:cx-TRAMP_W/2, y:FLOOR_Y[0]-TRAMP_H, w:TRAMP_W, h:TRAMP_H,
          state:0, broken:false, breakAnim:0, bounceAnim:0};
}
function makeDoor(floor,x,special=false){
  const w = special ? 22 : 16;
  const h = special ? 44 : 36;
  return {floor, x, y:FLOOR_Y[floor]-h, w, h,
          open:false, special, used:false,
          flashTimer:0, // used for special door flash effect
          catOpenTimer:0, // how long a cat has had this door open
  };
}
function makeItem(floor,x,label,color){
  return {floor, x:x-12, y:FLOOR_Y[floor]-26, w:24, h:24, label, color, collected:false, bobAnim:0};
}
function makePlayer(){
  return {x:220, y:FLOOR_Y[0]-28, w:18, h:28,
          vx:0, vy:0, onGround:false, facing:1,
          walkFrame:0, walkTimer:0,
          onTramp:-1, lastTramp:-1, alive:true, invincibleTimer:0,
          _fromTramp:false, _fallingToTramp:false, _trampIdx:-1, _exitDir:0};
}
function makeCat(x,floor,color,big=false){
  const w=big?28:20, h=big?28:22;
  return {x, y:FLOOR_Y[floor]-h, w, h,
          vx:big?1.1:1.4, vy:0, facing:1,
          onGround:false, walkFrame:0, walkTimer:0,
          floor, alive:true, dead:false, deadTimer:0,
          stunTimer:0, color, big, onTramp:-1,
          // Big cat hiding state
          hiding:false, hideTarget:-1, hideTimer:0,
          signTimer:0,
          _fromTramp:false, _fallingToTramp:false, _trampIdx:-1, _exitDir:0};
}

let trampolines=[], doors=[], items=[], player=makePlayer(), cats=[];

const CAT_SPAWNS=[
  {x:480, floor:0, color:'#E050A0', big:false},
  {x:80,  floor:1, color:'#E050A0', big:false},
  {x:560, floor:3, color:'#E050A0', big:false},
  {x:320, floor:2, color:'#C01818', big:true},
];

function buildLevel(lv){
  const lvl=lv%2;
  trampolines=TRAMP_CX.map(makeTrampoline);
  doors=DOORS_LAYOUT[lvl].map(d=>makeDoor(d.floor,d.x,d.special||false));
  items=ITEMS_LAYOUT[lvl].map((it,i)=>{
    const obj=makeItem(it.floor,it.x,it.label,it.color);
    obj.collected=collectedItems[i]||false;
    return obj;
  });
  player=makePlayer();
  cats=CAT_SPAWNS.map(s=>makeCat(s.x,s.floor,s.color,s.big));
  catRespawnTimers=[0,0,0,0];
  shockwaves=[]; // Phase 3: active shockwaves
}
