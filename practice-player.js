(function(){
  "use strict";
  let study=JustTwoStudy;
  let key="chord-practice.just-two-learned.v1";
  let manual=[];
  try { const stored=JSON.parse(localStorage.getItem(key)); if(Array.isArray(stored))manual=stored.filter(id=>study.voicings[id]); } catch {}
  let host=null, focusChord="C7", osmd=null, entries=[], noteElements=[], token=0, renderToken=0, frame=0, timers=[], sources=[];
  let playing=false, position=0, began=0, origin=0, lastEntry=-1, audioClock=false, sourceReady=false;
  let countingIn=false,lastCountBeat=0,interruptedCountIn=false;
  let instrument=null,heldNotes=[],performedHarmony=null,inputMessage="";
  let floatingPanel=null,floatingFrame=0,floatingObserver=null;
  const settings={tempo:study.data.bpm,mode:"both",range:[0,study.totalTicks],loop:false,manualChord:false};
  const visible=()=>Boolean(host?.closest("[data-view-panel]")?.classList.contains("active"));
  const manualEnabled=()=>settings.manualChord&&Boolean(study.voicings[focusChord]);
  const learned=()=>new Set([...manual,...(study.voicings[focusChord]?[focusChord]:[])]);
  const escape=value=>String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;");
  const html=id=>escape(study.voicings[id].label).replace(/^([A-G](?:♭|♯)?)([^/]*)(.*)$/,(_,root,suffix,bass)=>`${root}${suffix?`<sup>${suffix}</sup>`:""}${bass}`);
  const ranges=()=>({full:[0,study.totalTicks],first:[0,Math.ceil(study.barCount/2)*16],last:[Math.ceil(study.barCount/2)*16,study.totalTicks],opening:[0,16]});
  const tempoOptions=()=>[study.data.bpm,Math.round(study.data.bpm*.75),Math.round(study.data.bpm*.625)];
  function selectStudy(chord){
    const next=PracticeCatalog.forSong(chord.song);if(!next)return false;
    if(next!==study){
      study=next;key=study.config.id==="just-two"?"chord-practice.just-two-learned.v1":`chord-practice.${study.config.id}-learned.v1`;manual=[];
      try{const stored=JSON.parse(localStorage.getItem(key));if(Array.isArray(stored))manual=stored.filter(id=>study.voicings[id]);}catch{}
    }
    return true;
  }
  const notesHtml=()=>Object.keys(study.voicings).map(id=>`<button type="button" class="jt-known ${learned().has(id)?"is-known":""} ${id===focusChord?"is-focus":""}" data-jt-known="${id}" aria-pressed="${learned().has(id)}" ${id===focusChord?'disabled title="本课和弦，始终高亮"':""}>${learned().has(id)?"✓ ":"＋ "}${html(id)}${id===focusChord?'<small>本课</small>':""}</button>`).join("");
  function render(chord){
    if(!selectStudy(chord))return "";
    focusChord=chord.id;settings.manualChord=false;
    return `<section class="jt-study" id="${PracticeCatalog.anchor(study)}" aria-labelledby="jt-title">
      <div class="jt-heading"><span class="eyebrow">建议练习 · ${escape(study.config.sectionLabel)}节选</span><h3 id="jt-title">${escape(study.config.song)}</h3><p>${escape(study.config.description)}</p><div class="jt-meta"><span>${study.barCount} 小节</span><span>4 / 4 拍</span><span>♩ = ${study.data.bpm}</span><span>约 ${Math.round(study.data.beats*60/study.data.bpm)} 秒</span><span>${escape(study.config.tuning)}</span></div></div>
      <div class="jt-learning"><div><strong>标出你学过的和弦</strong><small>已学的和弦与属于它的旋律音会变绿；点代号可增减标记。</small></div><div class="jt-known-list">${notesHtml()}</div><p class="jt-learning-note">${!study.voicings[chord.id] ? `这段${escape(study.config.sectionLabel)}中没有 ${escape(chord.id)}，所以不会把其他和弦误标成本课和弦。可以先在上面的键盘练习，再认识谱里实际出现的和弦。` : "本课和弦会自动选中，切换课程时同步更新。其余和弦学过后可自行标记。"}</p></div>
      <div class="jt-controls"><button class="primary-button" data-jt-play>▶ 播放练习</button><button class="secondary-button" data-jt-stop disabled>回到开头</button>
        <label>听哪只手<select data-jt-mode><option value="both">双手合奏</option><option value="right">只听右手旋律</option><option value="left">只听左手和弦</option></select></label>
        <label>速度<select data-jt-tempo>${tempoOptions().map((bpm,i)=>`<option value="${bpm}">${[study.config.tempoLabel||"原速","慢练","更慢"][i]} · ${bpm}</option>`).join("")}</select></label>
        <label>练习范围<select data-jt-range><option value="full">全部 ${study.barCount} 小节</option><option value="first">第 1–${Math.ceil(study.barCount/2)} 小节</option><option value="last">第 ${Math.ceil(study.barCount/2)+1}–${study.barCount} 小节</option><option value="opening">第 1 小节 · ${study.harmony.filter(h=>h.start<16).map(h=>escape(study.voicings[h.chord].label)).join(" → ")}</option></select></label><label class="jt-loop"><input type="checkbox" data-jt-loop> 循环练习</label>
      </div>
      <div class="jt-participation">
        <label class="jt-manual-toggle"><input type="checkbox" data-jt-manual ${settings.manualChord&&study.voicings[chord.id]?"checked":""} ${study.voicings[chord.id]?"":"disabled"} aria-describedby="jt-manual-help">手动演奏本课和弦 <b>${chord.html}</b></label>
        <p id="jt-manual-help">${study.voicings[chord.id]?"开启后，本课和弦的左手伴奏会留空，旋律照常向前。按钮亮起时，点一下补上和弦，或用 MIDI 键盘弹出组成音。":`这段练习没有 ${escape(chord.id)}，暂时没有需要接手的部分。`}</p>
        <div class="jt-manual-actions" ${settings.manualChord&&study.voicings[chord.id]?"":"hidden"}>
          <button type="button" class="jt-perform" data-jt-perform aria-label="演奏 ${chord.name}" aria-describedby="jt-manual-cue"><span>弹奏</span><strong>${chord.html}</strong><small>点击 / Enter / 空格</small></button>
          <div class="jt-manual-guidance"><p id="jt-manual-cue" role="status">可先点按钮试弹，再开始播放。</p><div class="jt-input-notes" aria-label="本课和弦组成音">${(study.voicings[chord.id]?.notes||[]).map((midi,i)=>`<span data-jt-input-note="${midi%12}">${study.voicings[chord.id].names[i]}</span>`).join("")}</div><p class="jt-input-feedback" role="status"></p></div>
          <div class="jt-midi"><button type="button" class="secondary-button" data-jt-midi>连接 MIDI 键盘</button><p class="jt-midi-status" role="status">也可以直接点击左侧演奏按钮。</p></div>
        </div>
      </div>
      <div class="jt-live" aria-live="polite"><span class="jt-position">准备好了 · 播放前有 4 拍预备</span><strong class="jt-current-chord">${escape(study.voicings[study.harmony[0].chord].label)}</strong><span class="jt-current-note">先播放一遍，听听旋律的起伏。</span><div class="jt-count-in" hidden aria-label="四拍预备">${[1,2,3,4].map(beat=>`<span data-jt-count-beat="${beat}">${beat}</span>`).join("")}<small>跟着数，第 4 拍之后开始</small></div></div>
      <div class="jt-legend"><span><i class="learned"></i>学过的和弦及其组成音</span><span><i class="playing"></i>播放位置</span><span>其余旋律音保持深色</span></div>
      <div class="jt-score-scroll"><div id="jt-score" class="jt-score"><p class="jt-loading">正在排练习谱…</p></div></div>
      <p class="jt-score-help">上行五线谱：右手旋律。下行五线谱：左手和弦。♭ 表示向左移到紧邻的琴键，♯ 表示向右移；长弧线连着相同音时，保持按住。</p>
      <details class="jt-note-guide"><summary>不熟悉五线谱？展开音名与分句练习</summary><div class="jt-phrase-list">${Array.from({length:study.barCount},(_,bar)=>`<div class="jt-phrase" data-jt-bar="${bar}"><button data-jt-seek="${bar*16}">第 ${bar+1} 小节 <span>▶ 从这里听</span></button><p>${study.harmony.filter(h=>h.start>=bar*16&&h.start<(bar+1)*16).map(h=>`<b data-jt-chord="${h.chord}">${html(h.chord)}</b>`).join(" → ")}</p><div>${study.data.melody.filter(n=>n.start>=bar*16&&n.start<(bar+1)*16).map(n=>`<button data-jt-note="${n.id}" title="试听这个音">${study.noteName(n.midi,study.chordAt(n.start).chord)}</button>`).join("")}</div></div>`).join("")}</div></details>
      <div class="jt-tips"><p><b>01 · 先找旋律</b>选“只听右手旋律”，用慢速跟着音名找键。先保留音的先后和长短。</p><p><b>02 · 再加左手</b>左手每次一起按下谱上的和弦音。跨度不舒服时，可以先只弹最低音。</p><p><b>03 · 听和弦里的音</b>绿色旋律音也是当前已学和弦的组成音。留意旋律如何停留、离开，再回到这些音。</p></div>
      <details class="jt-source"><summary>旋律来源与简化说明</summary><p>${escape(study.config.simplification)}</p><p>谱面与练习播放使用同一份音符数据，绿色只标出选中的和弦及当时属于它的旋律音。</p><a href="${escape(study.data.source.url)}" target="_blank" rel="noopener">${escape(study.config.sourceLabel)} ↗</a><small>${escape(study.config.sourceNotice)}</small></details>
      <div class="jt-bottom"><button class="text-button" data-jt-download>下载这份练习谱 · MusicXML ↓</button><span class="jt-save-status" role="status"></span></div>
    </section>`;
  }
  function updateKnown(){
    if(!host)return;
    const known=learned();
    host.querySelector(".jt-known-list").innerHTML=notesHtml();
    host.querySelectorAll("[data-jt-known]").forEach(button=>button.addEventListener("click",()=>{
      const id=button.dataset.jtKnown;if(id===focusChord)return;
      pause();
      manual=manual.includes(id)?manual.filter(x=>x!==id):[...manual,id];
      try{localStorage.setItem(key,JSON.stringify(manual));}catch{host.querySelector(".jt-save-status").textContent="当前标记可用，但暂时无法保存到设备。";}
      updateKnown();renderScore();
    }));
    host.querySelectorAll("[data-jt-chord]").forEach(el=>el.classList.toggle("is-known",known.has(el.dataset.jtChord)));
    host.querySelectorAll("[data-jt-note]").forEach(el=>{
      const n=study.data.melody.find(n=>n.id===el.dataset.jtNote),h=study.chordAt(n.start);
      el.classList.toggle("is-known",known.has(h.chord)&&study.related(n.midi,h.chord));
    });
  }
  async function renderScore(){
    if(!visible())return;
    const current=++renderToken;
    sourceReady=false; entries=[]; noteElements=[];lastEntry=-1;
    osmd?.cursor?.hide();osmd=null;
    const container=host.querySelector("#jt-score");
    container.innerHTML='<p class="jt-loading">正在排练习谱…</p>';
    const OSMD=window.opensheetmusicdisplay?.OpenSheetMusicDisplay||window.OpenSheetMusicDisplay;
    if(!OSMD){container.innerHTML='<p class="jt-loading">谱面库暂未加载。可先展开下方音名练习，或下载 MusicXML 乐谱。</p>';return;}
    try{
      container.innerHTML="";
      const score=new OSMD(container,{autoResize:false,backend:"svg",drawingParameters:"compacttight",drawTitle:false,drawComposer:false,drawPartNames:false,drawMeasureNumbers:true,newSystemFromXML:true,coloringEnabled:true,colorStemsLikeNoteheads:true,coloringMode:0,autoBeam:true,followCursor:false,cursorsOptions:[{type:0,color:"#e97436",alpha:.22,follow:false}]});
      await score.load(study.musicXml(learned(),settings.tempo));
      if(current!==renderToken||!container.isConnected)return;
      score.EngravingRules.RenderXMeasuresPerLineAkaSystem=2;
      score.render();score.enableOrDisableCursors(true);
      // OSMD 1.9.9 reads note colors but doesn't apply <harmony color> to labels.
      container.querySelectorAll("svg text").forEach(text=>{
        const id=study.labelId(text.textContent);
        if(id){text.textContent=study.voicings[id].label;text.setAttribute("fill",learned().has(id)?study.colors.learned:study.colors.ink);text.setAttribute("font-weight",learned().has(id)?"700":"500");text.setAttribute("data-jt-score-chord",id);}
      });
      osmd=score;
      const cursor=score.cursor;cursor.reset();
      let guard=0;
      while(!cursor.Iterator.EndReached && guard++<2000){
        const tick=Math.round(cursor.Iterator.currentTimeStamp.RealValue*16);
        const elements=cursor.GNotesUnderCursor().flatMap(n=>typeof n.getNoteheadSVGs === "function" ? n.getNoteheadSVGs() : []);
        elements.forEach(el=>el.classList.add("jt-notehead"));
        entries.push({tick,elements});cursor.next();
      }
      cursor.reset();cursor.hide();sourceReady=true;
      paint(settings.range[0]+position);
    }catch(error){
      if(current!==renderToken)return;
      console.warn("Practice score rendering failed",error);
      container.innerHTML='<p class="jt-loading">五线谱暂时无法显示。可使用下方音名练习，或下载 MusicXML 乐谱。</p>';
    }
  }
  function clearSound(){
    token++;cancelAnimationFrame(frame);timers.forEach(clearTimeout);timers=[];
    sources.forEach(source=>{try{source.pause?source.pause():source.stop();}catch{}});sources=[];
    hideCountIn();
    instrument?.stop();
  }
  function elapsed(){return audioClock?context().currentTime:performance.now()/1000;}
  const countBeat=()=>Math.min(4,Math.max(1,Math.floor((elapsed()-(began-4*60/settings.tempo))/(60/settings.tempo))+1));
  function hideCountIn(){
    countingIn=false;lastCountBeat=0;
    if(host){host.querySelector(".jt-count-in").hidden=true;host.querySelector(".jt-live").classList.remove("is-counting");}
  }
  function paintCountIn(){
    if(!host)return;
    const beat=countBeat();
    if(beat!==lastCountBeat){
      lastCountBeat=beat;
      host.querySelector(".jt-count-in").hidden=false;host.querySelector(".jt-live").classList.add("is-counting");
      host.querySelector(".jt-position").textContent=`预备拍 · ${beat} / 4`;
      const first=study.chordAt(settings.range[0]+origin),label=host.querySelector(".jt-current-chord");
      label.textContent=study.voicings[first.chord].label;label.classList.toggle("is-known",learned().has(first.chord));
      host.querySelectorAll("[data-jt-count-beat]").forEach(el=>{
        const active=Number(el.dataset.jtCountBeat)===beat;
        el.classList.toggle("is-current",active);el.classList.toggle("is-counted",Number(el.dataset.jtCountBeat)<beat);
        if(active)el.setAttribute("aria-current","true");else el.removeAttribute("aria-current");
      });
      updateManual();
    }
  }
  function scheduleCountBeat(beat,delay,currentToken){
    if(location.protocol==="file:"){scheduleNote(beat===0?84:81,.07,delay,.035,currentToken);return;}
    const ctx=context(),oscillator=ctx.createOscillator(),gain=ctx.createGain(),start=ctx.currentTime+delay;
    oscillator.type="sine";oscillator.frequency.value=beat===0?1200:850;
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(beat===0?.16:.1,start+.003);gain.gain.exponentialRampToValueAtTime(.0001,start+.065);
    oscillator.connect(gain);gain.connect(pianoOutput);sources.push(oscillator);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();sources=sources.filter(source=>source!==oscillator);};
    oscillator.start(start);oscillator.stop(start+.08);
  }
  function queueFloating(){
    if(floatingPanel&&!floatingFrame)floatingFrame=requestAnimationFrame(()=>{floatingFrame=0;positionFloating();});
  }
  function positionFloating(){
    if(!floatingPanel||!host)return;
    const original=host.querySelector("[data-jt-perform]");
    const rect=original.getBoundingClientRect?.(),height=window.innerHeight,width=window.innerWidth;
    const active=manualEnabled()&&!document.hidden&&visible();
    const outside=rect&&(rect.bottom<=16||rect.top>=height-16||rect.right<=0||rect.left>=width);
    const show=active&&outside;
    if(!show){
      if(floatingPanel.contains(document.activeElement)&&active)original.focus({preventScroll:true});
      floatingPanel.hidden=true;return;
    }
    floatingPanel.hidden=false;
    const main=document.querySelector(".app-main").getBoundingClientRect();
    const lesson=host.getBoundingClientRect();
    const list=host.closest("#learn-view")?document.querySelector("#chord-list"):null;
    const railLeft=Math.max(main.left+16,(list?.getBoundingClientRect().left||main.left+16));
    const railBottom=list?.lastElementChild?.getBoundingClientRect().bottom||0;
    const room=lesson.left-railLeft-24;
    floatingPanel.classList.remove("is-compact");
    floatingPanel.style.width=`${Math.min(210,Math.max(160,room))}px`;
    const dockHeight=floatingPanel.offsetHeight||230;
    const top=Math.max(20,(height-dockHeight)/2,railBottom+20);
    if(room>=160&&top+dockHeight<height-16){
      floatingPanel.style.left=`${railLeft+(room-Math.min(210,room))/2}px`;
      floatingPanel.style.top=`${top}px`;floatingPanel.style.bottom="auto";
    }else{
      // Narrow layouts have no empty column; stay above the mobile navigation.
      floatingPanel.classList.add("is-compact");
      const left=Math.max(12,main.left+12),nav=document.querySelector(".mobile-nav").getBoundingClientRect();
      floatingPanel.style.width=`${Math.min(360,width-left-12)}px`;
      floatingPanel.style.left=`${left}px`;floatingPanel.style.top="auto";
      floatingPanel.style.bottom=`${Math.max(12,nav.height>0?height-nav.top+12:12)}px`;
    }
  }
  function mountFloating(chord){
    floatingPanel=document.createElement("aside");floatingPanel.className="jt-floating-performer";floatingPanel.hidden=true;
    floatingPanel.setAttribute("aria-label","本课和弦演奏");
    floatingPanel.innerHTML=`<span class="jt-floating-label">本课和弦 · 跟着弹</span><button type="button" class="jt-perform" data-jt-floating-perform aria-label="演奏 ${chord.name}" aria-describedby="jt-floating-cue"><span>弹奏</span><strong>${chord.html}</strong><small>点击 / Enter / 空格</small></button><p id="jt-floating-cue"></p>`;
    document.body.appendChild(floatingPanel);
    floatingPanel.querySelector("button").addEventListener("click",performChord);
    floatingPanel.querySelector("button").addEventListener("keydown",event=>{if(event.repeat&&(event.key===" "||event.key==="Enter"))event.preventDefault();});
    window.addEventListener("scroll",queueFloating,{passive:true,capture:true});
    window.addEventListener("resize",queueFloating,{passive:true});
    if(window.ResizeObserver){floatingObserver=new window.ResizeObserver(queueFloating);floatingObserver.observe(host);}
    queueFloating();
  }
  function disposeFloating(){
    cancelAnimationFrame(floatingFrame);floatingFrame=0;floatingObserver?.disconnect();floatingObserver=null;
    window.removeEventListener?.("scroll",queueFloating,true);window.removeEventListener?.("resize",queueFloating);
    floatingPanel?.remove();floatingPanel=null;
  }
  function syncFloating(button,cue){
    if(!floatingPanel)return;
    const floatingButton=floatingPanel.querySelector("button");
    floatingButton.disabled=button.disabled;floatingButton.className=button.className;
    const label=floatingPanel.querySelector("#jt-floating-cue");if(label.textContent!==cue)label.textContent=cue;
    if(floatingPanel.dataset.enabled!==String(manualEnabled())){
      floatingPanel.dataset.enabled=String(manualEnabled());queueFloating();
    }
    if(!manualEnabled()||document.hidden)floatingPanel.hidden=true;
  }
  function currentTick(){
    const at=playing?origin+Math.max(0,elapsed()-began)*settings.tempo/60*4:position;
    return Math.min(settings.range[1],settings.range[0]+at);
  }
  function manualFeedback(){
    if(!host)return;
    const v=study.voicings[focusChord],pcs=new Set(heldNotes.map(n=>n%12));
    host.querySelectorAll("[data-jt-input-note]").forEach(el=>el.classList.toggle("is-held",pcs.has(Number(el.dataset.jtInputNote))));
    const feedback=host.querySelector(".jt-input-feedback");
    if(!pcs.size||!v){feedback.textContent=inputMessage;return;}
    const missing=v.notes.filter(n=>!pcs.has(n%12)),extra=[...pcs].filter(pc=>!study.related(pc,focusChord));
    feedback.textContent=extra.length?`你还弹了 ${extra.map(n=>study.noteName(n,focusChord)).join("、")}；试着只保留上面的组成音。`:missing.length?`已弹 ${[...pcs].map(n=>study.noteName(n,focusChord)).join("、")}，还差 ${missing.map(n=>study.noteName(n,focusChord)).join("、")}。`:`${v.label} 的音齐了。`;
    if(!missing.length&&!extra.length&&playing&&elapsed()>=began){
      const h=study.chordAt(currentTick());
      if(h?.chord===focusChord)performedHarmony=h.id;
    }
  }
  function updateManual(tick=currentTick()){
    if(!host)return;
    const enabled=manualEnabled(),v=study.voicings[focusChord];
    host.querySelector(".jt-manual-actions").hidden=!enabled;
    const button=host.querySelector("[data-jt-perform]");button.disabled=!enabled||!soundEnabled;
    host.querySelector("[data-jt-midi]").disabled=!enabled;
    const h=study.chordAt(tick),due=enabled&&playing&&elapsed()>=began&&h?.chord===focusChord;
    button.classList.toggle("is-due",Boolean(due));
    button.classList.toggle("is-played",Boolean(due&&performedHarmony===h.id));
    if(!enabled){syncFloating(button,"");return;}
    let cue="可先点按钮试弹，再开始播放。";
    if(!soundEnabled)cue="先打开右上角的声音。";
    else if(countingIn)cue=`预备拍 · ${countBeat()} / 4，准备好 ${v.label}。`;
    else if(due)cue=performedHarmony===h.id?`已补上 ${v.label}，跟着旋律继续。`:`轮到你了 · 弹 ${v.label}`;
    else if(playing){
      const next=study.harmony.find(item=>item.chord===focusChord&&item.start>=tick&&item.start<settings.range[1]);
      cue=next?`再过 ${Math.max(1,Math.ceil((next.start-tick)/4))} 拍，准备弹 ${v.label}。`:"这一段你的部分已结束，继续听旋律。";
    }
    if(!study.harmony.some(item=>item.chord===focusChord&&item.start<settings.range[1]&&item.start+item.duration>settings.range[0]))cue="当前范围没有本课和弦，可以换个练习范围。";
    const label=host.querySelector("#jt-manual-cue");if(label.textContent!==cue)label.textContent=cue;
    syncFloating(button,cue);
  }
  function performChord(){
    if(!manualEnabled()||!soundEnabled||!instrument)return;
    const tick=currentTick(),h=study.chordAt(tick),quarter=60/settings.tempo;
    const duration=playing&&h?.chord===focusChord?Math.max(.12,(h.start+h.duration-tick)/4*quarter):2*quarter;
    inputMessage="";instrument.playChord(study.voicings[focusChord].notes,duration);
  }
  function pause(){
    const wasCounting=countingIn;
    if(playing)interruptedCountIn=wasCounting;
    if(playing)position=currentTick()-settings.range[0];
    playing=false;clearSound();
    if(host?.isConnected){host.querySelector("[data-jt-play]").textContent=position>0?"▶ 继续播放":"▶ 播放练习";host.querySelector("[data-jt-stop]").disabled=position===0;}
    if(wasCounting)paint(settings.range[0]+position);
    updateManual();
  }
  function reset(){pause();position=0;lastEntry=-1;osmd?.cursor?.reset();osmd?.cursor?.hide();noteElements.forEach(el=>el.classList.remove("jt-playing-note"));noteElements=[];if(host?.isConnected){host.querySelector("[data-jt-play]").textContent="▶ 播放练习";host.querySelector("[data-jt-stop]").disabled=true;paint(settings.range[0]);}}
  function dispose(){pause();disposeFloating();instrument?.dispose();instrument=null;heldNotes=[];performedHarmony=null;inputMessage="";renderToken++;osmd?.cursor?.hide();osmd=null;entries=[];host=null;position=0;}
  function scheduleNote(midi,duration,delay,volume,currentToken){
    const sample=nearestPianoSample(midi);
    if(location.protocol==="file:"){
      timers.push(setTimeout(()=>{
        if(currentToken!==token||!soundEnabled)return;
        const audio=new Audio(`assets/piano/${sample.file}`);audio.playbackRate=2**((midi-sample.midi)/12);audio.preservesPitch=false;audio.volume=Math.min(1,volume*3);sources.push(audio);
        audio.play().catch(()=>{pause();if(host)host.querySelector(".jt-position").textContent="声音未能播放，请重试。";});
        timers.push(setTimeout(()=>audio.pause(),duration*1000));
      },delay*1000));return;
    }
    const ctx=context(),source=ctx.createBufferSource(),gain=ctx.createGain();
    const start=ctx.currentTime+delay;
    source.buffer=pianoSamples.get(sample.midi);source.playbackRate.value=2**((midi-sample.midi)/12);
    gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(volume*1.6,start+.008);gain.gain.setTargetAtTime(.0001,start+Math.max(.04,duration-.07),.04);
    source.connect(gain);gain.connect(pianoOutput);sources.push(source);source.onended=()=>{source.disconnect();gain.disconnect();sources=sources.filter(s=>s!==source);};source.start(start);source.stop(start+duration+.22);
  }
  async function play(options={}){
    if(playing){pause();return;}
    if(!host)return;
    if(!soundEnabled){host.querySelector(".jt-position").textContent="先打开右上角的声音，再播放。";return;}
    clearSound();const currentToken=token;
    const button=host.querySelector("[data-jt-play]");button.disabled=true;button.textContent="音色准备中…";
    try{
      audioClock=location.protocol!=="file:";
      if(audioClock){const ctx=context();if(ctx.state==="suspended")await ctx.resume();await loadPianoSamples();if(!pianoSamples.size||ctx.state!=="running")throw Error("钢琴音色未加载好，请稍后重试。");}
      if(currentToken!==token||!host?.isConnected)return;
      const duration=settings.range[1]-settings.range[0];if(position>=duration)position=0;
      const quarter=60/settings.tempo;
      const withCountIn=options.countIn??(position===0||interruptedCountIn);
      interruptedCountIn=false;
      const lead=.08+(withCountIn?4*quarter:0);
      const events=study.playbackEvents(settings.mode,[settings.range[0]+position,settings.range[1]],manualEnabled()?focusChord:null);
      performedHarmony=null;
      playing=true;origin=position;began=elapsed()+lead;countingIn=withCountIn;
      if(withCountIn){osmd?.cursor?.hide();noteElements.forEach(el=>el.classList.remove("jt-playing-note"));noteElements=[];lastEntry=-1;for(let beat=0;beat<4;beat++)scheduleCountBeat(beat,.08+beat*quarter,currentToken);}
      events.forEach(event=>event.notes.forEach(midi=>scheduleNote(midi,event.duration/4*quarter,event.start/4*quarter+lead,event.hand==="right"?.12:.047,currentToken)));
      button.textContent="Ⅱ 暂停";host.querySelector("[data-jt-stop]").disabled=false;
      const tick=()=>{
        if(!playing||currentToken!==token)return;
        if(countingIn&&elapsed()<began){paintCountIn();frame=requestAnimationFrame(tick);return;}
        if(countingIn)hideCountIn();
        const at=origin+Math.max(0,elapsed()-began)/quarter*4;
        if(at>=duration){playing=false;clearSound();position=0;lastEntry=-1;osmd?.cursor?.reset();updateManual();if(settings.loop){play({countIn:false});return;}button.textContent="▶ 再听一遍";host.querySelector(".jt-position").textContent="这一段播放完成";noteElements.forEach(el=>el.classList.remove("jt-playing-note"));noteElements=[];osmd?.cursor?.hide();return;}
        position=at;paint(settings.range[0]+at);frame=requestAnimationFrame(tick);
      };tick();
    }catch(error){if(currentToken===token&&host){playing=false;clearSound();host.querySelector(".jt-position").textContent=error.message;button.textContent="▶ 重试播放";}}
    finally{button.disabled=false;}
  }
  function paint(tick){
    if(!host)return;
    if(countingIn){paintCountIn();return;}
    updateManual(tick);
    const slot=Math.min(study.totalTicks-.001,Math.max(0,tick)),h=study.chordAt(slot),v=study.voicings[h.chord];
    const n=study.data.melody.find(n=>slot>=n.start&&slot<n.start+n.duration);
    host.querySelector(".jt-position").textContent=`第 ${Math.floor(slot/16)+1} 小节 · 第 ${Math.floor(slot%16/4)+1} 拍`;
    const label=host.querySelector(".jt-current-chord");label.textContent=v.label;label.classList.toggle("is-known",learned().has(h.chord));
    host.querySelector(".jt-current-note").textContent=n?`旋律 ${study.noteName(n.midi,h.chord)} · ${study.related(n.midi,h.chord)?"也是当前和弦的组成音":"连接和弦音的旋律色彩"}`:"旋律稍作停顿，听听左手的和弦。";
    host.querySelectorAll("[data-jt-bar]").forEach(el=>el.classList.toggle("is-playing",playing&&Number(el.dataset.jtBar)===Math.floor(slot/16)));
    host.querySelectorAll("[data-jt-note]").forEach(el=>el.classList.toggle("is-playing",playing&&n?.id===el.dataset.jtNote));
    if(!sourceReady||!osmd?.cursor)return;
    let index=0;while(index+1<entries.length&&entries[index+1].tick<=slot+.001)index++;
    if(index!==lastEntry){
      if(lastEntry<0||index<lastEntry){osmd.cursor.reset();lastEntry=0;}
      while(lastEntry<index){osmd.cursor.next();lastEntry++;}
      noteElements.forEach(el=>el.classList.remove("jt-playing-note"));
      noteElements=entries[index]?.elements||[];
      if(playing)noteElements.forEach(el=>el.classList.add("jt-playing-note"));
    }
    if(playing)osmd.cursor.show();
  }
  function mount(chord,container=document){
    dispose();if(!selectStudy(chord))return;
    host=container.querySelector(".jt-study");if(!host)return;
    focusChord=chord.id;position=0;settings.range=[0,study.totalTicks];settings.mode="both";settings.tempo=study.data.bpm;settings.loop=false;
    const mountedHost=host;
    mountFloating(chord);
    instrument=ChordInstrument.create({
      canPlay:()=>host===mountedHost&&host.isConnected&&manualEnabled()&&soundEnabled&&!document.hidden&&visible(),
      onNotes:notes=>{if(host!==mountedHost)return;heldNotes=notes;manualFeedback();updateManual();},
      onStatus:message=>{if(host===mountedHost)host.querySelector(".jt-midi-status").textContent=message;},
      onError:message=>{if(host===mountedHost){inputMessage=message;manualFeedback();}}
    });
    updateManual();
    updateKnown();renderScore();
    host.querySelector("[data-jt-manual]").addEventListener("change",event=>{
      const resume=playing;pause();settings.manualChord=event.target.checked;performedHarmony=null;inputMessage="";manualFeedback();updateManual();if(resume)play();
    });
    host.querySelector("[data-jt-perform]").addEventListener("click",performChord);
    host.querySelector("[data-jt-perform]").addEventListener("keydown",event=>{if(event.repeat&&(event.key===" "||event.key==="Enter"))event.preventDefault();});
    host.querySelector("[data-jt-midi]").addEventListener("click",()=>instrument.connect());
    host.querySelector("[data-jt-play]").addEventListener("click",play);
    host.querySelector("[data-jt-stop]").addEventListener("click",reset);
    host.querySelector("[data-jt-mode]").addEventListener("change",event=>{pause();settings.mode=event.target.value;});
    host.querySelector("[data-jt-tempo]").addEventListener("change",event=>{pause();settings.tempo=Number(event.target.value);renderScore();});
    host.querySelector("[data-jt-range]").addEventListener("change",event=>{reset();settings.range=ranges()[event.target.value];paint(settings.range[0]);});
    host.querySelector("[data-jt-loop]").addEventListener("change",event=>settings.loop=event.target.checked);
    host.querySelectorAll("[data-jt-seek]").forEach(button=>button.addEventListener("click",()=>{
      pause();settings.range=[0,study.totalTicks];host.querySelector("[data-jt-range]").value="full";position=Number(button.dataset.jtSeek);play({countIn:true});
    }));
    host.querySelectorAll("[data-jt-note]").forEach(button=>button.addEventListener("click",()=>{
      pause();const n=study.data.melody.find(n=>n.id===button.dataset.jtNote);paint(n.start);window.ChordLearning?.playNotes([n.midi],.8);
    }));
    host.querySelector("[data-jt-download]").addEventListener("click",()=>{
      const url=URL.createObjectURL(new Blob([study.musicXml(learned(),settings.tempo)],{type:"application/vnd.recordare.musicxml+xml"}));
      const anchor=document.createElement("a");anchor.href=url;anchor.download=`${study.config.id}-local-study.musicxml`;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
  }
  document.addEventListener("chord:navigate",event=>{if(!visible()){pause();if(floatingPanel)floatingPanel.hidden=true;}else if(host&&!sourceReady)renderScore();queueFloating();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)pause();queueFloating();});
  document.querySelector("#sound-toggle").addEventListener("click",()=>{if(!soundEnabled)pause();updateManual();});
  window.PracticePlayer={render,mount,dispose};
  // Keep the original entry point for saved links and older integrations.
  window.JustTwoPractice=window.PracticePlayer;
  function openFromLink(){
    const target=PracticeCatalog.fromAnchor(location.hash);if(!target)return;
    navigate("learn");
    if(study!==target||!host)selectLesson(target.config.defaultLesson,target.config.song);
    requestAnimationFrame(()=>host?.scrollIntoView({block:"start"}));
  }
  window.addEventListener("hashchange",openFromLink);
  selectLesson(document.querySelector(".chord-item.active")?.dataset.chordId||"Cmaj7");
  openFromLink();
})();
