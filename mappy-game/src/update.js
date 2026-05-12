// =============================================================================
// update.js  —  Main update() loop: player, shockwaves, cat AI, doors, items
// =============================================================================

// ── UPDATE ─────────────────────────────────────────────────────────────────
function update(dtSec){
  frameCount++;

  if(state==='DEAD'){
    deathTimer--;
    if(deathTimer<=0){ if(lives<=0){state='GAMEOVER';stopMusic();}else resetAfterDeath(); }
    return;
  }
  if(state==='WIN'){
    winTimer--;
    if(winTimer<=0){
      levelNum++; collectedItems=[false,false,false,false,false];
      timer=90; hurryTriggered=false; hurryScroll=-9999; musicTempo=1.0;
      stopMusic(); buildLevel(levelNum); state='PLAYING'; startMusic();
    }
    return;
  }
  if(state!=='PLAYING'&&state!=='HURRY') return;

  // Timer
  timer-=dtSec;
  if(timer<=0){ timer=0; triggerDeath(); return; }

  if(!hurryTriggered&&timer<=30){
    hurryTriggered=true; hurryScroll=W+60; musicTempo=1.5; sfx.hurry();
  }
  if(hurryScroll>-300) hurryScroll-=2.5;

  const didSpace=spacePressed; spacePressed=false;

  // ── Player ──
  const p=player;
  if(p.invincibleTimer>0) p.invincibleTimer--;

  p.vx=0;
  if(keys['ArrowLeft'])  { p.vx=-WALK_SPD; p.facing=-1; }
  if(keys['ArrowRight']) { p.vx= WALK_SPD; p.facing= 1; }

  // While rising in tramp channel, vx is only used as an exit intent signal —
  // resolveEntity reads it but horizontal position is locked to the channel.
  // We still set facing so Mappy turns to face the exit direction.

  if(p.onGround && Math.abs(p.vx)>0.05){
    p.walkTimer++; if(p.walkTimer>6){p.walkTimer=0;p.walkFrame=(p.walkFrame+1)%4;}
  } else if(p.onGround){ p.walkFrame=0; p.walkTimer=0; }

  p.onTramp=-1;
  resolveEntity(p);

  // Trampoline contact (walk-on or fall-on)
  // Only triggers when NOT already in channel mode, and NOT holding a direction
  // (holding a direction on ground means walk past; let go to jump)
  if(!p._fromTramp && !p._fallingToTramp){
    for(let i=0;i<trampolines.length;i++){
      const t=trampolines[i];
      if(t.broken) continue;
      const foot=p.y+p.h;
      const cx=p.x+p.w/2;
      if(cx>=t.x && cx<=t.x+t.w && foot>=t.y && foot<=t.y+t.h+8 && p.vy>=0){
        // Only launch if player is NOT holding a direction (standing on tramp)
        if(p.vx === 0){
          t.bounceAnim=6; sfx.bounce();
          if(t.state>=3){
            t.broken=true; t.breakAnim=25; sfx.trampBreak(); triggerDeath();
          } else {
            t.state++;
            p.y=t.y-p.h; p.vy=0; p.onGround=false; p.onTramp=i;
            p._fromTramp=true; p._trampIdx=i; p._launchFloor=0; p._exitDir=0;
          }
        }
        break;
      }
    }
  }

  // Reset tramp if landed on upper platform after using it
  if(p.onGround && p.lastTramp>=0){
    const fi=getFloorAt(p);
    if(fi>0){ trampolines[p.lastTramp].state=0; p.lastTramp=-1; }
  }
  if(p.onTramp>=0) p.lastTramp=p.onTramp;

  // Door interaction
  if(didSpace){
    for(const d of doors){
      const dx=d.x+d.w/2, px2=p.x+p.w/2;
      if(Math.abs(px2-dx)<32 && Math.abs(p.y-(d.y))<44){
        if(!d.open){
          d.open=true; sfx.door();
          if(d.special && !d.used){
            // ── Special door: shockwave + sweep cats ──
            d.used = true;
            spawnShockwave(d);
            // Convert to regular door after use (visual only)
          } else {
            // Regular door: knock out adjacent cats on same floor
            cats.forEach((cat,ci)=>{
              if(cat.alive && cat.floor===d.floor && Math.abs(cat.x-d.x)<50) killCat(cat,ci);
            });
          }
          score+=50;
        } else {
          d.open=false; sfx.door();
        }
        break;
      }
    }
  }

  // ── Phase 3: Update shockwaves ──
  for(let si=shockwaves.length-1; si>=0; si--){
    const sw=shockwaves[si];
    sw.x += sw.dir * sw.speed;
    sw.life--;
    if(sw.life<=0 || sw.x<WALL_L-40 || sw.x>WALL_R+40){
      shockwaves.splice(si,1); continue;
    }
    // Check all living cats — shockwave keeps going through all of them
    if(!sw.hitCats) sw.hitCats = new Set();
    cats.forEach((cat,ci)=>{
      if(!cat.alive) return;
      if(sw.hitCats.has(ci)) return; // already swept this cat

      const catFloor = getFloorAt(cat);
      const onSameFloor = catFloor === sw.floor;

      // Cat in tramp channel: only hit if cat's current height matches the shockwave's floor
      let inChannelOnFloor = false;
      if(cat._fromTramp || cat._fallingToTramp){
        const ti = cat._trampIdx;
        if(ti >= 0){
          const tramp = trampolines[ti];
          const catCol = tramp.cx;
          const crossesCol =
            (sw.dir > 0 && sw.x >= catCol - cat.w && sw.x <= catCol + cat.w) ||
            (sw.dir < 0 && sw.x <= catCol + cat.w && sw.x >= catCol - cat.w);
          if(crossesCol){
            const catFoot   = cat.y + cat.h;
            const floorY    = FLOOR_Y[sw.floor];
            const tolerance = RISE_SPD * 4;
            inChannelOnFloor = Math.abs(catFoot - floorY) <= tolerance;
          }
        }
      }

      if(!onSameFloor && !inChannelOnFloor) return;

      // Hit when shockwave front overlaps the cat's body (or tramp column for channel cats)
      const hit = onSameFloor
        ? (sw.dir>0 && sw.x >= cat.x && sw.x <= cat.x+cat.w+4) ||
          (sw.dir<0 && sw.x <= cat.x+cat.w && sw.x >= cat.x-4)
        : inChannelOnFloor; // column overlap already confirmed above

      if(hit){
        sw.hitCats.add(ci);
        cat._fromTramp = false; cat._fallingToTramp = false; cat._trampIdx = -1;
        sweepCatOffScreen(cat, ci, sw.dir);
      }
    });
  }

  // ── Phase 3: Advance swept cats off-screen ──
  cats.forEach((cat)=>{
    if(cat.swept && cat.dead && cat.deadTimer>0){
      cat.x += cat.sweptDir * cat.sweptSpeed;
      // Gradually speed up for a satisfying slide
      cat.sweptSpeed = Math.min(cat.sweptSpeed + 0.3, 16);
    }
  });

  // ── Phase 3: Cat-openable doors ──
  // Cats can open regular (non-special, non-used) doors they walk into
  cats.forEach((cat)=>{
    if(!cat.alive || cat._fromTramp || cat._fallingToTramp) return;
    const catCx=cat.x+cat.w/2;
    for(const d of doors){
      if(d.special) continue; // cats can't open special doors
      if(d.open) continue;    // already open
      // Cat is on same floor as door and walks into it
      if(cat.floor !== d.floor) continue;
      const doorCx=d.x+d.w/2;
      if(Math.abs(catCx-doorCx)<20){
        // Cat opens the door briefly
        d.open=true;
        d.catOpenTimer=90; // auto-close after ~1.5 seconds
        sfx.door();
        break;
      }
    }
    // Tick down auto-close timers
    for(const d of doors){
      if(d.catOpenTimer>0){
        d.catOpenTimer--;
        if(d.catOpenTimer===0 && d.open) d.open=false;
      }
    }
  });

  // Item collection — check for big cat hiding bonus
  items.forEach((it,i)=>{
    if(!it.collected && rectsOverlap(p,it)){
      it.collected=true; collectedItems[i]=true;
      // Check if big cat is hiding behind this item
      const bigCat=cats.find(c=>c.big && c.hiding && c.hideTarget===i);
      if(bigCat){
        score+=1200; // 200 item + 1000 bonus
        bigCat.hiding=false; bigCat.hideTarget=-1;
        bigCat.signTimer=180; // show "1000!" sign for 3 seconds
        sfx.collect(); sfx.collect(); // double collect sound for bonus
      } else {
        score+=200; sfx.collect();
      }
    }
  });
  items.forEach(it=>it.bobAnim=(it.bobAnim+0.04)%(Math.PI*2));

  if(items.every(it=>it.collected)){
    sfx.fanfare(); stopMusic(); state='WIN'; winTimer=200; score+=Math.floor(timer)*10; return;
  }

  // Cat respawn
  catRespawnTimers.forEach((t,i)=>{
    if(t>0){
      catRespawnTimers[i]--;
      if(catRespawnTimers[i]===0){
        const s=CAT_SPAWNS[i];
        cats[i]=makeCat(s.x,s.floor,s.color,s.big);
      }
    }
  });

  // ── Cat AI ──
  cats.forEach((cat,ci)=>{
    if(cat.dead){ if(cat.deadTimer>0) cat.deadTimer--; return; }
    if(!cat.alive) return;
    if(cat.stunTimer>0){ cat.stunTimer--; return; }

    // ── Big cat hiding logic ──
    if(cat.big){
      // Tick down sign timer — cat stays frozen while holding sign
      if(cat.signTimer>0){ cat.signTimer--; cat.vx=0; cat.vy=0; return; }

      if(cat.hiding){
        // Stay locked behind the item, don't move
        cat.hideTimer--;
        const tgt=items[cat.hideTarget];
        if(tgt && !tgt.collected){
          // Hold position at item — no snap, cat walked here naturally
          cat.vx=0; cat.vy=0;
        }
        if(cat.hideTimer<=0 || !tgt || tgt.collected){
          cat.hiding=false; cat.hideTarget=-1;
        }
        return; // skip normal AI while hiding
      } else {
        // Hide only when the cat physically walks close to an uncollected item
        // (within 18px of item center), on the ground, not holding sign
        if(cat.onGround && cat.signTimer<=0){
          // Only hide when basically touching an uncollected item (~24px)
          const nearby=items
            .map((it,i)=>({it,i}))
            .filter(({it})=>{
              if(it.collected) return false;
              if(it.floor!==cat.floor) return false;
              const itemCx=it.x+it.w/2, catCx=cat.x+cat.w/2;
              return Math.abs(catCx-itemCx)<5;
            });
          // 12% chance per frame when touching an item — hides very often when close
          if(nearby.length>0 && Math.random()<0.12){
            const pick=nearby[Math.floor(Math.random()*nearby.length)];
            cat.hiding=true;
            cat.hideTarget=pick.i;
            cat.hideTimer=180;
          }
        }
      }
    }

    // Skip movement AI while cat is in channel (tramp rising or falling)
    if(!cat._fromTramp && !cat._fallingToTramp){
      // Chase if same floor
      const catFloorY=FLOOR_Y[cat.floor];
      const sameFloor=Math.abs(p.y+p.h-catFloorY)<12;
      if(sameFloor && Math.abs(p.x-cat.x)<200){
        const dir=Math.sign(p.x-cat.x); cat.vx=dir*(cat.big?1.2:1.6); cat.facing=dir;
      } else {
        cat.vx=cat.facing*(cat.big?1.0:1.3);
      }
      cat.walkTimer++; if(cat.walkTimer>8){cat.walkTimer=0;cat.walkFrame=(cat.walkFrame+1)%4;}
    } else {
      cat.vx=0; // locked in channel — no horizontal movement
    }

    resolveEntity(cat);

    // Cat trampoline bounce (cats bounce when walking over tramp, no state change)
    const cfoot=cat.y+cat.h, ccx=cat.x+cat.w/2;
    for(let ti=0; ti<trampolines.length; ti++){
      const t=trampolines[ti];
      if(t.broken) continue;
      if(ccx>=t.x && ccx<=t.x+t.w && cfoot>=t.y && cfoot<=t.y+t.h+8 && cat.vy>=0){
        cat.y=t.y-cat.h; cat.vy=0; cat.onGround=false; t.bounceAnim=4;
        cat._fromTramp=true; cat._trampIdx=ti; cat._launchFloor=0; cat._exitDir=0;
        // Pick a random target floor (1-4) and direction to exit on
        cat._catTargetFloor = 1 + Math.floor(Math.random() * (FLOOR_Y.length - 1));
        cat._catExitDir = Math.random() < 0.5 ? 1 : -1;
        break;
      }
    }

    // Update floor
    const fi=getFloorAt(cat); if(fi>=0) cat.floor=fi;

    // Player collision — big cat safe while hiding OR holding sign
    const bigCatSafe = cat.big && (cat.hiding || cat.signTimer > 0);
    const mappyInChannel = p._fromTramp || p._fallingToTramp || p.onTramp >= 0;
    const catInChannel   = cat._fromTramp || cat._fallingToTramp;
    if(p.invincibleTimer<=0 && !mappyInChannel && !catInChannel && !bigCatSafe && rectsOverlap(p,cat)) triggerDeath();
  });

  trampolines.forEach(t=>{ if(t.bounceAnim>0)t.bounceAnim--; if(t.breakAnim>0)t.breakAnim--; });
}

