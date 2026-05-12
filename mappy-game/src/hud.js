// =============================================================================
// hud.js  —  drawHUD, drawHurryScroll, drawTitle, drawGameOver, drawWin, drawPaused
// =============================================================================

// ── HUD ────────────────────────────────────────────────────────────────────
function drawHUD(){
  // Top bar
  ctx.fillStyle=PAL.hudBg; ctx.fillRect(0,0,W,32);
  // Lives — mini mouse heads
  ctx.font='bold 14px monospace'; ctx.fillStyle='#FFF';
  ctx.fillText('LIVES:',8,20);
  for(let i=0;i<3;i++){
    const lx=74+i*26;
    if(i<lives){
      ctx.fillStyle=PAL.mouseGray; ctx.fillRect(lx,6,18,14);
      ctx.fillStyle=PAL.hatBlue;   ctx.fillRect(lx+1,4,16,6);
      ctx.fillStyle='#000'; ctx.fillRect(lx+4,11,3,3); ctx.fillRect(lx+11,11,3,3);
    } else {
      ctx.fillStyle='#333'; ctx.fillRect(lx,6,18,14);
    }
  }
  // Timer
  const ts=String(Math.ceil(timer)).padStart(2,'0');
  ctx.fillStyle=timer<30?PAL.hudRed:'#FFF';
  ctx.font='bold 18px monospace';
  ctx.fillText('TIME:'+ts, W/2-46, 22);
  // Score
  ctx.fillStyle=PAL.hudYellow;
  ctx.fillText('SCORE:'+score, W-150, 22);
  // Level
  ctx.fillStyle=PAL.hudBlue;
  ctx.fillText('LV'+(levelNum+1), W-230, 22);

  // Bottom item bar
  ctx.fillStyle=PAL.itemBar; ctx.fillRect(0,H-28,W,28);
  const labels=['MONA','RADIO','SAFE','PC','TV'];
  const icols=['#8040C0','#E07020','#808080','#20A090','#D0C000'];
  for(let i=0;i<5;i++){
    const bx=8+i*125;
    const got=items[i]&&items[i].collected;
    ctx.fillStyle=got?icols[i]:'#1A1A2A'; ctx.fillRect(bx,H-26,118,24);
    ctx.fillStyle=got?'#FFF':'#555';
    ctx.font='bold 11px monospace';
    ctx.fillText(labels[i],bx+6,H-10);
  }
}

// ── HURRY SCROLL ───────────────────────────────────────────────────────────
function drawHurryScroll(){
  if(hurryScroll<-200) return;
  ctx.font='bold 48px monospace';
  ctx.fillStyle=PAL.hudRed;
  ctx.fillText('HURRY!', hurryScroll, H/2+16);
}

// ── SCREENS ────────────────────────────────────────────────────────────────
function drawTitle(){
  ctx.fillStyle='#080410'; ctx.fillRect(0,0,W,H);
  // Stars
  for(let i=0;i<80;i++){
    const sx=(i*149+53)%W, sy=(i*97+21)%(H*0.65)|0;
    ctx.fillStyle=i%3===0?'#FFF':'#888';
    ctx.fillRect(sx,sy,(i%2)+1,(i%2)+1);
  }
  // Title box
  ctx.fillStyle='#C83020'; ctx.fillRect(100,80,440,80);
  ctx.fillStyle='#080410'; ctx.fillRect(104,84,432,72);
  ctx.font='bold 64px monospace'; ctx.fillStyle='#F8D020';
  ctx.textAlign='center'; ctx.fillText('MAPPY',W/2,148);
  ctx.font='bold 20px monospace'; ctx.fillStyle='#60A8E0';
  ctx.fillText('POLICE MOUSE',W/2,190);
  // Animated Mappy
  drawMappy(W/2-9,210+((Math.sin(frameCount*0.05)*4)|0),1,Math.floor(frameCount/8)%4,false);
  // Blink prompt
  if(Math.floor(frameCount/25)%2===0){
    ctx.font='bold 18px monospace'; ctx.fillStyle='#FFF';
    ctx.fillText('PRESS SPACE TO START',W/2,310);
  }
  ctx.font='12px monospace'; ctx.fillStyle='#A0A8B0';
  ctx.fillText('← → MOVE   SPACE: DOOR   P: PAUSE   K: RESTART',W/2,340);
  ctx.fillText('WALK OVER TRAMPOLINES TO BOUNCE UP',W/2,360);
  ctx.fillText('GREEN → BLUE → YELLOW → RED → BREAK!',W/2,380);
  ctx.fillStyle='#FF8800';
  ctx.fillText('ORANGE DOORS = SHOCKWAVE! SWEEPS ALL CATS ON FLOOR',W/2,400);
  ctx.textAlign='left';
}

function drawGameOver(){
  ctx.fillStyle='rgba(0,0,0,0.75)'; ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.font='bold 64px monospace'; ctx.fillStyle='#E02020';
  ctx.fillText('GAME OVER',W/2,H/2-10);
  ctx.font='bold 22px monospace'; ctx.fillStyle='#FFF';
  ctx.fillText('SCORE: '+score,W/2,H/2+36);
  if(Math.floor(frameCount/25)%2===0){
    ctx.font='16px monospace'; ctx.fillStyle='#888';
    ctx.fillText('PRESS SPACE TO RETRY',W/2,H/2+70);
  }
  ctx.textAlign='left';
}

function drawWin(){
  ctx.fillStyle='rgba(0,0,20,0.85)'; ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.font='bold 52px monospace'; ctx.fillStyle='#F8D020';
  ctx.fillText('LEVEL CLEAR!',W/2,H/2-20);
  ctx.font='bold 24px monospace'; ctx.fillStyle='#20D020';
  ctx.fillText('+'+Math.floor(timer)*10+' TIME BONUS!',W/2,H/2+24);
  ctx.font='bold 20px monospace'; ctx.fillStyle='#60A8E0';
  ctx.fillText('SCORE: '+score,W/2,H/2+58);
  ctx.textAlign='left';
}
