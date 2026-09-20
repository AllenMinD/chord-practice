(function(){
  'use strict';
  const M=SightReading,host=document.querySelector('#reading-workspace'),key='chord-reading-v1';
  let progress={};try{const data=JSON.parse(localStorage.getItem(key)||'{}');if(data&&typeof data==='object'&&!Array.isArray(data))for(let i=0;i<M.levels.length;i++){const best=data[i]?.best;if(Number.isInteger(best)&&best>=0&&best<=10)progress[i]={best};}}catch{}
  let level=0,q,round=0,correct=0,answered=false,input='',misses=[],review=false,taps=[],started=0,hinted=false,token=0,bpmValue=60;
  let rhythmState='idle',resultRecorded=false;
  const countIn=RhythmCountIn.create({
    getContext:()=>context(),
    onBeat:beat=>{host.querySelector('#sr-count').textContent=`预备 ${beat} / 4`;feedback(`跟着节拍数：${beat}。预备期间不用敲。`);},
    onReady:()=>{rhythmState='ready';host.querySelector('#sr-count').textContent='开始';host.querySelector('#sr-tap').disabled=false;host.querySelector('#sr-tap').focus({preventScroll:true});feedback('现在跟着背景节拍器敲谱面节奏；背景声较轻，你的敲击声较响。第一下不评分，只评估后续起音间隔。');},
    onPulse:beat=>{host.querySelector('#sr-count').textContent=`跟拍 ${beat} / 4`;},
    onError:()=>{resetRhythm('声音未能启动，请打开声音后重新点击「预备并开始」。');}
  });
  function resetRhythm(message) {
    countIn.stop();rhythmState='idle';taps=[];
    const button=host.querySelector('#sr-start');
    if(button){button.disabled=answered;host.querySelector('#sr-tap').disabled=true;host.querySelector('#sr-bpm').disabled=answered;host.querySelector('#sr-count').textContent='等待预备';if(message)feedback(message);}
  }
  function beginRhythm() {
    if(answered||rhythmState==='counting'||host.querySelector('#sr-score')?.dataset.ready!=='true')return;
    resetRhythm();
    if(!soundEnabled){feedback('请先打开右上角的声音，再点击「预备并开始」。');return;}
    rhythmState='counting';host.querySelector('#sr-start').disabled=true;host.querySelector('#sr-bpm').disabled=true;
    host.querySelector('#sr-count').textContent='准备听拍';feedback('先听四拍：第一拍重音，第四拍走完后开始敲。');
    countIn.start(bpmValue);
  }
  const save=()=>{try{localStorage.setItem(key,JSON.stringify(progress));}catch{host.querySelector('#sr-storage').textContent='浏览器无法保存进度，本轮仍可正常练习。';}};
  function start(l,wrong=false){level=l;round=0;correct=0;review=wrong;next();}
  function next(){q=review?misses.shift():M.question(level);if(!q){review=false;q=M.question(level);}level=q.level;answered=false;resultRecorded=false;input='';taps=[];hinted=false;render();}
  async function score(){const el=host.querySelector('#sr-score'),id=++token;try{const osmd=new opensheetmusicdisplay.OpenSheetMusicDisplay(el,{autoResize:false,backend:'svg',drawingParameters:'compacttight',drawTitle:false,drawComposer:false,drawPartNames:false,drawMeasureNumbers:false});await osmd.load(M.xml(q));if(id!==token||!el.isConnected)return;osmd.Zoom=1.3;osmd.render();el.dataset.ready='true';started=performance.now();}catch{el.textContent='谱面加载失败，请刷新页面后重试。';host.querySelectorAll('[data-answer],#sr-tap').forEach(b=>b.disabled=true);}}
  function render(){countIn.stop();rhythmState='idle';host.innerHTML=`<header class="sr-heading"><span class="eyebrow">SIGHT READING / 每天读一点</span><h1>读谱训练</h1><p>先看懂，再连起来。每天一组 10 题，从认音走向视奏。</p></header><div class="sr-levels">${M.levels.map((l,i)=>`<button data-level="${i}" aria-pressed="${i===level}"><small>0${i+1} ${progress[i]?.best>=8?'✓':''}</small><strong>${l.title}</strong><span>${progress[i]?`最佳 ${progress[i].best}/10`:'开始探索'}</span></button>`).join('')}</div><article class="sr-card"><div class="sr-top"><span>${review?'错题复习':'第 '+(round+1)+' / 10 题'} · ${M.levels[level].title}</span><span>本组独立答对 ${correct} 题</span></div><p>${M.levels[level].desc}</p><div class="sr-guide">${level===0?'C4 在高音谱表下加一线；G4 在第二线；F3 在低音谱表第四线。':level===3?'请判断两个音相隔几度。':level===4?'先点击「预备并开始」，听四拍并跟着数字数拍；预备结束后节拍器会持续轻声打拍，，按谱面每个音的起点敲击。60 BPM 是每秒一拍，不评估最后一个音的保持时长。':'请读出谱面音名（C D E F G A B）；本关不考八度数字。'}</div><div id="sr-score" class="sr-score" aria-label="待识读的五线谱"></div><div id="sr-input">${level===5?'已输入：'+(input||'等待第一个音'):''}</div><div class="sr-answers">${level===4?'<label>速度 <select id="sr-bpm"><option>60</option><option>80</option><option>100</option></select> BPM</label><button id="sr-start" class="secondary-button">预备并开始</button><output id="sr-count" aria-live="polite">等待预备</output><button id="sr-tap" class="primary-button" disabled>敲一下（空格）</button><button id="sr-retry" class="secondary-button">重新敲</button>':(level===3?['2','3','4','5']:'CDEFGAB'.split('')).map(a=>`<button data-answer="${a}">${a}${level===3?' 度':''}</button>`).join('')}</div><div id="sr-feedback" role="status" aria-live="polite">${level===4?'先听四拍找到速度，再敲谱面节奏。每次重练都会重新预备；本组成绩只记录首次作答。':'可以用鼠标或键盘作答。'}</div><div class="sr-actions"><button id="sr-hint" class="secondary-button">看提示</button><button id="sr-next" class="primary-button" disabled>下一题 →</button></div><p class="sr-small" id="sr-storage">进度仅保存在本机；每组独立答对 8 题即可标记达标，所有阶段随时可选。</p></article><details class="sr-method"><summary>训练方法与下一步</summary><p>小音域地标 → 音程形状 → 节奏拆分 → 提前看谱。错题会进入本轮复习；看过提示的题不计入独立答对。先求准确，再逐步加速。</p><p>这些是原创识谱题，不是歌曲旋律。完成后到「歌曲与和弦库」，用共享播放器慢练真实曲谱。</p><p>方法参考：<a href="https://www.musictheory.net/exercises" target="_blank" rel="noreferrer">musictheory.net 的认音与音程训练</a>、<a href="https://teacherhub.abrsm.org/mod/page/view.php?id=1831" target="_blank" rel="noreferrer">ABRSM 的提前看谱建议</a>。分级及达标线为本应用练习设置。</p></details>`;
    host.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{misses=[];start(Number(b.dataset.level));});
    host.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(b.dataset.answer));
    host.querySelector('#sr-next').onclick=()=>{if(++round===10||review&&!misses.length)finish();else next();};
    host.querySelector('#sr-hint').onclick=()=>{hinted=true;feedback(level===4?'四分音符 1 拍，二分音符 2 拍，八分音符半拍。按每个符头的起点敲。':q.notes.map(n=>TheoryScore.describe(n.midi,n.step,q.clef)).join(' '));};
    if(level===4){const select=host.querySelector('#sr-bpm');select.value=String(bpmValue);select.onchange=()=>{bpmValue=Number(select.value);resetRhythm();};host.querySelector('#sr-start').onclick=beginRhythm;host.querySelector('#sr-tap').onclick=tap;host.querySelector('#sr-retry').onclick=()=>{answered=false;host.querySelector('#sr-next').disabled=true;host.querySelector('#sr-hint').disabled=false;resetRhythm();beginRhythm();};}
    score();
  }
  function feedback(s){host.querySelector('#sr-feedback').textContent=s;}
  function done(ok,detail){if(answered)return;countIn.stop({keepFeedback:true});rhythmState='idle';answered=true;if(!resultRecorded){if(ok&&!hinted)correct++;else misses.push(q);resultRecorded=true;}feedback(`${ok?'答对了':'再练一次就会更熟悉'}${hinted?'（本题使用过提示）':''}。${detail}`);host.querySelectorAll('[data-answer],#sr-start,#sr-tap,#sr-hint').forEach(b=>b.disabled=true);host.querySelector('#sr-next').disabled=false;host.querySelector('#sr-next').focus({preventScroll:true});}
  function answer(a){if(answered||host.querySelector('#sr-score')?.dataset.ready!=='true')return;input+=a;if(level===5){host.querySelector('#sr-input').textContent=`已输入：${input.split('').join(' · ')}（${input.length}/4）`;if(input.length<4)return;}done(input===q.answer,level===3?`相隔 ${q.answer} 度。`:`正确音名：${q.notes.map(n=>n.name).join(' → ')}。用时 ${((performance.now()-started)/1000).toFixed(1)} 秒。`);}
  function tap(){if(!soundEnabled||document.hidden||rhythmState!=='ready'||answered||host.querySelector('#sr-score')?.dataset.ready!=='true')return;const bpm=host.querySelector('#sr-bpm');bpm.disabled=true;taps.push(performance.now());countIn.tap();feedback(`已敲 ${taps.length} / ${q.beats.length} 次`);if(taps.length===q.beats.length){const r=M.rhythmResult(q.beats,taps,Number(bpm.value));done(r.ok,`平均间隔偏差 ${r.error}% 拍；每个间隔在 ±25% 拍内算通过。节奏时值：${q.beats.join('、')} 拍。`);}}
  function finish(){token++;if(!review){progress[level]={best:Math.max(Number(progress[level]?.best)||0,correct)};save();const levelButton=host.querySelector(`[data-level="${level}"]`);levelButton.querySelector('small').textContent=`0${level+1} ${progress[level].best>=8?'✓':''}`;levelButton.querySelector('span').textContent=`最佳 ${progress[level].best}/10`;}host.querySelector('.sr-card').innerHTML=`<h2>这一组完成了</h2><p>独立答对 ${correct} / ${round} 题。${correct>=8?'可以尝试下一个阶段。':'先慢下来，找到地标，再读下一音。'}</p><div class="sr-actions"><button id="sr-again" class="primary-button">再练一组</button>${misses.length?'<button id="sr-review" class="secondary-button">复习错题 / 提示题</button>':''}<button id="sr-forward" class="secondary-button">${level<5?'下一阶段':'回到第一阶段'}</button></div>`;host.querySelector('#sr-again').onclick=()=>{misses=[];start(level);};host.querySelector('#sr-forward').onclick=()=>{misses=[];start((level+1)%6);};const b=host.querySelector('#sr-review');if(b)b.onclick=()=>start(level,true);}
  document.addEventListener('keydown',e=>{if(!document.querySelector('#reading-view.active')||e.repeat||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(level===4&&e.code==='Space'){if(e.target.id==='sr-start'||e.target.id==='sr-retry'||e.target.id==='sr-next')return;e.preventDefault();if(rhythmState==='idle')beginRhythm();else tap();}else if(level!==4&&(level===3?/^[2-5]$/:/^[a-g]$/i).test(e.key)){e.preventDefault();answer(e.key.toUpperCase());}});
  document.addEventListener('chord:navigate',e=>{if(e.detail.view==='reading'){if(!q)start(0);else if(!answered){taps=[];render();}}else{token++;resetRhythm();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)resetRhythm('练习已暂停，请重新点击「预备并开始」。');});
  document.querySelector('#sound-toggle').addEventListener('click',()=>{if(!soundEnabled)resetRhythm('声音已关闭；打开声音后，请重新预备。');});
})();
