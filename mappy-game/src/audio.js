// =============================================================================
// audio.js  —  Web Audio API: SFX helpers, music scheduler
// =============================================================================

// ── AUDIO ──────────────────────────────────────────────────────────────────
let audioCtx=null, musicPlaying=false, musicSchedId=null, nextNoteTime=0, noteIdx=0, musicTempo=1.0;
function initAudio(){ if(audioCtx)return; audioCtx=new(window.AudioContext||window.webkitAudioContext)(); }
function tone(freq,dur,type='square',vol=0.12,delay=0){
  if(!audioCtx)return;
  const t=audioCtx.currentTime+delay;
  const o=audioCtx.createOscillator(), g=audioCtx.createGain();
  o.connect(g); g.connect(audioCtx.destination);
  o.type=type; o.frequency.setValueAtTime(freq,t);
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(vol,t+0.01);
  g.gain.exponentialRampToValueAtTime(0.001,t+dur);
  o.start(t); o.stop(t+dur+0.05);
}
const sfx={
  bounce:()=>{ initAudio();tone(180,0.04,'square',0.18);tone(360,0.08,'square',0.12,0.04);tone(540,0.06,'square',0.08,0.1); },
  collect:()=>{ initAudio();[523,659,784,1047].forEach((f,i)=>tone(f,0.1,'square',0.12,i*0.06)); },
  caught:()=>{ initAudio();[380,320,260,210,170].forEach((f,i)=>tone(f,0.09,'sawtooth',0.18,i*0.07)); },
  door:()=>{ initAudio();tone(280,0.04,'square',0.09);tone(460,0.07,'square',0.1,0.04);tone(660,0.09,'square',0.08,0.09); },
  catDie:()=>{ initAudio();[560,460,360,260,180,130].forEach((f,i)=>tone(f,0.07,'sawtooth',0.16,i*0.05)); },
  lifeLost:()=>{ initAudio();[320,284,252,210].forEach((f,i)=>tone(f,0.14,'sawtooth',0.22,i*0.11)); },
  fanfare:()=>{ initAudio();[523,659,784,1047,784,1047,1047].forEach((f,i)=>tone(f,0.16,'square',0.18,i*0.13)); },
  hurry:()=>{ initAudio();for(let i=0;i<4;i++){tone(840,0.07,'square',0.28,i*0.14);tone(1060,0.07,'square',0.28,i*0.14+0.07);} },
  trampBreak:()=>{ initAudio();[280,220,160,110].forEach((f,i)=>tone(f,0.11,'sawtooth',0.22,i*0.06)); },
};
const MEL=[262,294,330,349,392,440,494,523,494,440,392,349,330,294,262,0,330,392,440,523,440,392,330,0,294,330,349,392,349,330,294,0];
const BAS=[131,0,165,0,196,0,131,0,165,0,131,0,196,0,165,0,131,0,196,0,165,0,131,0,196,0,131,0,165,0,196,0];
function startMusic(){ if(!audioCtx||musicPlaying)return; musicPlaying=true;noteIdx=0;nextNoteTime=audioCtx.currentTime+0.1;schedMusic(); }
function schedMusic(){
  if(!musicPlaying)return;
  const bd=0.18/musicTempo;
  while(nextNoteTime<audioCtx.currentTime+0.5){
    const mi=noteIdx%MEL.length, bi=noteIdx%BAS.length;
    if(MEL[mi]>0)tone(MEL[mi],bd*0.8,'square',0.07,nextNoteTime-audioCtx.currentTime);
    if(BAS[bi]>0)tone(BAS[bi],bd*0.7,'triangle',0.09,nextNoteTime-audioCtx.currentTime);
    nextNoteTime+=bd; noteIdx++;
  }
  musicSchedId=setTimeout(schedMusic,100);
}
function stopMusic(){ musicPlaying=false; if(musicSchedId)clearTimeout(musicSchedId); }
