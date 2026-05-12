// =============================================================================
// main.js  —  Main render() function + game loop bootstrap
// =============================================================================

// ── RENDER ─────────────────────────────────────────────────────────────────
function render(){
  ctx.clearRect(0,0,W,H);

  if(state==='TITLE'){ drawTitle(); return; }
  if(state==='GAMEOVER'){ drawBackground(); drawHUD(); drawGameOver(); return; }

  drawBackground();
  trampolines.forEach(drawTrampoline);
  doors.forEach(drawDoor);
  items.forEach(drawItem);
  drawShockwaves(); // Phase 3

  cats.forEach(cat=>{
    if(cat.dead&&cat.deadTimer<=0) return;
    const flash=cat.stunTimer>0&&Math.floor(frameCount/4)%2===0;
    ctx.globalAlpha=flash?0.4:1;
    if(cat.dead){
      if(cat.swept){
        // Swept cat: draw sliding sideways, slightly tilted
        ctx.save();
        const cx=cat.x+cat.w/2, cy=cat.y+cat.h/2;
        ctx.translate(cx,cy);
        // Tilt in direction of travel, increases as it speeds up
        const tilt=(cat.sweptDir>0?1:-1)*Math.min(0.6, cat.sweptSpeed/16*0.6);
        ctx.rotate(tilt);
        ctx.translate(-cat.w/2,-cat.h/2);
        ctx.globalAlpha=Math.min(ctx.globalAlpha, cat.deadTimer/60); // fade out near end
        drawCat(0,0,cat.sweptDir>0?1:-1,1,cat.color,cat.big);
        ctx.restore();
      } else {
        // Normal door-killed cat: falls over
        ctx.save();
        const cx=cat.x+cat.w/2, cy=cat.y+cat.h;
        ctx.translate(cx,cy);
        ctx.rotate(Math.PI/2*(cat.facing>=0?1:-1));
        ctx.translate(-(cat.big?14:10),-(cat.big?28:22));
        drawCat(0,0,1,0,cat.color,cat.big);
        ctx.restore();
      }
    } else if(cat.big && cat.signTimer>0){
      drawCatSignRaise(cat.x, cat.y, cat.facing, cat.color, cat.signTimer);
    } else if(cat.big && cat.hiding){
      const tgt=items[cat.hideTarget];
      const peekY=tgt ? FLOOR_Y[tgt.floor]-16 : cat.y;
      drawCatHeadPeek(cat.x, peekY, cat.facing, cat.color);
    } else {
      drawCat(cat.x,cat.y,cat.facing,cat.walkFrame,cat.color,cat.big);
    }
    ctx.globalAlpha=1;
  });

  if(player.alive) drawMappy(player.x,player.y,player.facing,player.walkFrame,player.invincibleTimer>0);

  if(state==='DEAD'&&Math.floor(frameCount/5)%2===0){
    ctx.fillStyle='rgba(255,0,0,0.18)'; ctx.fillRect(0,0,W,H);
  }

  drawHUD();
  drawHurryScroll();
  if(state==='WIN') drawWin();
  if(state==='PAUSED') drawPaused();
}

function drawPaused(){
  ctx.fillStyle='rgba(0,0,20,0.6)'; ctx.fillRect(0,0,W,H);
  ctx.textAlign='center';
  ctx.font='bold 56px monospace'; ctx.fillStyle='#F8D020';
  ctx.fillText('PAUSED',W/2,H/2-10);
  ctx.font='bold 16px monospace'; ctx.fillStyle='#AAA';
  ctx.fillText('PRESS P TO RESUME',W/2,H/2+28);
  ctx.textAlign='left';
}
let lastTs=0;
function loop(ts){
  if(lastTs===0) lastTs=ts;
  const dtMs=Math.min(ts-lastTs,100);
  lastTs=ts;
  update(dtMs/1000);
  render();
  requestAnimationFrame(loop);
}

buildLevel(0);
requestAnimationFrame(ts=>{ lastTs=ts; loop(ts); });