// ── RENDER ─────────────────────────────────────────────────────────────────
function render(){
  ctx.clearRect(0,0,W,H);

  if(state==='TITLE'){ drawTitle(); return; }
  if(state==='GAMEOVER'){ drawBackground(); drawHUD(); drawGameOver(); return; }

  drawBackground();
  trampolines.forEach(drawTrampoline);
  doors.forEach(drawDoor);
  items.forEach(drawItem);

  cats.forEach(cat=>{
    if(cat.dead&&cat.deadTimer<=0) return;
    const flash=cat.stunTimer>0&&Math.floor(frameCount/4)%2===0;
    ctx.globalAlpha=flash?0.4:1;
    if(cat.dead){
      ctx.save();
      const cx=cat.x+cat.w/2, cy=cat.y+cat.h;
      ctx.translate(cx,cy);
      ctx.rotate(Math.PI/2*(cat.facing>=0?1:-1));
      ctx.translate(-(cat.big?14:10),-(cat.big?28:22));
      drawCat(0,0,1,0,cat.color,cat.big);
      ctx.restore();
    } else if(cat.big && cat.signTimer>0){
      // Arm-raised sign pose replaces normal drawing entirely
      drawCatSignRaise(cat.x, cat.y, cat.facing, cat.color, cat.signTimer);
    } else if(cat.big && cat.hiding){
      // Only the head peeks out above the item
      const tgt=items[cat.hideTarget];
      const peekY=tgt ? FLOOR_Y[tgt.floor]-16 : cat.y; // just the head above the floor
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
}
function drawBackground(){
  // Dark attic bg
  ctx.fillStyle=PAL.atticBg; ctx.fillRect(0,0,W,H);

  // Side walls (brick pattern)
  for(let wy=0;wy<H;wy+=16){
    const off=(Math.floor(wy/16)%2)*12;
    ctx.fillStyle=PAL.wallBrick; ctx.fillRect(0,wy,WALL_L,16); ctx.fillRect(WALL_R,wy,W-WALL_R,16);
    ctx.fillStyle=PAL.wallBrickHi;
    ctx.fillRect(off%WALL_L,wy,WALL_L,2); ctx.fillRect(WALL_R,wy,W-WALL_R,2);
  }

  // Roof rafters (diagonal beams)
  for(let rx=-H;rx<W+H;rx+=120){
    for(let t=0;t<H;t++){
      const bx=rx+t;
      if(bx>=0 && bx<W){
        ctx.fillStyle=PAL.beam; ctx.fillRect(bx,t,8,1);
        if(t%12===0){ctx.fillStyle=PAL.beamHi; ctx.fillRect(bx,t,4,1);}
      }
    }
  }

  // Horizontal ceiling planks
  for(let px2=WALL_L;px2<WALL_R;px2+=72){
    const pw=Math.min(70,WALL_R-px2);
    ctx.fillStyle=PAL.plank; ctx.fillRect(px2,0,pw,28);
    ctx.fillStyle=PAL.plankHi; ctx.fillRect(px2,0,pw,3);
    ctx.fillStyle=PAL.plankDk; ctx.fillRect(px2,25,pw,3); ctx.fillRect(px2+pw-2,0,2,28);
  }

  // Dusty window (center top)
  ctx.fillStyle=PAL.window; ctx.fillRect(272,4,96,56);
  ctx.fillStyle=PAL.windowGlass; ctx.fillRect(276,6,88,50);
  ctx.fillStyle=PAL.window;
  ctx.fillRect(316,6,8,50);   // vertical bar
  ctx.fillRect(276,28,88,8);  // horizontal bar
  // grime patches
  ctx.fillStyle='#101820'; ctx.fillRect(280,8,16,10); ctx.fillRect(330,34,18,8);
  // frame highlight
  ctx.fillStyle=PAL.beamHi; ctx.fillRect(272,4,96,3); ctx.fillRect(272,4,3,56);

  // Cobweb top-left
  ctx.fillStyle='#707070';
  ctx.fillRect(22,32,2,2); ctx.fillRect(24,34,10,2); ctx.fillRect(22,36,2,2);
  ctx.fillRect(34,28,2,12); ctx.fillRect(36,32,8,2);

  // Stacked boxes bottom-right
  ctx.fillStyle=PAL.plank; ctx.fillRect(520,400,72,44);
  ctx.fillStyle='#7A4822'; ctx.fillRect(523,403,66,38);
  ctx.fillStyle='#6A3812'; ctx.fillRect(530,410,16,14); ctx.fillRect(558,410,16,14);
  ctx.fillStyle='#8A5530'; ctx.fillRect(520,380,56,22);
  ctx.fillStyle='#7A4520'; ctx.fillRect(522,382,52,18);

  // Old trunk bottom-left
  ctx.fillStyle='#4A2808'; ctx.fillRect(30,406,80,38);
  ctx.fillStyle='#5A3818'; ctx.fillRect(32,408,76,34);
  ctx.fillStyle='#402010'; ctx.fillRect(32,420,76,4);
  ctx.fillStyle='#604020'; ctx.fillRect(64,406,8,38); // latch

  // Floor platforms
  for(let fi=0;fi<FLOOR_Y.length;fi++){
    const py=FLOOR_Y[fi];
    for(const pl of PLATFORMS[fi]){
      ctx.fillStyle=PAL.platMid; ctx.fillRect(pl.x,py,pl.w,PLAT_H);
      ctx.fillStyle=PAL.platTop; ctx.fillRect(pl.x,py,pl.w,3);
      ctx.fillStyle=PAL.platBot; ctx.fillRect(pl.x,py+PLAT_H-3,pl.w,3);
      ctx.fillStyle=PAL.platBot;
      for(let tx=pl.x;tx<pl.x+pl.w;tx+=40) ctx.fillRect(tx,py,2,PLAT_H);
    }
  }
}
