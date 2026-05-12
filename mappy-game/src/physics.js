// =============================================================================
// physics.js  —  resolveEntity, getFloorAt, rectsOverlap
// =============================================================================

// ── PHYSICS ────────────────────────────────────────────────────────────────
function resolveEntity(ent){
  ent.onGround = false;

  if(ent._fromTramp || ent._fallingToTramp){
    // ── CHANNEL MODE ──
    // Entity is locked to the vertical channel of its trampoline.
    // Rising: moves up. Player can pre-buffer a direction (_exitDir).
    //   Exit fires exactly when foot reaches a floor surface.
    // Falling: moves down the same channel back to the trampoline.

    const RISE_SPD = 3.2;
    const tramp = trampolines[ent._trampIdx];

    // Lock X to channel center
    if(tramp) ent.x = tramp.cx - ent.w / 2;

    if(ent._fromTramp){
      // ── Rising ──
      ent.y -= RISE_SPD;
      const foot = ent.y + ent.h;

      // Buffer direction ONLY while actively rising — never from ground walking
      if(ent.vx !== 0) ent._exitDir = ent.vx > 0 ? 1 : -1;

      // Determine exit direction: player uses buffered _exitDir, cats use _catExitDir
      const activeDir = ent._exitDir || 0;
      const catDir    = ent._catTargetFloor !== undefined ? ent._catExitDir || 1 : 0;
      const exitDir   = activeDir || catDir;

      if(exitDir && tramp){
        const gapL = tramp.cx - GAP_W / 2;
        const gapR = tramp.cx + GAP_W / 2;

        for(let fi = 1; fi < FLOOR_Y.length; fi++){
          const py = FLOOR_Y[fi];
          // Only exit when foot is within RISE_SPD pixels of the floor surface
          if(foot > py + RISE_SPD || foot < py - 4) continue;

          // For cats: only exit at their chosen target floor
          if(catDir && !activeDir && fi !== ent._catTargetFloor) continue;

          const dir = exitDir;
          let exitSeg = null;
          for(const pl of PLATFORMS[fi]){
            if(dir > 0 && pl.x >= gapR){
              if(!exitSeg || pl.x < exitSeg.x) exitSeg = pl;
            } else if(dir < 0 && pl.x+pl.w <= gapL){
              if(!exitSeg || pl.x+pl.w > exitSeg.x+exitSeg.w) exitSeg = pl;
            }
          }
          if(exitSeg){
            const STEP_IN = 12;
            ent.y = py - ent.h;
            ent.x = dir > 0 ? gapR + STEP_IN : gapL - ent.w - STEP_IN;
            ent.vy = 0;
            ent.onGround        = true;
            ent._fromTramp      = false;
            ent._trampIdx       = -1;
            ent._exitDir        = 0;
            ent._catTargetFloor = undefined;
            ent._catExitDir     = 0;
            return;
          }
        }
      }

      // Reached top — fall back down
      if(tramp && foot < FLOOR_Y[FLOOR_Y.length-1] - 4){
        ent._fromTramp      = false;
        ent._fallingToTramp = true;
        ent._exitDir        = 0;
        ent.vy = 0;
      }

    } else {
      // ── Falling down channel — no exits, ride all the way to the trampoline ──
      ent.y += RISE_SPD;
      const foot = ent.y + ent.h;

      if(tramp){
        if(foot >= tramp.y){
          ent.y = tramp.y - ent.h;
          ent.vy = 0; ent.onGround = true;
          ent._fallingToTramp = false;
          ent._trampIdx = -1; ent._exitDir = 0;
        }
      } else {
        // Tramp broken — land on ground floor
        if(foot >= FLOOR_Y[0]){
          ent.y = FLOOR_Y[0] - ent.h;
          ent.vy = 0; ent.onGround = true;
          ent._fallingToTramp = false; ent._exitDir = 0;
        }
      }
    }

  } else {
    // ── NORMAL MODE ──

    // Horizontal movement + side walls
    ent.x += ent.vx;
    if(ent.x < WALL_L){ ent.x = WALL_L; ent.vx = Math.abs(ent.vx); ent.facing = 1; }
    if(ent.x+ent.w > WALL_R){ ent.x = WALL_R-ent.w; ent.vx = -Math.abs(ent.vx); ent.facing = -1; }

    // Gravity
    ent.vy += GRAVITY;
    ent.y  += ent.vy;

    // Check if falling into a trampoline gap — route into channel fall
    if(ent.vy > 0){
      for(let ti = 0; ti < trampolines.length; ti++){
        const t = trampolines[ti];
        if(t.broken) continue;
        const cx = ent.x + ent.w/2;
        // Is center over this tramp's gap column?
        if(cx < t.cx - GAP_W/2 || cx > t.cx + GAP_W/2) continue;
        // Are we falling through an upper floor gap zone?
        for(let fi = 1; fi < FLOOR_Y.length; fi++){
          const py = FLOOR_Y[fi];
          const prevFoot = ent.y + ent.h - ent.vy;
          const currFoot = ent.y + ent.h;
          // Entity just crossed this floor level going down
          if(prevFoot <= py && currFoot > py){
            // Lock into channel fall
            ent._fallingToTramp = true;
            ent._trampIdx = ti;
            ent.x = t.cx - ent.w/2;
            ent.vy = 0;
            ent.vx = 0;
            // Cats: assign random target floor so they exit on the way back up
            if(ent.color !== undefined && !ent._exitDir){
              ent._catTargetFloor = 1 + Math.floor(Math.random() * (FLOOR_Y.length - 1));
              ent._catExitDir = Math.random() < 0.5 ? 1 : -1;
            }
            break;
          }
        }
        if(ent._fallingToTramp) break;
      }
    }

    // Land on floors when falling (normal, not in gap)
    if(!ent._fallingToTramp){
      for(let fi = 0; fi < FLOOR_Y.length; fi++){
        const py = FLOOR_Y[fi];
        for(const pl of PLATFORMS[fi]){
          const cx = ent.x + ent.w/2;
          if(cx >= pl.x && cx <= pl.x+pl.w){
            const prevFoot = ent.y + ent.h - ent.vy;
            const currFoot = ent.y + ent.h;
            if(prevFoot <= py + 2 && currFoot >= py && ent.vy >= 0){
              ent.y = py - ent.h; ent.vy = 0; ent.onGround = true;
            }
          }
        }
      }
    }

    // Outer wall edges only — gap edges stay open
    if(ent.onGround){
      const foot = ent.y + ent.h;
      for(let fi = 0; fi < FLOOR_Y.length; fi++){
        if(Math.abs(foot - FLOOR_Y[fi]) > 4) continue;
        const segs = PLATFORMS[fi];
        for(let si = 0; si < segs.length; si++){
          const pl = segs[si];
          if(si === segs.length-1 && ent.vx > 0 && ent.x+ent.w > pl.x+pl.w && ent.x < pl.x+pl.w)
            ent.x = pl.x+pl.w - ent.w;
          if(si === 0 && ent.vx < 0 && ent.x < pl.x && ent.x+ent.w > pl.x)
            ent.x = pl.x;
        }
      }
    }

    if(ent.y > H+10){ ent.y = FLOOR_Y[0]-ent.h; ent.vy = 0; ent.onGround = true; }
  }
}

function getFloorAt(ent){
  const fy=ent.y+ent.h;
  for(let fi=0;fi<FLOOR_Y.length;fi++){
    if(Math.abs(fy-FLOOR_Y[fi])<8){
      for(const pl of PLATFORMS[fi]){
        const cx=ent.x+ent.w/2;
        if(cx>=pl.x && cx<=pl.x+pl.w) return fi;
      }
    }
  }
  return -1;
}

function rectsOverlap(a,b){
  return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;
}
