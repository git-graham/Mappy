// =============================================================================
// level.js  —  Level geometry, platform segments, door/item layouts, buildLevel
// =============================================================================

// ── LEVEL GEOMETRY ─────────────────────────────────────────────────────────
// 3 trampolines, evenly spaced across the 640px level
const TRAMP_CX  = [140, 320, 500];   // X centers of 3 trampolines
const TRAMP_W   = 52;                // trampoline width
const TRAMP_H   = 14;
const GAP_W     = TRAMP_W + 8;      // gap on upper floors (slightly wider than tramp)

// Floor Y positions (top surface). Ground=430, then 340, 250, 160, 70
const FLOOR_Y   = [430, 340, 250, 160, 70];
const PLAT_H    = 14;
const WALL_L    = 20, WALL_R = 620;

// Build platform segments for a given floor index.
// Floor 0: solid ground — trampolines sit ON TOP
// Floors 1-4: gaps aligned above each trampoline
function buildFloorSegs(fi){
  if(fi===0) return [{x:WALL_L, w:WALL_R-WALL_L}];
  const segs=[];
  let cur=WALL_L;
  for(const tx of TRAMP_CX){
    const gl=tx-GAP_W/2, gr=tx+GAP_W/2;
    if(gl>cur) segs.push({x:cur, w:gl-cur});
    cur=gr;
  }
  if(cur<WALL_R) segs.push({x:cur, w:WALL_R-cur});
  return segs;
}

const PLATFORMS = [0,1,2,3,4].map(buildFloorSegs);

// Doors — Phase 3: 4 regular doors + 4 special corner doors per level
// Special doors are placed in the 4 corner areas of the level.
// regular: {floor,x,special:false}
// special: {floor,x,special:true}  — flashing orange, shockwave on open, one-time
const DOORS_LAYOUT=[
  [
    // Regular doors (4)
    {floor:1,x:260,special:false},
    {floor:2,x:200,special:false},
    {floor:3,x:280,special:false},
    {floor:2,x:400,special:false},
    // Special corner doors (4) — near the 4 corners
    {floor:1,x:30, special:true},   // bottom-left corner area
    {floor:1,x:560,special:true},   // bottom-right corner area
    {floor:4,x:30, special:true},   // top-left corner area
    {floor:4,x:555,special:true},   // top-right corner area
  ],
  [
    // Regular doors (4)
    {floor:1,x:300,special:false},
    {floor:2,x:150,special:false},
    {floor:3,x:360,special:false},
    {floor:2,x:460,special:false},
    // Special corner doors (4)
    {floor:1,x:30, special:true},
    {floor:1,x:560,special:true},
    {floor:4,x:30, special:true},
    {floor:4,x:555,special:true},
  ],
];

// Items
const ITEMS_LAYOUT=[
  [
    {floor:4,x:420, label:'MONA', color:'#8040C0'},
    {floor:3,x:80,  label:'RADIO',color:'#E07020'},
    {floor:2,x:480, label:'SAFE', color:'#808080'},
    {floor:1,x:220, label:'PC',   color:'#20A090'},
    {floor:0,x:380, label:'TV',   color:'#D0C000'},
  ],
  [
    {floor:4,x:100, label:'MONA', color:'#8040C0'},
    {floor:3,x:460, label:'RADIO',color:'#E07020'},
    {floor:2,x:100, label:'SAFE', color:'#808080'},
    {floor:1,x:480, label:'PC',   color:'#20A090'},
    {floor:0,x:200, label:'TV',   color:'#D0C000'},
  ],
];
