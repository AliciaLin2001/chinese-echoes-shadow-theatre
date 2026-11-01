import {setMusic,stopMusic,musicVolume,musicMood,musicDuck} from './music.js?v=2';
import {expandScenes,sceneNames,scenePhotos} from './stage-scenes.js';
import { feedbackSound } from './sounds.js';
import { scripts } from './scripts-data.js';
import { videos } from './videos.js?v=2';
import { translations } from './languages.js';
import { quizzes } from './quiz-data.js';
import { addQuestions } from './quiz-more.js';
addQuestions(quizzes);
expandScenes(scripts,translations);
translations["Loten en punten"]=["Draw names and score","Tirage et points"];
let musicEnabled=false;
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ids=['race','crow','farmer','fox','nezha'];

let activeMode="watch";
let showFrench=false,pollMode=false,answers={},quizIndex=0,quizSound=true;
let selected=ids.includes(location.hash.slice(1))?location.hash.slice(1):'race';
let player=null,ready=false,loading=false,generation=0,cueIndex=0,stageIndex=0,toastTimer,apiPromise,localUrl;
function read(key,fallback){try{return localStorage.getItem(key)??fallback}catch{return fallback}}
function save(key,value){try{localStorage.setItem(key,value)}catch{toast('浏览器未允许保存，这次输入仍可继续使用。')}}
let language=read('ce-shadow-language','nl');
if(!['nl','en','fr'].includes(language))language='nl';
const translatedNodes=new WeakMap();
function translate(){document.querySelectorAll('.nl').forEach(el=>{if(el.querySelector('.nl'))return;let original=translatedNodes.get(el);if(!original||el.textContent!==original.shown)original={source:el.textContent,shown:el.textContent};const source=original.source.trim(), pair=translations[source];const shown=language==='nl'?original.source:pair?pair[language==='en'?0:1]:original.source;if(el.textContent!==shown)el.textContent=shown;original.shown=shown;translatedNodes.set(el,original);el.lang=language==='nl'?'nl-BE':language==='fr'?'fr-BE':'en';});}
let nl=read('ce-shadow-nl','true')==='true',py=read('ce-shadow-py','true')==='true';
function toast(s){$('toast').textContent=s;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').textContent='',4500)}
function preferences(){translate();document.body.classList.toggle('no-nl',!nl);document.body.classList.toggle('show-py',py);$('nl-toggle').setAttribute('aria-pressed',nl);$('nl-toggle').textContent=nl?'辅助译文 ✓':'辅助译文';$('py-toggle').setAttribute('aria-pressed',py)}
$('nl-toggle').onclick=()=>{nl=!nl;save('ce-shadow-nl',String(nl));preferences()};
$('py-toggle').onclick=()=>{py=!py;save('ce-shadow-py',String(py));preferences()};preferences();
$('language').value=language;$('language').onchange=e=>{language=e.target.value;save('ce-shadow-language',language);translate();updateFrench();renderQuiz()};
const translationObserver=new MutationObserver(translate);translationObserver.observe(document.body,{childList:true,subtree:true,characterData:true});
function format(t){return `${Math.floor(t/60).toString().padStart(2,'0')}:${Math.floor(t%60).toString().padStart(2,'0')}`}
function setCue(index){const v=videos[selected];cueIndex=Math.max(0,Math.min(v.cues.length-1,index));const c=v.cues[cueIndex];$('cue-zh').textContent=c[1];$('cue-py').textContent=c[3]||'';$('cue-nl').textContent=c[2];$('prev-cue').disabled=cueIndex===0;$('next-cue').disabled=cueIndex===v.cues.length-1;document.querySelectorAll('.cue-button').forEach((el,i)=>{el.classList.toggle('active',i===cueIndex);el.setAttribute('aria-pressed',i===cueIndex)});updateFrench()}
function pause(){if(ready)player.pauseVideo()}
function stopSpeech(){musicDuck(false);if('speechSynthesis' in window)window.speechSynthesis.cancel()}
function mode(view){const active=view===true?'act':view===false?'watch':view;activeMode=active;for(const name of ['watch','act','quiz']){$(name==='quiz'?'quiz-section':name+'-panel').hidden=name!==active;$(name+'-tab').setAttribute('aria-selected',name===active)}if(active!=='watch')pause();stopSpeech();}
$('watch-tab').onclick=()=>mode('watch');$('act-tab').onclick=()=>mode('act');$('quiz-tab').onclick=()=>mode('quiz');$('start-act').onclick=()=>mode('act');

function render(){quizIndex=0;document.body.classList.toggle('burned-captions',selected==='crow');generation++;if(localUrl){URL.revokeObjectURL(localUrl);localUrl=null;}if(player){try{player.destroy()}catch{}}player=null;ready=false;loading=false;stopSpeech();const s=scripts[selected],v=videos[selected];
$('stories').innerHTML=ids.map((id,i)=>`<button class="story-button" data-story="${id}" aria-pressed="${id===selected}"><span class="num">0${i+1}</span><img class="story-cover" src="./images/${id}-cover.jpg" alt="${scripts[id].title}视频封面"><strong>${scripts[id].title}</strong><span class="nl" lang="nl-BE">${scripts[id].nl}</span></button>`).join('');
$('title').textContent=s.title;$('story-nl').textContent=s.nl;$('summary').textContent=s.summary;$('summary-nl').textContent=s.summaryNl;$('question').textContent=s.question;$('question-nl').textContent=s.questionNl;
$('roles').innerHTML=s.roles.map(r=>`<div class="role-card"><span>${r.zh}</span><small class="nl" lang="nl-BE">${r.nl}</small></div>`).join('');
$('video-shell').innerHTML=`<div id="player"></div><button class="load-video" id="load-video" aria-label="播放${s.title}中文视频"><img src="./images/${selected}-cover.jpg" alt="${s.title}视频封面"><span>▶ 播放中文故事</span></button>`;
$('load-video').onclick=()=>loadVideo(v.start);$('youtube').href=new URLSearchParams(location.search).has('offline')?`./media/${selected}.mp4`:`https://www.youtube.com/watch?v=${v.id}`;$('source').textContent=`${v.publisher} · ${v.label} · YouTube 原视频播放器`;$('video-note').textContent=v.note;$('player-status').textContent='';$('speed').value='1';$('time').textContent=format(v.start);
$('cues').innerHTML=v.cues.map((c,i)=>`<button class="cue-button" data-cue="${i}"><time>${format(c[0])}</time><span class="py">${esc(c[3]||'')}</span>${esc(c[1])}<span class="nl" lang="nl-BE">${esc(c[2])}</span></button>`).join('');setCue(0);
$('role-filter').innerHTML='<option value="">全部角色 · Alle rollen</option>'+s.roles.map(r=>`<option value="${r.zh}">${r.zh} · ${r.nl}</option>`).join('');renderLines();$('idea').value=read(`ce-shadow-idea-${selected}`,'');$('adaptation-note').textContent=selected==='nezha'?'自编温和版：用现有哪吒与龙王影偶演出合作故事，可自由改编。':selected==='farmer'?'课堂轻松改编：兔子休息后离开，与原视频的结局细节不同。':selected==='crow'?'表演使用奶酪（小纸片），可替换成视频里的肉。':'';
renderQuiz();$('quiz-answer').value=read(`ce-shadow-discussion-${selected}`,'');$('quiz-open').textContent=s.question;$('quiz-open-nl').textContent=s.questionNl;translate();mode(activeMode);history.replaceState(null,'',`#${selected}`)}
$('stories').onclick=e=>{const b=e.target.closest('[data-story]');if(b){selected=b.dataset.story;render()}};
$('cues').onclick=e=>{const b=e.target.closest('[data-cue]');if(b)seekCue(Number(b.dataset.cue))};
function seekCue(i){setCue(i);const t=videos[selected].cues[cueIndex][0];$('time').textContent=format(t);if(ready){player.seekTo(t,true);player.pauseVideo()}else if(!player){$('player-status').textContent='正在预读导读。点击视频可开始同步播放。'}}
$('prev-cue').onclick=()=>seekCue(cueIndex-1);$('next-cue').onclick=()=>seekCue(cueIndex+1);
function api(){if(window.YT?.Player)return Promise.resolve();if(!apiPromise)apiPromise=new Promise((resolve,reject)=>{window.onYouTubeIframeAPIReady=resolve;const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{apiPromise=null;reject(new Error('network'))};document.head.append(script)});return apiPromise}
async function loadVideo(start){if(loading||player)return;if(new URLSearchParams(location.search).has('offline')){openLocal(`./media/${selected}.mp4`);return;}loading=true;const token=generation,v=videos[selected];$('player-status').textContent='正在连接 YouTube…';try{await api();if(token!==generation)return;const overlay=$('load-video');if(overlay)overlay.remove();player=new YT.Player('player',{host:'https://www.youtube-nocookie.com',videoId:v.id,playerVars:{playsinline:1,fs:0,rel:0,cc_load_policy:1,cc_lang_pref:'zh-Hans',start:Math.floor(start), end:Math.ceil(v.end),origin:location.origin},events:{onReady:event=>{if(token!==generation)return;ready=true;$('player-status').textContent='';event.target.seekTo(start,true);event.target.playVideo()},onError:()=>{$('player-status').textContent='此视频暂时无法嵌入播放。请点“在 YouTube 打开”；下方导读和排练仍可使用。'}}});}catch{loading=false;$('player-status').textContent='YouTube 暂时无法连接。可在 YouTube 打开视频，或直接阅读导读、排练台词。'}}
setInterval(()=>{if(!ready||!player)return;const t=player.getCurrentTime();if(!Number.isFinite(t))return;const v=videos[selected];$('time').textContent=format(t);let i=0;for(let j=0;j<v.cues.length;j++)if(t>=v.cues[j][0])i=j;if(i!==cueIndex||$('cue-zh').textContent!==v.cues[i][1])setCue(i);if(t<v.cues[i][0]||t>=v.cues[i][4]){$('cue-zh').textContent='';$('cue-py').textContent='';$('cue-nl').textContent='';$('cue-fr').textContent='';}if(t>=v.end&&player.getPlayerState()===1){player.pauseVideo();$('player-status').textContent='片段结束。现在可以分角色演一演。'}},250);
$('replay').onclick=()=>{const v=videos[selected];if(ready){player.seekTo(v.start,true);player.playVideo();$('player-status').textContent=''}else if(!player)loadVideo(v.start)};
$('pause').onclick=()=>{if(!ready){if(!player)loadVideo(videos[selected].start);return}player.getPlayerState()===1?player.pauseVideo():player.playVideo()};
$('speed').onchange=e=>{if(ready){const rate=Number(e.target.value);if(player.getAvailablePlaybackRates().includes(rate))player.setPlaybackRate(rate);else{e.target.value='1';toast('这个视频暂不支持此速度。')}}};
function renderLines(){const s=scripts[selected],filter=$('role-filter').value;$('lines').innerHTML=s.lines.map((l,i)=>{if(filter&&l.role!==filter)return '';const r=s.roles.find(r=>r.zh===l.role);return `<article class="line"><div class="line-role">${l.role}<small class="nl">${r?.nl||''}</small></div><div><p class="py">${esc(l.py)}</p><p class="zh">${esc(l.zh)}</p><p class="nl" lang="nl-BE">${esc(l.nl)}</p><div class="action">${esc(l.action)} <span class="nl">${esc(l.actionNl)}</span></div></div><button data-speak="${i}" aria-label="朗读${esc(l.zh)}">▶ 听一句</button></article>`}).join('')}
$('role-filter').onchange=renderLines;$('lines').onclick=e=>{const b=e.target.closest('[data-speak]');if(b)speak(scripts[selected].lines[Number(b.dataset.speak)].zh)};
function speak(text,lang="zh-CN"){if(!text)return;pause();if(!('speechSynthesis' in window)){toast('此浏览器不支持朗读，请跟着老师读。');return}stopSpeech();const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=.8;const voices=speechSynthesis.getVoices();const voice=voices.find(v=>v.lang===lang)||voices.find(v=>v.lang.startsWith(lang.slice(0,2)));if(voice)u.voice=voice;u.onstart=()=>musicDuck(true);u.onend=()=>musicDuck(false);u.onerror=()=>{musicDuck(false);toast('朗读暂不可用，请跟着老师读。')};speechSynthesis.speak(u)}
$('idea').oninput=e=>save(`ce-shadow-idea-${selected}`,e.target.value);
$('print').onclick=()=>window.print();$('intro-close').onclick=()=>$('intro-dialog').close();
function stageLines(){return scripts[selected].lines}
function roleImage(role){if(role==='旁白')return './images/narrator.png';if(selected==='farmer'&&role==='兔子')return './images/rabbit.svg';return `./images/${selected}-role-${scripts[selected].roles.findIndex(r=>r.zh===role)}.jpg`}
function stageRender(){const all=stageLines();const total=Math.ceil(all.length/3);stageIndex=Math.max(0,Math.min(total-1,stageIndex));$('stage-image').src=`./images/${selected}-${scenePhotos[selected][stageIndex]}.jpg`;$('stage-story').textContent=`${scripts[selected].title} · ${sceneNames[selected][stageIndex]}`;$('stage-dialogues').innerHTML=all.slice(stageIndex*3,stageIndex*3+3).map((l,i)=>`<article class="stage-line"><div class="stage-speaker"><img src="${roleImage(l.role)}" alt="${l.role}"><strong>${l.role}</strong></div><div><p class="py">${esc(l.py)}</p><p class="stage-line-zh">${esc(l.zh)}</p><p class="nl">${esc(l.nl)}</p><p class="stage-fr extra-fr" ${showFrench&&language!=='fr'?'':'hidden'}>${esc(translations[l.nl]?.[1]||'')}</p><small class="stage-action">${esc(l.action)}<span class="nl">${esc(l.actionNl)}</span></small></div><div class="stage-audio"><button data-stage-speak="${stageIndex*3+i}" aria-label="朗读中文：${esc(l.zh)}">▶</button><button data-stage-translation="${stageIndex*3+i}" aria-label="朗读译文">${language.toUpperCase()}</button></div></article>`).join('');$('stage-count').textContent=`第 ${stageIndex+1} 幕 / ${total}`;$('stage-prev').disabled=stageIndex===0;$('stage-next').disabled=stageIndex===total-1;translate();stopSpeech()}
$('stage-open').onclick=()=>{pause();stageIndex=0;stageRender();$('stage').showModal()};$('stage-close').onclick=()=>$('stage').close();$('stage').addEventListener('close',()=>{stopSpeech();stopStageMusic()});$('stage-prev').onclick=()=>{stageIndex--;stageRender()};$('stage-next').onclick=()=>{stageIndex++;stageRender()};
$('stage-dialogues').onclick=e=>{const translated=e.target.closest('[data-stage-translation]');if(translated){const l=stageLines()[Number(translated.dataset.stageTranslation)];speak(language==='nl'?l.nl:translations[l.nl]?.[language==='en'?0:1]||l.nl,{nl:'nl-BE',en:'en-GB',fr:'fr-BE'}[language]);return}const b=e.target.closest('[data-stage-speak]');if(b)speak(stageLines()[Number(b.dataset.stageSpeak)].zh)};
$('stage').addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();stageIndex++;stageRender()}if(e.key==='ArrowLeft'){e.preventDefault();stageIndex--;stageRender()}});
window.addEventListener('hashchange',()=>{if(ids.includes(location.hash.slice(1))){selected=location.hash.slice(1);render()}});render();
$('speak-cue').onclick=()=>speak($('cue-zh').textContent);
function openLocal(src){
 generation++;if(player){try{player.destroy()}catch{}}
 $('video-shell').innerHTML='<video id="offline-player" controls playsinline controlsList="nofullscreen" disablePictureInPicture></video>';
 const media=$('offline-player');media.src=src;ready=false;loading=false;
 player={pauseVideo:()=>media.pause(),playVideo:()=>media.play().catch(()=>toast('请点击视频上的播放键。')),seekTo:t=>{media.currentTime=t},getCurrentTime:()=>media.currentTime,getPlayerState:()=>media.paused?2:1,getAvailablePlaybackRates:()=>[.75,1],setPlaybackRate:r=>{media.playbackRate=r},destroy:()=>{media.pause();media.removeAttribute('src');media.load()}};
 media.onloadedmetadata=()=>{ready=true;media.currentTime=Math.min(videos[selected].start,media.duration);$('player-status').textContent='本地播放 · 无需网络';player.playVideo()};
 media.onerror=()=>{$('player-status').textContent='文件无法播放。请用“打开本地视频”选择当前故事的同一完整原视频（MP4）。'};
}
$('local-video').onchange=event=>{const file=event.target.files[0];if(!file)return;if(!file.type.startsWith('video/')){toast('请选择视频文件。');return}if(localUrl)URL.revokeObjectURL(localUrl);localUrl=URL.createObjectURL(file);openLocal(localUrl);event.target.value=''};

