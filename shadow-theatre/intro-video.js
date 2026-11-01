// Original action captions aligned to the demonstration, not source-speech transcripts.
const cues=[
[0,5,'看，手里有操纵杆。','Kàn, shǒu lǐ yǒu cāozònggǎn.','Kijk, hij houdt stokjes vast.','Look, he is holding control rods.','Regarde, il tient des baguettes.'],
[5,11,'一只手扶住身体。','Yī zhī shǒu fúzhù shēntǐ.','Eén hand houdt het lichaam vast.','One hand holds the body steady.','Une main maintient le corps.'],
[11,17,'另一只手控制手臂。','Lìng yī zhī shǒu kòngzhì shǒubì.','De andere hand beweegt de armen.','The other hand controls the arms.','L’autre main fait bouger les bras.'],
[17,23,'轻轻动一动操纵杆。','Qīngqīng dòng yi dòng cāozònggǎn.','Beweeg de stokjes voorzichtig.','Move the rods gently.','Bouge doucement les baguettes.'],
[23,29,'影偶跟着动起来了。','Yǐng’ǒu gēnzhe dòng qǐlái le.','De pop begint mee te bewegen.','The puppet moves along.','La marionnette se met à bouger.'],
[29,34,'你也来试试看！','Nǐ yě lái shìshi kàn!','Probeer het nu zelf!','Now try it yourself!','À toi d’essayer !']
];
const $=id=>document.getElementById(id),offline=new URLSearchParams(location.search).has('offline');
let language='nl',index=0,player,ready=false,loading=false,localURL;
try{language=localStorage.getItem('ce-shadow-language')||'nl'}catch{}
if(!['nl','fr','en'].includes(language))language='nl';
function caption(i){index=Math.max(0,Math.min(cues.length-1,i));const c=cues[index];$('cue-zh').textContent=c[2];$('cue-py').textContent=c[3];$('cue-nl').textContent=c[{nl:4,en:5,fr:6}[language]];$('cue-nl').lang={nl:'nl-BE',fr:'fr-BE',en:'en-GB'}[language];$('prev-cue').disabled=index===0;$('next-cue').disabled=index===cues.length-1}
function locale(){caption(index);$('intro-title').textContent='让影偶动起来 · '+{nl:'Laat je pop bewegen',en:'Bring your puppet to life',fr:'Fais bouger ta marionnette'}[language]}
$('language').value=language;$('language').onchange=e=>{language=e.target.value;try{localStorage.setItem('ce-shadow-language',language)}catch{}locale()};
$('py-toggle').onclick=()=>{const shown=document.body.classList.toggle('show-py');$('py-toggle').setAttribute('aria-pressed',shown)};
function api(){if(window.YT?.Player)return Promise.resolve();return new Promise((resolve,reject)=>{window.onYouTubeIframeAPIReady=resolve;const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onload=()=>{};script.onerror=reject;document.head.append(script)})}
async function load(){if(player||loading)return;if(offline){openLocal('./media/intro.mp4');return}loading=true;try{await api();$('load-video')?.remove();player=new YT.Player('player',{host:'https://www.youtube-nocookie.com',videoId:'emf2eon5suQ',playerVars:{playsinline:1,fs:0,rel:0,origin:location.origin},events:{onReady:e=>{ready=true;e.target.playVideo()},onError:()=>{$('player-status').textContent='暂时无法播放，可以打开原视频或选择本地视频。'}}})}catch{loading=false;$('player-status').textContent='网络连接失败，可以选择本地视频。'}}
function openLocal(src){if(player?.destroy)player.destroy();$('video-shell').innerHTML='<video id="offline-player" controls playsinline controlsList="nofullscreen" disablePictureInPicture style="width:100%;height:100%"></video>';const v=$('offline-player');v.src=src;ready=false;player={playVideo:()=>v.play().catch(()=>{}),pauseVideo:()=>v.pause(),getCurrentTime:()=>v.currentTime,getPlayerState:()=>v.paused?2:1,seekTo:t=>{v.currentTime=t},setPlaybackRate:r=>{v.playbackRate=r},destroy:()=>{v.pause();v.removeAttribute('src');v.load()}};v.onloadedmetadata=()=>{ready=true;player.playVideo()};v.onerror=()=>{$('player-status').textContent='请打开本地的 intro.mp4 操偶示范文件。'}}
$('load-video').onclick=load;$('pause').onclick=()=>{if(!ready){load();return}player.getPlayerState()===1?player.pauseVideo():player.playVideo()};$('replay').onclick=()=>{if(ready){player.seekTo(0,true);player.playVideo()}else load()};$('speed').onchange=e=>{if(ready)player.setPlaybackRate(Number(e.target.value))};
function seek(i){caption(i);if(ready){player.seekTo(cues[index][0],true);player.pauseVideo()}$('time').textContent='00:'+String(cues[index][0]).padStart(2,'0')}
$('prev-cue').onclick=()=>seek(index-1);$('next-cue').onclick=()=>seek(index+1);
setInterval(()=>{if(!ready)return;const t=player.getCurrentTime();let i=cues.findIndex(c=>t>=c[0]&&t<c[1]);if(i>=0&&i!==index)caption(i);$('time').textContent='00:'+String(Math.floor(t)).padStart(2,'0');if(t>=34&&player.getPlayerState()===1)player.pauseVideo()},200);
function speak(text,lang){if(ready)player.pauseVideo();if(!window.speechSynthesis)return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=.8;const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>v.lang===lang)||voices.find(v=>v.lang.startsWith(lang.slice(0,2)))||null;speechSynthesis.speak(u)}
$('speak-cue').onclick=()=>speak(cues[index][2],'zh-CN');$('speak-translation').onclick=()=>speak($('cue-nl').textContent,{nl:'nl-BE',fr:'fr-BE',en:'en-GB'}[language]);
$('local-video').onchange=e=>{const file=e.target.files[0];if(!file)return;if(localURL)URL.revokeObjectURL(localURL);localURL=URL.createObjectURL(file);openLocal(localURL);e.target.value=''};
$('watch-fullscreen').onclick=async()=>{const frame=$('watch-frame');if(document.fullscreenElement){await document.exitFullscreen();return}if(frame.classList.contains('fullscreen-fallback')){frame.classList.remove('fullscreen-fallback');$('watch-fullscreen').textContent='全屏看视频 ⛶';return}try{await frame.requestFullscreen()}catch{frame.classList.add('fullscreen-fallback');$('watch-fullscreen').textContent='退出全屏 ×'}};
document.addEventListener('fullscreenchange',()=>{$('watch-fullscreen').textContent=document.fullscreenElement?'退出全屏 ×':'全屏看视频 ⛶'});document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('watch-frame').classList.remove('fullscreen-fallback');$('watch-fullscreen').textContent='全屏看视频 ⛶'}});
if(offline){document.querySelector('.brand').href='./?offline=1';$('go-stories').href='./?offline=1';$('source-link').href='./media/intro.mp4'}
locale();
