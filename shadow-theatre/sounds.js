let context;
export async function feedbackSound(correct=true){
  try{
    context??=new (window.AudioContext||window.webkitAudioContext)();
    await context.resume();
    const notes=correct?[523.25,659.25,783.99]:[330,261.63];
    notes.forEach((frequency,i)=>{const oscillator=context.createOscillator(),gain=context.createGain();const start=context.currentTime+i*.13;oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.13,start+.015);gain.gain.exponentialRampToValueAtTime(.001,start+.22);oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start);oscillator.stop(start+.24);});
  }catch{/* Visual feedback remains available without audio. */}
}