$('speak-translation').onclick=()=>speak($('cue-nl').textContent,{nl:'nl-BE',fr:'fr-BE',en:'en-GB'}[language]);
$('fr-toggle').onclick=()=>{showFrench=!showFrench;$('fr-toggle').setAttribute('aria-pressed',showFrench);updateFrench()};
function updateFrench(){const c=videos[selected].cues[cueIndex];$('cue-fr').textContent=c?.[6]||'';$('cue-fr').hidden=!showFrench||language==='fr';document.querySelectorAll('.stage-fr').forEach(el=>el.hidden=!showFrench||language==='fr')}
if(new URLSearchParams(location.search).has('offline')){document.querySelector('.intro-link').href='./intro.html?offline=1';}

$('watch-fullscreen').onclick=async()=>{const frame=$('watch-frame');if(document.fullscreenElement){await document.exitFullscreen();return}if(frame.classList.contains('fullscreen-fallback')){frame.classList.remove('fullscreen-fallback');$('watch-fullscreen').textContent='全屏看故事 ⛶';return}if(frame.requestFullscreen){try{await frame.requestFullscreen();return}catch{}}frame.classList.add('fullscreen-fallback');$('watch-fullscreen').textContent='退出全屏 ×'};
document.addEventListener('fullscreenchange',()=>{$('quiz-fullscreen').textContent=document.fullscreenElement===$('quiz-section')?'退出全屏 ×':'全屏答题 ⛶';$('watch-fullscreen').textContent=document.fullscreenElement?'退出全屏 ×':'全屏看故事 ⛶'});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('watch-frame').classList.remove('fullscreen-fallback');$('watch-fullscreen').textContent='全屏看故事 ⛶'}});

