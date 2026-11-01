// Original short looping scores, synthesized locally; no external music recordings.
let context,gain,timer,index=0,enabled=false,volume=.18,ducked=false,mood='gentle';
const tracks={
 gentle:{beat:530,type:'sine',decay:.9,notes:[60,0,64,67,0,69,67,0,64,0,62,64,0,62,60,0,67,0,69,72,69,0,67,64,62,0,64,67,64,62,60,0],bass:[48,53,55,48]},
 bright:{beat:290,type:'triangle',decay:.35,notes:[60,64,67,0,67,69,72,0,69,67,64,62,64,0,60,0,64,67,72,0,74,72,69,67,64,62,60,62,64,0,60,0],bass:[48,55,53,55]},
 sneak:{beat:410,type:'sine',decay:.2,notes:[57,0,60,0,62,60,57,0,64,0,62,0,60,57,55,0,57,60,0,62,64,0,67,0,64,62,60,0,57,0,0,0],bass:[45,45,50,45]},
 sea:{beat:660,type:'sine',decay:1.4,notes:[60,64,67,72,67,64,60,0,62,65,69,74,69,65,62,0,64,67,72,76,72,67,64,0,62,65,69,72,69,65,60,0],bass:[48,50,52,48]},
 adventure:{beat:360,type:'triangle',decay:.45,notes:[57,60,64,0,57,62,65,0,59,62,67,0,64,62,60,0,57,60,64,67,69,67,64,62,60,62,64,0,59,0,57,0],bass:[45,50,47,52]},
 finale:{beat:330,type:'triangle',decay:.65,notes:[60,64,67,72,0,72,74,72,69,67,64,67,0,64,62,0,60,64,67,72,76,74,72,69,67,64,62,64,60,0,0,0],bass:[48,53,55,48]}
};
function level(){if(gain)gain.gain.setTargetAtTime(enabled?volume*(ducked?.18:1):0,context.currentTime,.12)}
function tone(midi,duration,amplitude,type){const oscillator=context.createOscillator(),envelope=context.createGain(),t=context.currentTime;oscillator.type=type;oscillator.frequency.value=440*2**((midi-69)/12);envelope.gain.setValueAtTime(0,t);envelope.gain.linearRampToValueAtTime(amplitude,t+.025);envelope.gain.exponentialRampToValueAtTime(.001,t+duration);oscillator.connect(envelope);envelope.connect(gain);oscillator.start(t);oscillator.stop(t+duration+.03)}
function note(){if(!enabled)return;const score=tracks[mood],step=index++%32,midi=score.notes[step];if(midi)tone(midi,score.decay,.28,score.type);if(step%8===0)tone(score.bass[Math.floor(step/8)],score.beat/1000*5,.13,'sine')}
function schedule(){clearInterval(timer);if(enabled){note();timer=setInterval(note,tracks[mood].beat)}}
export async function setMusic(on){if(on){context??=new(window.AudioContext||window.webkitAudioContext)();if(!gain){gain=context.createGain();gain.connect(context.destination)}await context.resume()}enabled=on;level();schedule();return enabled}
export function stopMusic(){enabled=false;clearInterval(timer);level()}
export function musicVolume(value){volume=Math.max(0,Math.min(.5,value));level()}
export function musicMood(value){if(tracks[value]){mood=value;index=0;schedule()}}
export function musicDuck(value){ducked=value;level()}
