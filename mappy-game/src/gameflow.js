// =============================================================================
// gameflow.js  —  startGame, resetAfterDeath, triggerDeath, spawnShockwave,
//                 sweepCatOffScreen, killCat, buildLevel wrapper
// =============================================================================

// ── GAME FLOW ──────────────────────────────────────────────────────────────
function startGame(){
  lives=3; score=0; timer=90; hurryTriggered=false; hurryScroll=-9999;
  levelNum=0; collectedItems=[false,false,false,false,false];
  shockwaves=[]; // Phase 3
  state='PLAYING'; buildLevel(0); musicTempo=1.0; stopMusic(); startMusic();
}
function resetAfterDeath(){
  player=makePlayer();
  cats=CAT_SPAWNS.map(s=>makeCat(s.x,s.floor,s.color,s.big));
  catRespawnTimers=[0,0,0];
  trampolines.forEach(t=>{ t.state=0; t.broken=false; });
  state='PLAYING'; player.invincibleTimer=200;
}
function triggerDeath(){
  if(state==='DEAD')return;
  lives--; sfx.lifeLost(); sfx.caught(); state='DEAD'; deathTimer=100;
}
function spawnShockwave(door){
  // Emit two shockwaves from the door: one left, one right along the floor
  const cx = door.x + door.w/2;
  const floor = door.floor;
  shockwaves.push({floor, x:cx, dir:-1, speed:5, life:160, maxLife:160});
  shockwaves.push({floor, x:cx, dir: 1, speed:5, life:160, maxLife:160});
}
function sweepCatOffScreen(cat, idx, dir){
  // Give the cat a high horizontal velocity so it visually slides off-screen
  cat.swept     = true;       // new flag: cat is being swept
  cat.sweptDir  = dir;
  cat.sweptSpeed= 9 + Math.random()*4; // fast sliding speed
  cat.alive     = false;
  cat.dead      = true;
  cat.deadTimer = 120;        // enough time to slide off-screen
  catRespawnTimers[idx] = 300; // 5 seconds
  sfx.catDie();
  score += 100;
}
function killCat(cat,idx){
  cat.dead=true; cat.alive=false; cat.deadTimer=150;
  sfx.catDie(); score+=100; catRespawnTimers[idx]=280;
}
