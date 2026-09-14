(function() {
  "use strict";
  const host=document.querySelector("#scales-workspace");
  let selected="c-major", hand="right", active=null;
  const instrument=ChordInstrument.create({
    canPlay:()=>soundEnabled && !document.hidden && document.querySelector("#scales-view.active"),
    onNotes:notes=>host.querySelectorAll("[data-scale-midi], [data-theory-pitch]").forEach(el=>el.classList.toggle("sounding",notes.includes(Number(el.dataset.scaleMidi ?? el.dataset.theoryPitch)))),
    onError:message=>{host.querySelector("#scale-status").textContent=message;}
  });
  function inspect(midi,name) {
    host.querySelectorAll("[data-scale-midi], [data-theory-pitch]").forEach(el=>el.classList.toggle("is-inspected",Number(el.dataset.scaleMidi ?? el.dataset.theoryPitch)===midi));
    const index=active.notes.indexOf(midi);
    host.querySelector("#scale-status").textContent=`${TheoryScore.describe(midi,name,active.kind)} ${hand==="right"?"右":"左"}手用 ${active.fingers[index]} 指。`;
  }
  function play(midi,name) {inspect(midi,name);instrument.stop();instrument.playChord([midi],.65);}
  function keyboard(scale) {
    const isBlack=midi=>[1,3,6,8,10].includes(midi%12);
    const low=scale.notes[0]-(isBlack(scale.notes[0])?1:0), high=scale.notes.at(-1)+(isBlack(scale.notes.at(-1))?1:0);
    const white=[],black=[];
    const names=["C","C♯","D","E♭","E","F","F♯","G","A♭","A","B♭","B"];
    for(let midi=low;midi<=high;midi++) {
      const isBlack=[1,3,6,8,10].includes(midi%12),index=scale.notes.indexOf(midi),chosen=index>=0;
      const label=chosen?scale.names[index]:names[midi%12];
      const fullName=chosen?TheoryScore.pitch(midi,label).name:`${label}${Math.floor(midi/12)-1}`;
      const key=`<button type="button" class="scale-key ${isBlack?"black":"white"} ${chosen?"selected":""}" style="left:${(white.length-(isBlack?.32:0))*48}px" ${chosen?`data-scale-midi="${midi}" aria-label="${fullName}，${hand==="right"?"右":"左"}手 ${scale.fingers[index]} 指"`:'disabled aria-hidden="true"'}>${chosen?`<b>${scale.fingers[index]}</b><span>${fullName}</span>`:""}</button>`;
      (isBlack?black:white).push(key);
    }
    return `<div class="scale-keyboard" style="width:${white.length*48}px">${white.join("")}${black.join("")}</div>`;
  }
  function render() {
    instrument.stop(); active=ScaleReference.get(selected,hand);
    host.innerHTML=`<header class="scale-heading"><span>PIANO / QUICK REFERENCE</span><h1>常用音阶速查</h1><p>先看谱，再找琴键。一次练一只手，从低音向高音慢慢弹。</p></header>
      <div class="scale-guide"><strong>指法怎么看？</strong><p>两只手都一样：<b>1 拇指 · 2 食指 · 3 中指 · 4 无名指 · 5 小指</b>。琴键上的大数字是推荐指法，下方是音名与八度编号；C4 是中央 C。</p><p>建议先练 C 大调 / A 自然小调，再按下方从左到右的顺序增加升降号；先分手慢练，声音均匀后再加速。</p><p>这里展示<strong>单八度上行</strong>，下行按相反顺序弹回。连续跨多个八度时，端点指法需要调整。左右手使用不同音区，先分别练熟。</p></div>
      <nav class="scale-picker" aria-label="选择音阶">${["major","minor"].map(type=>`<div><strong>${type==="major"?"常用大调":"自然小调"}</strong><div>${ScaleReference.scales.filter(s=>s.type===type).map(s=>`<button data-scale-id="${s.id}" aria-pressed="${selected===s.id}">${s.name}</button>`).join("")}</div></div>`).join("")}</nav>
      <article class="scale-sheet"><div class="scale-sheet-heading"><div><h2>${active.name}</h2><p>${active.type==="major"?"全 · 全 · 半 · 全 · 全 · 全 · 半":"全 · 半 · 全 · 全 · 半 · 全 · 全"}（全 = 两个半音，半 = 一个半音）</p></div><div class="scale-hands" role="group" aria-label="选择手别"><button data-hand="right" aria-pressed="${hand==="right"}">右手 · 高音谱</button><button data-hand="left" aria-pressed="${hand==="left"}">左手 · 低音谱</button></div></div>
      <p><strong>调号：</strong>${active.signature}。<strong>关系${active.type==="major"?"小":"大"}调：</strong><button type="button" class="scale-relative" data-scale-id="${active.relativeId}">${ScaleReference.scales.find(s=>s.id===active.relativeId).name}</button>（两者用相同的音，起点不同）。</p>
      ${active.names.includes("C♭")?"<p>C♭ 是把 C 降低半音，对应 B 白键；例如 C♭4 与 B3 是同一个琴键。</p>":""}
      <p>① 五线谱：音符下方标出级数与音名。升降号写在音符前，方便逐音认读。</p><div class="scale-scroll"><div id="scale-score"></div></div>
      <p>② 对应琴键：彩色琴键组成当前音阶；点击音符或琴键可以试听。</p><div class="scale-scroll">${keyboard(active)}</div>
      <p class="scale-sequence">上行指法：${active.names.map((name,i)=>`${name}〈${active.fingers[i]}〉`).join(" → ")}</p>
      <p id="scale-status" role="status">从左到右依次弹；手指自然弯曲，换指时轻轻穿指或跨指，保持声音均匀。</p></article>
      <p class="scale-source">收录 12 个大调与 12 个自然小调。自然小调不临时升高第 6、7 级；和声小调升高第 7 级，古典旋律小调上行升高第 6、7 级、下行还原，本页暂未展示这两种形式。参考熊道儿《初级钢琴音阶·和弦·琶音（修订版）》的<a href="https://www.sanmin.com.tw/product/index/001034675" target="_blank" rel="noopener noreferrer">公开目录与分手慢练建议</a>安排调性顺序；此处为单八度速查，并非书中两八度谱例的逐页复刻。指法采用常用单八度建议，可按手型和教师要求调整。指法参考：<a href="https://piano.org/theory/piano-fingering/" target="_blank" rel="noopener noreferrer">大调指法表</a> · <a href="https://www.pianoscales.org/minor.html" target="_blank" rel="noopener noreferrer">自然小调指法表</a> · <a href="https://pianoandsynth.com/how-to-play-the-b-flat-major-scale-on-a-piano-keyboard/" target="_blank" rel="noopener noreferrer">B♭ 大调起始指法</a>。</p>`;
    host.querySelectorAll("[data-scale-id]").forEach(button=>button.addEventListener("click",()=>{selected=button.dataset.scaleId;render();host.querySelector(`[data-scale-id="${selected}"]`).focus();}));
    host.querySelectorAll("[data-hand]").forEach(button=>button.addEventListener("click",()=>{hand=button.dataset.hand;render();host.querySelector(`[data-hand="${hand}"]`).focus();}));
    host.querySelectorAll("[data-scale-midi]").forEach(button=>{
      const midi=Number(button.dataset.scaleMidi),name=active.names[active.notes.indexOf(midi)];
      button.addEventListener("click",()=>play(midi,name));button.addEventListener("focus",()=>inspect(midi,name));button.addEventListener("mouseenter",()=>inspect(midi,name));
    });
    TheoryScore.render(host.querySelector("#scale-score"),active,{kind:active.kind,labelLayout:"stacked",onNote:play,onInspect:inspect});
  }
  document.addEventListener("chord:navigate",event=>{instrument.stop();if(event.detail.view==="scales")render();});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)instrument.stop();});
  document.querySelector("#sound-toggle").addEventListener("click",()=>instrument.stop());
})();
