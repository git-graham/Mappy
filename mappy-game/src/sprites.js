// =============================================================================
// sprites.js  —  drawMappy, drawCat, drawCatHeadPeek, drawCatSignRaise,
//                drawDoor, drawItem, drawTrampoline, drawShockwave
// =============================================================================

// ── SPRITES ────────────────────────────────────────────────────────────────
function drawMappy(x,y,facing,frame,invinc){
  if(invinc && Math.floor(frameCount/5)%2===1) return;
  x=Math.floor(x); y=Math.floor(y);
  ctx.save();
  if(facing<0){ ctx.translate(x+18,y); ctx.scale(-1,1); ctx.translate(-x,-y); }

  // Hat
  ctx.fillStyle=PAL.hatBlue; ctx.fillRect(x+2,y,14,5); ctx.fillRect(x,y+5,18,6);
  ctx.fillStyle=PAL.hudYellow; ctx.fillRect(x+7,y+2,4,4); // badge
  // Head
  ctx.fillStyle=PAL.mouseGray; ctx.fillRect(x+2,y+11,14,10);
  // Ears
  ctx.fillStyle=PAL.mouseEar; ctx.fillRect(x,y+8,5,6); ctx.fillRect(x+13,y+8,5,6);
  // Eyes
  ctx.fillStyle='#000'; ctx.fillRect(x+4,y+13,3,3); ctx.fillRect(x+11,y+13,3,3);
  ctx.fillStyle='#FFF'; ctx.fillRect(x+4,y+13,1,1); ctx.fillRect(x+11,y+13,1,1);
  // Nose
  ctx.fillStyle=PAL.mousePink; ctx.fillRect(x+8,y+18,3,3);
  // Body (uniform)
  ctx.fillStyle=PAL.uniformBlue; ctx.fillRect(x+2,y+21,14,10);
  // Belt
  ctx.fillStyle=PAL.beltBrown; ctx.fillRect(x+2,y+25,14,3);
  ctx.fillStyle=PAL.hudYellow; ctx.fillRect(x+8,y+25,3,3); // buckle
  // Legs
  const lf=[[0,6,0,6],[3,6,3,6],[6,3,6,3],[3,0,3,0]][frame]||[0,6,0,6];
  ctx.fillStyle=PAL.uniformBlue;
  ctx.fillRect(x+3, y+31, 5, lf[1]?6:3);
  ctx.fillRect(x+10,y+31, 5, lf[3]?6:3);
  // Shoes
  ctx.fillStyle=PAL.shoeBlack;
  ctx.fillRect(x+2, y+31+(lf[1]||0), 6, 3);
  ctx.fillRect(x+9, y+31+(lf[3]||0), 6, 3);
  // Tail
  ctx.fillStyle=PAL.mouseGray;
  ctx.fillRect(x-5,y+22,5,3); ctx.fillRect(x-8,y+19,4,4);

  ctx.restore();
}

function drawCat(x,y,facing,frame,color,big){
  x=Math.floor(x); y=Math.floor(y);
  const sc=big?1.4:1;
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(sc,sc);
  if(facing<0){ ctx.translate(20,0); ctx.scale(-1,1); }

  // Body
  ctx.fillStyle=color; ctx.fillRect(2,10,16,14);
  // Head
  ctx.fillRect(2,2,16,10);
  // Ears
  ctx.fillRect(0,0,6,6); ctx.fillRect(14,0,6,6);
  ctx.fillStyle='#FF9090'; ctx.fillRect(1,1,3,3); ctx.fillRect(16,1,3,3);
  // Eyes
  ctx.fillStyle=PAL.catEyeGreen; ctx.fillRect(4,4,5,5); ctx.fillRect(11,4,5,5);
  ctx.fillStyle='#000'; ctx.fillRect(5,5,3,4); ctx.fillRect(12,5,3,4);
  ctx.fillStyle='#FFF'; ctx.fillRect(5,5,1,1); ctx.fillRect(12,5,1,1);
  // Nose / mouth
  ctx.fillStyle='#E04060'; ctx.fillRect(8,10,4,3);
  // Whiskers
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.fillRect(0,10,6,1); ctx.fillRect(14,10,6,1);
  ctx.fillRect(0,12,5,1); ctx.fillRect(15,12,5,1);
  // Legs
  ctx.fillStyle=color;
  const l2=frame%2===0;
  ctx.fillRect(3,22,5,l2?8:5); ctx.fillRect(12,22,5,l2?5:8);
  // Tail
  ctx.fillRect(18,12,5,8); ctx.fillRect(22,9,5,6);

  ctx.restore();
}