function quizText(text){return text[({nl:1,en:2,fr:3})[language]]}
function getVotes(){try{return JSON.parse(read(`ce-shadow-votes-${selected}`,'{}'))}catch{return {}}}
function renderQuiz(){const excerpt=quizIndex<2;$('quiz-clip').hidden=!excerpt;$('quiz-context').textContent=excerpt?'对应精选片段 · '+format(videos[selected].start)+'–'+format(videos[selected].end):'完整故事 / 表演稿理解题 · 可先到「演故事」阅读台词';const votes=getVotes();$('quiz').innerHTML=quizzes[selected].slice(quizIndex,quizIndex+1).map((q)=>{const i=quizIndex;const key=`${selected}-${i}`,answered=answers[key],reveal=answered===q.a||answered==='reveal';return `<article class="quiz-card"><h3>${i+1}. ${esc(q.q[0])}</h3><p class="nl" lang="${language}">${esc(quizText(q.q))}</p><button class="read-question" data-read-question="${i}">听题</button><div class="quiz-options">${q.o.map((o,j)=>`<button data-question="${i}" data-choice="${j}" class="${reveal&&j===q.a?'correct':''}" aria-pressed="${answered===j}"><b>${'ABC'[j]}</b><span>${esc(o[0])}<small class="nl">${esc(quizText(o))}</small></span>${pollMode?`<em>${votes[i]?.[j]||0} 票 ＋1</em>`:''}</button>`).join('')}</div>${pollMode?`<button data-reveal="${i}">讨论后看答案</button>`:''}<p class="quiz-feedback" role="status">${reveal?`对了！${esc(q.e[0])}<span class="nl">${esc(quizText(q.e))}</span>`:answered!==undefined?'再看一看，也可以和旁边的同学讨论。':''}</p></article>`}).join('');$('quiz-progress').textContent=`第 ${quizIndex+1} 题 / ${quizzes[selected].length} · 已答对 ${quizzes[selected].filter((q,i)=>answers[`${selected}-${i}`]===q.a).length} 题`;$('quiz-prev').disabled=quizIndex===0;$('quiz-next').disabled=quizIndex===quizzes[selected].length-1;preferences()}
$('quiz').onclick=e=>{const readButton=e.target.closest('[data-read-question]');if(readButton){speak(quizzes[selected][Number(readButton.dataset.readQuestion)].q[0]);return}const reveal=e.target.closest('[data-reveal]');if(reveal){if(quizSound)feedbackSound(true);answers[`${selected}-${reveal.dataset.reveal}`]='reveal';renderQuiz();return}const b=e.target.closest('[data-question]');if(!b)return;const i=Number(b.dataset.question),j=Number(b.dataset.choice);if(pollMode){const votes=getVotes();votes[i]??=[0,0,0];votes[i][j]++;save(`ce-shadow-votes-${selected}`,JSON.stringify(votes))}else {answers[`${selected}-${i}`]=j;if(quizSound)feedbackSound(j===quizzes[selected][i].a)}renderQuiz()};
$('poll-toggle').onclick=()=>{pollMode=!pollMode;$('poll-toggle').setAttribute('aria-pressed',pollMode);renderQuiz()};$('poll-reset').onclick=()=>{save(`ce-shadow-votes-${selected}`,'{}');renderQuiz()};$('quiz-answer').oninput=e=>save(`ce-shadow-discussion-${selected}`,e.target.value);

