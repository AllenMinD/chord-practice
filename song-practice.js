(function(){
  'use strict';
  const workspace=document.querySelector('#songs-workspace');
  const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  let ownsPlayer=false;
  const route=()=>location.hash.startsWith('#songs/')?location.hash.slice(7):'';
  function release(){
    PracticePlayer.dispose();
    document.querySelectorAll('.jt-study').forEach(node=>node.remove());
  }
  function show(){
    release();ownsPlayer=true;
    const id=route(),study=PracticeCatalog.studies.find(item=>item.config.id===id);
    if(!study){
      workspace.innerHTML=`<div class="section-title"><div><span class="eyebrow">实战练习</span><h1>乐曲练习</h1><p>选一首歌，从一个短句开始。先听旋律，再慢慢加入左手。</p></div><span>${PracticeCatalog.studies.length} 首练习曲</span></div>${id?'<p role="status">没有找到这首乐曲，请从列表重新选择。</p>':''}<div class="song-practice-intro"><b>每一首，都有自己的练习页</b><p>双手五线谱与和弦代号 · 分手试听 · 慢速循环 · 点小节起播</p><small>目前提供短节选，具体小节与改编说明见各曲页面。曲目会持续添加。</small></div><div class="song-practice-grid">${[...PracticeCatalog.studies].sort((a,b)=>(b.config.id==='fenlie')-(a.config.id==='fenlie')).map(s=>`<a class="song-practice-card" href="#songs/${s.config.id}"><span class="song-practice-level">${s.config.id==='fenlie'?'新曲 · 两个白键起步':'短句练习'} · ${s.barCount} 小节</span><h2>${escape(s.config.song)}</h2><p>${escape(s.config.artist||chords.find(c=>c.song===s.config.song)?.artist||'')}</p><small>${escape(s.config.sectionLabel)} · ${escape(s.config.tuning)}</small><div>${Object.values(s.voicings).map(v=>`<span>${escape(v.label)}</span>`).join('')}</div><strong>打开练习 →</strong></a>`).join('')}</div>`;
      document.title='乐曲练习 · CHORD';return;
    }
    const focus=study.config.defaultLesson;
    workspace.innerHTML=`<a class="song-practice-back" href="#songs">← 全部乐曲</a><div class="section-title"><div><span class="eyebrow">乐曲练习 · ${escape(study.config.artist||'钢琴')}</span><h1>${escape(study.config.song)}</h1><p>${escape(study.config.sectionLabel)} · ${study.barCount} 小节节选，循序渐进地练。</p></div></div><div class="song-practice-intro"><b>先听一遍，再动手</b><p>建议从“只听右手旋律”与“慢练”开始。五线谱上方的 C、Fm 等是和弦代号，代表左手一起按下的一组音。</p><label>本次练习的和弦 <select data-song-focus>${Object.entries(study.voicings).map(([id,v])=>`<option value="${id}" ${id===focus?'selected':''}>${escape(v.label)} · ${v.names.join(' / ')}</option>`).join('')}</select></label></div><div id="song-player"></div>`;
    const player=workspace.querySelector('#song-player');
    function mount(id){
      PracticePlayer.dispose();
      const v=study.voicings[id],chord={id,song:study.config.song,name:v.label,html:escape(v.label)};
      player.innerHTML=PracticePlayer.render(chord);PracticePlayer.mount(chord,player);
    }
    workspace.querySelector('[data-song-focus]').addEventListener('change',event=>mount(event.target.value));
    mount(focus);document.title=`${study.config.song} · 乐曲练习 · CHORD`;
  }
  document.addEventListener('chord:navigate',event=>{
    if(event.detail.view==='songs'){
      if(!location.hash.startsWith('#songs'))history.pushState(null,'','#songs');
      show();
    }else{
      if(ownsPlayer){release();ownsPlayer=false;workspace.innerHTML='';}
      if(location.hash.startsWith('#songs'))history.replaceState(null,'',location.pathname+location.search);
      document.title='CHORD / 从零弹出和弦';
      if(event.detail.view==='learn'&&!document.querySelector('#lesson-panel .jt-study'))selectLesson(activeLesson.id,activeLesson.song);
    }
  });
  const openRoute=()=>{if(location.hash==='#songs'||location.hash.startsWith('#songs/'))navigate('songs');};
  window.addEventListener('hashchange',openRoute);openRoute();
})();