function drawCatHeadPeek(x, y, facing, color){
  // Only the head and ears poke out above the platform/item edge
  // The big cat scale is 1.4, so we draw in unscaled coords then scale
  x=Math.floor(x); y=Math.floor(y);
  const sc=1.4;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  if(facing<0){ ctx.translate(20,0); ctx.scale(-1,1); }
  // Ears
  ctx.fillStyle=color;
  ctx.fillRect(0,0,6,6); ctx.fillRect(14,0,6,6);
  ctx.fillStyle='#FF9090'; ctx.fillRect(1,1,3,3); ctx.fillRect(16,1,3,3);
  // Head
  ctx.fillStyle=color; ctx.fillRect(2,2,16,10);
  // Eyes (shifty — looking sideways)
  ctx.fillStyle=PAL.catEyeGreen; ctx.fillRect(4,4,5,5); ctx.fillRect(11,4,5,5);
  ctx.fillStyle='#000'; ctx.fillRect(6,5,3,4); ctx.fillRect(13,5,3,4); // pupils shifted right
  ctx.fillStyle='#FFF'; ctx.fillRect(6,5,1,1); ctx.fillRect(13,5,1,1);
  // Nose
  ctx.fillStyle='#E04060'; ctx.fillRect(8,10,4,3);
  // Whiskers
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.fillRect(0,10,6,1); ctx.fillRect(14,10,6,1);
  ctx.restore();
}

function drawCatSignRaise(x, y, facing, color, timer){
  // Full cat body + one arm raised holding a sign. Fades out last 60 frames.
  const alpha=Math.min(1, timer/60);
  x=Math.floor(x); y=Math.floor(y);
  const sc=1.4;
  ctx.save();
  ctx.globalAlpha=alpha;
  ctx.translate(x, y);
  ctx.scale(sc, sc);
  if(facing<0){ ctx.translate(20,0); ctx.scale(-1,1); }

  // Body
  ctx.fillStyle=color; ctx.fillRect(2,10,16,14);
  // Head
  ctx.fillRect(2,2,16,10);
  // Ears
  ctx.fillRect(0,0,6,6); ctx.fillRect(14,0,6,6);
  ctx.fillStyle='#FF9090'; ctx.fillRect(1,1,3,3); ctx.fillRect(16,1,3,3);
  // Eyes (happy / triumphant)
  ctx.fillStyle=PAL.catEyeGreen; ctx.fillRect(4,4,5,5); ctx.fillRect(11,4,5,5);
  ctx.fillStyle='#000'; ctx.fillRect(5,5,3,4); ctx.fillRect(12,5,3,4);
  ctx.fillStyle='#FFF'; ctx.fillRect(5,5,1,1); ctx.fillRect(12,5,1,1);
  // Nose
  ctx.fillStyle='#E04060'; ctx.fillRect(8,10,4,3);
  // Whiskers
  ctx.fillStyle='rgba(255,255,255,0.7)';
  ctx.fillRect(0,10,6,1); ctx.fillRect(14,10,6,1);
  ctx.fillRect(0,12,5,1); ctx.fillRect(15,12,5,1);
  // Legs (standing still)
  ctx.fillStyle=color;
  ctx.fillRect(3,22,5,8); ctx.fillRect(12,22,5,8);
  // Tail
  ctx.fillRect(18,12,5,8); ctx.fillRect(22,9,5,6);

  // Raised arm (left arm up, holding sign above head)
  ctx.fillStyle=color;
  ctx.fillRect(-2,2,5,6);   // upper arm reaching up
  ctx.fillRect(-4,-6,5,10); // forearm
  ctx.fillRect(-4,-8,5,4);  // paw/hand

  // Sign held in raised paw
  const sw=38, sh=16;
  const signX=-4-sw+2, signY=-22;
  ctx.fillStyle='#F8F0C0'; ctx.fillRect(signX, signY, sw, sh);
  ctx.fillStyle='#C08020';
  ctx.fillRect(signX, signY, sw, 2);        // top border
  ctx.fillRect(signX, signY+sh-2, sw, 2);   // bottom border
  ctx.fillRect(signX, signY, 2, sh);        // left border
  ctx.fillRect(signX+sw-2, signY, 2, sh);   // right border
  ctx.fillStyle='#C01010';
  ctx.font='bold 9px monospace';
  ctx.textAlign='center';
  ctx.fillText('+1000!', signX+sw/2, signY+sh-4);
  ctx.textAlign='left';

  ctx.restore();
}