$('quiz-prev').onclick=()=>{quizIndex=Math.max(0,quizIndex-1);renderQuiz()};$('quiz-next').onclick=()=>{quizIndex=Math.min(quizzes[selected].length-1,quizIndex+1);renderQuiz()};

$('quiz-clip').onclick=async()=>{if(document.fullscreenElement)await document.exitFullscreen();mode('watch');$('replay').click();$('watch-frame').scrollIntoView({block:'start',behavior:'smooth'})};
$('quiz-sound').onclick=()=>{quizSound=!quizSound;$('quiz-sound').setAttribute('aria-pressed',quizSound);$('quiz-sound').textContent=quizSound?'音效 ✓':'音效关闭'};
$('quiz-fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('quiz-section').requestFullscreen()}catch{toast('此浏览器不支持全屏，请放大浏览器窗口。')}};

if(new URLSearchParams(location.search).has("offline")){document.querySelectorAll('a[href="./classroom.html"]').forEach(a=>a.href="./classroom.html?offline=1")}

function stopStageMusic(){stopMusic();musicEnabled=false;$('music-toggle').textContent='音乐：关 ♫';$('music-toggle').setAttribute('aria-pressed','false')}
$('music-toggle').onclick=async()=>{const button=$('music-toggle');button.disabled=true;try{musicEnabled=await setMusic(!musicEnabled);button.textContent=musicEnabled?'音乐：开 ♫':'音乐：关 ♫';button.setAttribute('aria-pressed',musicEnabled)}catch{toast('此浏览器暂时不能播放配乐。')}finally{button.disabled=false}};
$('music-volume').oninput=e=>musicVolume(Number(e.target.value)/100);
$('music-mood').onchange=e=>musicMood(e.target.value);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopStageMusic()});
