// =============================================================================
// input.js  —  Keyboard event handlers
// =============================================================================

// ── INPUT ──────────────────────────────────────────────────────────────────
const keys={};
let spacePressed=false, spaceWasDown=false;
window.addEventListener('keydown',e=>{
  keys[e.code]=true;
  if(e.code==='Space'){ e.preventDefault(); if(!spaceWasDown){spacePressed=true;} spaceWasDown=true; }
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)) e.preventDefault();
  if(e.code==='KeyK' && (state==='PLAYING'||state==='HURRY'||state==='DEAD'||state==='PAUSED')){
    paused=false; stopMusic(); collectedItems=[false,false,false,false,false];
    timer=90; hurryTriggered=false; hurryScroll=-9999; lives=3; score=0;
    musicTempo=1.0; buildLevel(levelNum); state='PLAYING'; startMusic();
  }
  if(e.code==='KeyP' && (state==='PLAYING'||state==='HURRY'||state==='PAUSED')){
    paused=!paused;
    if(paused){ stopMusic(); state='PAUSED'; }
    else { state=hurryTriggered?'HURRY':'PLAYING'; startMusic(); }
  }
  if((state==='TITLE'||state==='GAMEOVER'||state==='WIN')&&(e.code==='Space'||e.code==='Enter')){
    initAudio(); startGame();
  }
});
window.addEventListener('keyup',e=>{ keys[e.code]=false; if(e.code==='Space') spaceWasDown=false; });