function drawTrampoline(t){
  if(t.broken){
    if(t.breakAnim>0){ ctx.fillStyle='#505050'; ctx.fillRect(t.x,t.y+3,t.w,t.h-6); }
    return;
  }
  const b=t.bounceAnim>0?3:0;
  // Frame posts
  ctx.fillStyle=PAL.trampFrame;
  ctx.fillRect(t.x,   t.y+b, 8, t.h-b);
  ctx.fillRect(t.x+t.w-8,t.y+b,8,t.h-b);
  // Spring coils
  ctx.fillStyle='#806040';
  ctx.fillRect(t.x+2,t.y+b+2,4,t.h-b-4);
  ctx.fillRect(t.x+t.w-6,t.y+b+2,4,t.h-b-4);
  // Mat
  const col=TRAMP_COLORS[Math.min(t.state,3)];
  ctx.fillStyle=col; ctx.fillRect(t.x+8,t.y+3+b,t.w-16,t.h-6-b);
  // Shine
  ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.fillRect(t.x+8,t.y+3+b,t.w-16,3);
}

function drawDoor(d){
  const y=Math.floor(d.y);

  // ── Special door rendering ──
  if(d.special && !d.used){
    const flashOn = Math.floor(frameCount/10)%2===0;
    const baseCol  = flashOn ? '#FF8800' : '#FF6600';
    const trimCol  = flashOn ? '#FFCC00' : '#CC8800';
    const glowAlpha= flashOn ? 0.35 : 0.15;

    if(d.open){
      // Open special door: wider, orange, ornate
      ctx.fillStyle=baseCol; ctx.fillRect(d.x,y,d.w+28,d.h);
      ctx.fillStyle=trimCol;
      ctx.fillRect(d.x,y,d.w+28,4);
      ctx.fillRect(d.x,y,4,d.h);
      ctx.fillRect(d.x+d.w+24,y,4,d.h);
      ctx.fillRect(d.x,y+d.h-4,d.w+28,4);
      // Inner panel with lightning bolt decoration
      ctx.fillStyle='#FF4400'; ctx.fillRect(d.x+5,y+5,d.w+18,d.h-10);
      ctx.fillStyle=trimCol; ctx.fillRect(d.x+8,y+8,d.w+12,d.h-16);
      // Knob — golden
      ctx.fillStyle='#FFE050'; ctx.fillRect(d.x+d.w+14,y+(d.h/2|0)-4,7,7);
      ctx.fillStyle='#C8A820'; ctx.fillRect(d.x+d.w+15,y+(d.h/2|0)-3,5,5);
      // Glow
      ctx.fillStyle=`rgba(255,150,0,${glowAlpha})`;
      ctx.fillRect(d.x-4,y-4,d.w+36,d.h+8);
    } else {
      // Closed special door: thicker edge-on
      const ex=d.x+(d.w/2|0);
      ctx.fillStyle='#CC4400'; ctx.fillRect(ex,y,8,d.h);
      ctx.fillStyle=baseCol;   ctx.fillRect(ex,y,8,4);
      ctx.fillStyle='#882200'; ctx.fillRect(ex,y+d.h-4,8,4);
      ctx.fillStyle=trimCol;
      ctx.fillRect(ex+1,y+4,6,d.h-8);
      // Knob dot
      ctx.fillStyle='#FFE050'; ctx.fillRect(ex+2,y+(d.h/2|0)-3,4,6);
      // Glow aura
      ctx.fillStyle=`rgba(255,150,0,${glowAlpha})`;
      ctx.fillRect(ex-3,y-3,14,d.h+6);
    }
    return;
  }

  // ── Regular door (or used special door — looks regular) ──
  if(d.open){
    // Open: full front face
    ctx.fillStyle='#C08040'; ctx.fillRect(d.x,y,d.w+20,d.h);
    ctx.fillStyle='#A06030';
    ctx.fillRect(d.x,y,d.w+20,3);
    ctx.fillRect(d.x,y,3,d.h);
    ctx.fillRect(d.x+d.w+17,y,3,d.h);
    ctx.fillRect(d.x,y+d.h-3,d.w+20,3);
    ctx.fillStyle='#B07030';
    ctx.fillRect(d.x+4,y+4,d.w+12,d.h-8);
    // Knob
    ctx.fillStyle='#F8D040'; ctx.fillRect(d.x+d.w+8,y+(d.h/2|0)-3,6,6);
    ctx.fillStyle='#C0A020'; ctx.fillRect(d.x+d.w+9,y+(d.h/2|0)-2,4,4);
  } else {
    // Closed: thin edge-on view
    const ex=d.x+(d.w/2|0);
    ctx.fillStyle='#8A5020'; ctx.fillRect(ex,y,5,d.h);
    ctx.fillStyle='#C08040'; ctx.fillRect(ex,y,5,3);
    ctx.fillStyle='#602010'; ctx.fillRect(ex,y+d.h-3,5,3);
    // Knob dot
    ctx.fillStyle='#F8D040'; ctx.fillRect(ex+1,y+(d.h/2|0)-2,3,4);
  }
}

function drawItem(it){
  if(it.collected) return;
  const bob=(Math.sin(it.bobAnim)*3)|0;
  const ix=Math.floor(it.x), iy=Math.floor(it.y+bob);
  const w=it.w, h=it.h;
  // Use custom sprite image if loaded, otherwise fall back to canvas drawing
  const img=ITEM_SPRITES[it.label];
  if(img && img.complete && img.naturalWidth>0){
    ctx.drawImage(img, ix, iy, w, h);
    return;
  }
  // ── Fallback canvas sprites (shown before images load) ──
  if(it.label==='MONA'){
    ctx.fillStyle='#C08840'; ctx.fillRect(ix,iy,w,h);
    ctx.fillStyle='#E8C060'; ctx.fillRect(ix+2,iy+2,w-4,h-4);
    ctx.fillStyle='#907050'; ctx.fillRect(ix+4,iy+4,w-8,h-8);
    ctx.fillStyle='#705040'; ctx.fillRect(ix+7,iy+6,5,8);
    ctx.fillStyle='#604030'; ctx.fillRect(ix+5,iy+6,3,3);
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(ix+2,iy+h-4,w-2,2);
  } else if(it.label==='RADIO'){
    ctx.fillStyle='#202020'; ctx.fillRect(ix,iy+4,w,h-4);
    ctx.fillStyle='#383838'; ctx.fillRect(ix+2,iy,w-4,8);
    ctx.fillStyle='#4090D0'; ctx.fillRect(ix+2,iy+8,10,10);
    ctx.fillStyle='#70B0E0'; ctx.fillRect(ix+3,iy+9,4,4);
    ctx.fillStyle='#D08020'; ctx.fillRect(ix+13,iy+8,8,8);
    ctx.fillStyle='#F0F000'; ctx.fillRect(ix+3,iy+20,4,2);
    ctx.fillStyle='#C0C0C0'; ctx.fillRect(ix+10,iy+19,5,4);
    ctx.fillStyle='#606060'; ctx.fillRect(ix+20,iy,2,8);
  } else if(it.label==='SAFE'){
    ctx.fillStyle='#606060'; ctx.fillRect(ix,iy,w,h);
    ctx.fillStyle='#808080'; ctx.fillRect(ix+2,iy+2,w-4,h-4);
    ctx.fillStyle='#A0A0A0'; ctx.fillRect(ix+4,iy+4,w-8,w-8);
    ctx.fillStyle='#C0C0C0'; ctx.fillRect(ix+8,iy+8,8,8);
    ctx.fillStyle='#505050'; ctx.fillRect(ix+10,iy+10,4,4);
    ctx.fillStyle='#F0D020'; ctx.fillRect(ix+w-6,iy+h/2-3,5,6);
    ctx.fillStyle='#C0A010'; ctx.fillRect(ix+w-5,iy+h/2-2,3,4);
  } else if(it.label==='PC'){
    ctx.fillStyle='#C0C8D0'; ctx.fillRect(ix,iy,w,h-6);
    ctx.fillStyle='#6090C8'; ctx.fillRect(ix+2,iy+2,w-4,h-14);
    ctx.fillStyle='#D8F0FF'; ctx.fillRect(ix+3,iy+3,w-6,h-16);
    ctx.fillStyle='#20A020';
    for(let r=0;r<3;r++) ctx.fillRect(ix+4,iy+5+r*4,w-10,2);
    ctx.fillStyle='#A0B0B8'; ctx.fillRect(ix+5,iy+h-7,w-10,4);
    ctx.fillStyle='#C0C8D0'; ctx.fillRect(ix+2,iy+h-4,w-4,4);
  } else if(it.label==='TV'){
    ctx.fillStyle='#9090A0'; ctx.fillRect(ix,iy,w,h-4);
    ctx.fillStyle='#202050'; ctx.fillRect(ix+2,iy+2,w-8,h-10);
    ctx.fillStyle='#6080D0'; ctx.fillRect(ix+3,iy+3,w-10,h-13);
    ctx.fillStyle='#90D090'; ctx.fillRect(ix+4,iy+5,w-14,3);
    ctx.fillStyle='#9090E0'; ctx.fillRect(ix+4,iy+10,w-14,3);
    ctx.fillStyle='#C0C0C0'; ctx.fillRect(ix+w-5,iy+4,3,4); ctx.fillRect(ix+w-5,iy+10,3,4);
    ctx.fillStyle='#808090'; ctx.fillRect(ix+3,iy+h-4,5,4); ctx.fillRect(ix+w-8,iy+h-4,5,4);
  }
}

// ── PHASE 3: SHOCKWAVE DRAWING ────────────────────────────────────────────
function drawShockwaves(){
  for(const sw of shockwaves){
    const t = sw.life / sw.maxLife; // 1.0 = fresh, 0.0 = dying
    const alpha = Math.min(1, t * 2.5); // fade in fast, fade out slow
    const floorY = FLOOR_Y[sw.floor];

    // Shockwave arc — drawn on the platform surface
    const h = 24 + (1-t)*8; // height of arc
    const w = 18 + (1-t)*6;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Outer glow
    ctx.fillStyle = '#FF8800';
    ctx.fillRect(sw.x - w/2 - 2, floorY - h - 4, w + 4, h + 4);

    // Main arc body
    ctx.fillStyle = '#FFCC00';
    ctx.fillRect(sw.x - w/2, floorY - h, w, 4);     // top bar
    ctx.fillRect(sw.x - w/2, floorY - h, 3, h);      // left side
    ctx.fillRect(sw.x + w/2 - 3, floorY - h, 3, h);  // right side

    // Spark trail
    ctx.fillStyle = '#FFFFFF';
    const trailX = sw.x - sw.dir * 8;
    ctx.fillRect(trailX - 2, floorY - 8, 4, 4);
    ctx.fillRect(trailX - sw.dir*6 - 2, floorY - 4, 3, 3);

    ctx.restore();
  }
}
